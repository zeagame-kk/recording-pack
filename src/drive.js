// Get Client ID from LocalStorage or use the default one
export function getClientId() {
    return localStorage.getItem('google_client_id') || '277747309803-jvqfskqkehph1mmnamjbdh04vuagbj4m.apps.googleusercontent.com';
}

export function setClientId(id) {
    localStorage.setItem('google_client_id', id);
    window.location.reload(); // Reload to re-initialize GAPI with new ID
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// ID of the root Shared Folder provided by the user
const ROOT_FOLDER_ID = '1uKbeRbBONdq1aFMwIs94yfd4WXwG_fCj';

let tokenClient;
let accessToken = null;

export function initDriveAuth(onStatusChange) {
    const clientId = getClientId();
    if (!clientId) {
        console.warn('No Google Client ID configured.');
        onStatusChange(false);
        return;
    }

    // Initialize GAPI client
    gapi.load('client', async () => {
        try {
            await gapi.client.init({
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            });
            console.log('GAPI client initialized');
        } catch (e) {
            console.error('Error initializing GAPI client', e);
        }
    });

    // Initialize Google Identity Services
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (response) => {
            if (response.error !== undefined) {
                console.error(response);
                onStatusChange(false);
                return;
            }
            accessToken = response.access_token;
            console.log('Access token acquired');
            onStatusChange(true);
        },
    });

    // Try to auto-login silently if already logged in previously
    setTimeout(() => {
        if (!accessToken && tokenClient) {
            // Attempt silent login
            tokenClient.requestAccessToken({ prompt: '' });
        }
    }, 1000);
}

export function requestAuth() {
    const clientId = getClientId();
    if (!clientId) {
        alert("Please click '⚙️ Setup' to configure your Google Client ID first!");
        return;
    }
    
    if (tokenClient) {
        if (accessToken) {
            // Already have token, maybe refresh?
            tokenClient.requestAccessToken({prompt: ''});
        } else {
            tokenClient.requestAccessToken({prompt: 'consent'});
        }
    }
}

export function isAuthenticated() {
    return !!accessToken;
}

/**
 * Find a folder by name inside a specific parent folder
 */
async function findFolder(name, parentId) {
    const query = `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const response = await gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive'
    });
    
    const files = response.result.files;
    if (files && files.length > 0) {
        return files[0].id;
    }
    return null;
}

/**
 * Create a folder inside a specific parent folder
 */
async function createFolder(name, parentId) {
    const fileMetadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [parentId]
    };
    
    const response = await gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id'
    });
    
    return response.result.id;
}

/**
 * Get or create folder, returning its ID
 */
async function getOrCreateFolder(name, parentId) {
    let folderId = await findFolder(name, parentId);
    if (!folderId) {
        folderId = await createFolder(name, parentId);
    }
    return folderId;
}

/**
 * Ensure the YYYY/MM/DD structure exists and return the DD folder ID
 */
async function ensureDateFolders(dateObj) {
    const year = dateObj.getFullYear().toString();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    
    console.log(`Checking Drive folders for: ${year}/${month}/${day}`);
    
    // 1. Year
    const yearFolderId = await getOrCreateFolder(year, ROOT_FOLDER_ID);
    
    // 2. Month
    const monthFolderId = await getOrCreateFolder(month, yearFolderId);
    
    // 3. Day
    const dayFolderId = await getOrCreateFolder(day, monthFolderId);
    
    return dayFolderId;
}

/**
 * Upload a Video Blob to Google Drive
 */
export async function uploadVideoBlob(blob, fileName, dateObj) {
    if (!accessToken) {
        throw new Error("Not authenticated to Google Drive");
    }

    // 1. Ensure folder exists
    const targetFolderId = await ensureDateFolders(dateObj);

    // 2. Prepare multipart body
    const metadata = {
        name: fileName,
        parents: [targetFolderId],
        mimeType: blob.type
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    // 3. Upload using fetch
    console.log(`Uploading ${fileName} to folder ${targetFolderId}...`);
    
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
        body: form,
    });

    if (!response.ok) {
        const err = await response.json();
        console.error('Upload failed:', err);
        throw new Error('Upload failed: ' + response.statusText);
    }

    const result = await response.json();
    console.log('Upload complete:', result);
    
    return {
        id: result.id,
        url: result.webViewLink
    };
}
