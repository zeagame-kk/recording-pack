import { initDB, addVideo, updateVideo, searchVideos, getAllVideos } from './db.js';
import { initDriveAuth, requestAuth, isAuthenticated, uploadVideoBlob, getClientId, setClientId } from './drive.js';

// --- DOM Elements ---
const rawVideo = document.getElementById('raw-video');
const canvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');
const orderInput = document.getElementById('order-input');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const recordingIndicator = document.getElementById('recording-indicator');
const durationDisplay = document.getElementById('duration-display');
const uploadStatus = document.getElementById('upload-status');
const uploadText = document.getElementById('upload-text');
const historyList = document.getElementById('history-list');
const searchInput = document.getElementById('search-input');
const authBtn = document.getElementById('auth-btn');
const authStatus = document.getElementById('auth-status');
const cameraPlaceholder = document.getElementById('camera-placeholder');

// Settings Modal
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const clientIdInput = document.getElementById('client-id-input');

// --- State ---
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let startTime = null;
let durationInterval = null;
let animationFrameId = null;

// --- Initialize ---
async function init() {
    // 1. Setup Canvas loop (runs continuously, will draw video when available)
    drawCanvas();

    // 2. Setup Google Auth
    initDriveAuth((isAuth) => {
        if (isAuth) {
            authStatus.textContent = "Authenticated";
            authStatus.className = "status-badge success";
            authBtn.style.display = "none";
        } else {
            authStatus.textContent = "Not Authenticated";
            authStatus.className = "status-badge warning";
            authBtn.style.display = "block";
        }
    });

    // 3. Load History
    await renderHistory();

    // 4. Event Listeners
    orderInput.addEventListener('input', handleOrderInput);
    orderInput.addEventListener('keydown', handleEnterKey);
    startBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
    searchInput.addEventListener('input', handleSearch);
    authBtn.addEventListener('click', () => requestAuth());

    // Settings Modal Listeners
    settingsBtn.addEventListener('click', () => {
        clientIdInput.value = getClientId();
        settingsModal.classList.remove('hidden');
    });
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });
    saveSettingsBtn.addEventListener('click', () => {
        const val = clientIdInput.value.trim();
        setClientId(val);
        settingsModal.classList.add('hidden');
    });
}

// --- Canvas Drawing Loop ---
function drawCanvas() {
    if (rawVideo.readyState === rawVideo.HAVE_ENOUGH_DATA) {
        // Draw video frame
        ctx.drawImage(rawVideo, 0, 0, canvas.width, canvas.height);

        // Draw Overlay (Order No & Time)
        drawOverlay();
    }
    
    // Loop
    animationFrameId = requestAnimationFrame(drawCanvas);
}

function drawOverlay() {
    const orderText = orderInput.value.trim() ? `Order : ${orderInput.value.trim()}` : 'Order : -';
    
    // Format Time: YYYY-MM-DD HH:MM:SS
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const timeText = `${dateStr} ${timeStr}`;

    ctx.save();
    
    // Background for text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(canvas.width - 320, canvas.height - 110, 300, 90);
    
    // Text Settings
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'left';
    
    // Draw Text
    ctx.fillText(orderText, canvas.width - 300, canvas.height - 65);
    ctx.font = '20px Inter, sans-serif';
    ctx.fillText(timeText, canvas.width - 300, canvas.height - 35);
    
    // If recording, draw red border indicator
    if (isRecording) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
    }
    
    ctx.restore();
}

// --- Recording Logic ---
function handleOrderInput() {
    startBtn.disabled = orderInput.value.trim().length === 0;
}

function handleEnterKey(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (orderInput.value.trim().length > 0 && !isRecording) {
            startRecording();
        }
    }
}

async function startRecording() {
    const orderNo = orderInput.value.trim();
    if (!orderNo) return;

    recordedChunks = [];
    
    // UI Updates to loading state
    startBtn.disabled = true;
    orderInput.disabled = true;
    uploadStatus.classList.add('hidden');
    cameraPlaceholder.innerHTML = '📸 <span>Starting Camera...</span>';
    
    try {
        // Request Camera ONLY on start
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, frameRate: 15 },
            audio: false 
        });
        
        rawVideo.srcObject = stream;
        await rawVideo.play();
        
        cameraPlaceholder.classList.add('hidden');
        
        // Setup MediaRecorder
        const canvasStream = canvas.captureStream(15);
        let mimeType = 'video/webm; codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm; codecs=vp8';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm'; 
            }
        }

        mediaRecorder = new MediaRecorder(canvasStream, {
            mimeType: mimeType,
            videoBitsPerSecond: 2500000 
        });

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => handleRecordingStop(orderNo);

        mediaRecorder.start();
        isRecording = true;
        startTime = Date.now();
        
        // Final UI Updates
        stopBtn.disabled = false;
        recordingIndicator.classList.remove('hidden');
        durationInterval = setInterval(updateDuration, 1000);
        updateDuration();

    } catch (err) {
        console.error("Camera Error:", err);
        alert("Cannot start recording: " + err.message);
        startBtn.disabled = false;
        orderInput.disabled = false;
        cameraPlaceholder.innerHTML = '📸 <span>Camera Error. Please try again.</span>';
    }
}

