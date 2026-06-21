// db.js - IndexedDB Wrapper for Packing Recorder Lite

const DB_NAME = 'PackingRecorderDB';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

let dbInstance = null;

/**
 * Initialize and open IndexedDB
 */
export function initDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('order_no', 'order_no', { unique: false });
                store.createIndex('created_at', 'created_at', { unique: false });
            }
        };
    });
}

/**
 * Add a new video record
 */
export async function addVideo(videoData) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const record = {
            ...videoData,
            created_at: new Date().toISOString()
        };

        const request = store.add(record);

        request.onsuccess = (event) => {
            resolve(event.target.result); // Returns the newly generated ID
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

/**
 * Update a video record after upload
 */
export async function updateVideo(id, updates) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const getRequest = store.get(id);
        
        getRequest.onsuccess = (event) => {
            const data = event.target.result;
            if (!data) {
                reject(new Error('Record not found'));
                return;
            }

            const updatedData = { ...data, ...updates };
            const putRequest = store.put(updatedData);

            putRequest.onsuccess = () => resolve(updatedData);
            putRequest.onerror = (e) => reject(e.target.error);
        };

        getRequest.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

/**
 * Get all videos, sorted by created_at descending
 */
export async function getAllVideos() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = (event) => {
            const data = event.target.result;
            // Sort by created_at descending
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            resolve(data);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

/**
 * Search videos by order_no
 */
export async function searchVideos(query) {
    if (!query) return getAllVideos();
    
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = (event) => {
            const data = event.target.result;
            const lowerQuery = query.toLowerCase();
            const filtered = data.filter(v => v.order_no.toLowerCase().includes(lowerQuery));
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            resolve(filtered);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}