function updateDuration() {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const m = String(Math.floor(diff / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    durationDisplay.textContent = `${m}:${s}`;
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        clearInterval(durationInterval);
        
        // Stop Webcam
        const stream = rawVideo.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            rawVideo.srcObject = null;
        }
        
        // UI Updates
        startBtn.disabled = false;
        stopBtn.disabled = true;
        recordingIndicator.classList.add('hidden');
        cameraPlaceholder.classList.remove('hidden');
        cameraPlaceholder.innerHTML = '📸 <span>Waiting for Order Scan...</span>';
        
        // Clear canvas to black
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

async function handleRecordingStop(orderNo) {
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    const endTime = new Date();
    const startDateTime = new Date(startTime);
    
    // Generate File Name: YYYY_MM_DD_ORDERNO.webm
    const yyyy = startDateTime.getFullYear();
    const mm = String(startDateTime.getMonth() + 1).padStart(2, '0');
    const dd = String(startDateTime.getDate()).padStart(2, '0');
    // Sanitize orderNo for filename
    const safeOrderNo = orderNo.replace(/[^a-zA-Z0-9-]/g, '_');
    const fileName = `${yyyy}_${mm}_${dd}_${safeOrderNo}.webm`; // Using webm as it's native to browser MediaRecorder

    const blob = new Blob(recordedChunks, { type: 'video/webm' });

    // Save to Local DB
    const videoData = {
        order_no: orderNo,
        file_name: fileName,
        drive_file_id: null,
        drive_url: null,
        start_time: startDateTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds,
        status: 'UPLOADING'
    };

    const recordId = await addVideo(videoData);
    await renderHistory();

    // Upload to Google Drive
    await startUploadFlow(recordId, blob, fileName, startDateTime);
}

// --- Upload Logic ---
async function startUploadFlow(recordId, blob, fileName, dateObj) {
    uploadStatus.classList.remove('hidden', 'success', 'error');
    uploadStatus.querySelector('.spinner').style.display = 'block';
    uploadText.textContent = `Uploading ${fileName}...`;

    if (!isAuthenticated()) {
        await updateVideo(recordId, { status: 'FAILED' });
        uploadStatus.classList.add('error');
        uploadStatus.querySelector('.spinner').style.display = 'none';
        uploadText.textContent = 'Upload Failed: Not Authenticated. Please Sign In.';
        await renderHistory();
        orderInput.disabled = false;
        return;
    }

    try {
        const driveInfo = await uploadVideoBlob(blob, fileName, dateObj);
        
        // Update DB
        await updateVideo(recordId, {
            status: 'SUCCESS',
            drive_file_id: driveInfo.id,
            drive_url: driveInfo.url
        });
        
        // UI Success
        uploadStatus.classList.add('success');
        uploadStatus.querySelector('.spinner').style.display = 'none';
        uploadText.textContent = 'Upload Complete ✅';
        
        // Clear input for next order
        orderInput.value = '';
        orderInput.disabled = false;
        handleOrderInput(); // update start button state
        
    } catch (err) {
        console.error("Upload error", err);
        // Update DB
        await updateVideo(recordId, { status: 'FAILED' });
        
        // UI Error
        uploadStatus.classList.add('error');
        uploadStatus.querySelector('.spinner').style.display = 'none';
        uploadText.textContent = 'Upload Failed ❌';
        orderInput.disabled = false;
    }

    await renderHistory();
}

// --- History UI ---
async function handleSearch() {
    await renderHistory(searchInput.value.trim());
}

async function renderHistory(query = '') {
    const videos = await searchVideos(query);
    historyList.innerHTML = '';

    if (videos.length === 0) {
        historyList.innerHTML = `<div class="empty-state">No videos found.</div>`;
        return;
    }

    let currentDateGroup = null;

    videos.forEach(v => {
        // Group by Date (YYYY-MM-DD)
        const dateStr = v.created_at.split('T')[0];
        if (dateStr !== currentDateGroup) {
            currentDateGroup = dateStr;
            const dateHeader = document.createElement('div');
            dateHeader.className = 'history-date-group';
            dateHeader.textContent = dateStr;
            historyList.appendChild(dateHeader);
        }

        const item = document.createElement('div');
        item.className = 'history-item';
        
        const m = String(Math.floor(v.duration_seconds / 60)).padStart(2, '0');
        const s = String(v.duration_seconds % 60).padStart(2, '0');
        
        const statusClass = v.status.toLowerCase();

        item.innerHTML = `
            <div class="history-item-header">
                <span class="history-order">${v.order_no}</span>
                <span class="history-status ${statusClass}">${v.status}</span>
            </div>
            <div class="history-meta">
                <span>Duration: ${m}:${s}</span>
                <span>${v.file_name}</span>
            </div>
            <div class="history-action">
                ${v.drive_url ? `<a href="${v.drive_url}" target="_blank" class="btn-link">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    Open in Drive
                </a>` : ''}
            </div>
        `;
        
        historyList.appendChild(item);
    });
}

// Start App
window.addEventListener('DOMContentLoaded', init);
