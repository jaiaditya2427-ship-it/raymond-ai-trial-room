// **** Executive Summary ****
// This app.js implements a robust AI try-on flow with mobile camera, gallery upload,
// step-by-step UI, animations (Material-like ripple/fade), and error handling.
// It uses getUserMedia for front/back camera, FileReader for uploads, and Canvas to capture images.
// Vibrate API and sounds provide haptic/audio feedback, and fetch() handles API calls with OK-status checks.

"use strict";

const API_URL = "https://ai-fashion-api.onrender.com/generate";
const DEBUG = false;

// State: 1=Customer, 2=Cloth, 3=Review
let state = 1;
let stream = null;
let facingMode = 'environment';
let customerImage = null;
let clothImage = null;

// Cached elements (re-bound after DOM changes)
let fileInput = null;

// Debug logger
function log(...args) {
    if (DEBUG) console.log(...args);
}

// Init on DOM load
document.addEventListener("DOMContentLoaded", () => {
    log("DOM ready");
    // Feature-detect getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera API not supported. Upload only.");
        const video = document.getElementById("video");
        if (video) video.style.display = "none";
    } else {
        startCamera();
    }
    fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.setAttribute("capture", "environment");  // hint rear camera
        fileInput.addEventListener("change", handleUpload);
    } else {
        console.error("File input (#fileInput) missing.");
    }
    updateDots();
});

// Haptic feedback (vibration)
function vibrate(duration = 50) {
    if ("vibrate" in navigator) {
        navigator.vibrate(duration);
    }
}

// Optional click sound
function playClickSound() {
    const audio = new Audio("click.mp3");
    audio.play().catch(e => console.warn("Audio play failed:", e));
}

// Shutter flash effect
function flashEffect() {
    const flash = document.getElementById("flash");
    if (!flash) return;
    flash.classList.add("active");
    setTimeout(() => flash.classList.remove("active"), 100);
}

// Start or restart the camera stream
async function startCamera() {
    const video = document.getElementById("video");
    if (!video) return;
    try {
        // Stop old tracks if any (to ensure camera switch works)
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode } },
            audio: false
        });
        video.srcObject = stream;
        await video.play();
        log("Camera started:", facingMode);
    } catch(err) {
        console.error("Camera error:", err);
        const overlay = document.getElementById("overlay");
        if (overlay) {
            overlay.innerHTML = `
                <div class="glass-card error-card">
                  <h3>Camera Error</h3>
                  <p>${err.message}</p>
                  <button class="btn-secondary" onclick="reset()">Try Again</button>
                </div>`;
        }
    }
}

// Switch between front (user) and rear (environment) camera
async function switchCamera() {
    vibrate(50);
    playClickSound();
    facingMode = (facingMode === "environment") ? "user" : "environment";
    log("Switching camera to:", facingMode);
    // Restart camera with new facingMode
    await startCamera();
}

// Trigger the hidden file input (gallery upload)
function openUpload() {
    playClickSound();
    if (fileInput) fileInput.click();
}

// Handle image file selection
function handleUpload(event) {
    vibrate(30);
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        processImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Capture a photo from the video stream
function capture() {
    const video = document.getElementById("video");
    if (!video || video.videoWidth === 0) {
        alert("Camera not ready");
        return;
    }
    vibrate(100);
    flashEffect();
    // Draw video frame to canvas (with resizing)
    const canvas = document.createElement("canvas");
    const MAX = 1024;
    let width = video.videoWidth, height = video.videoHeight;
    if (width > height && width > MAX) {
        height = Math.floor((MAX / width) * height);
        width = MAX;
    } else if (height > width && height > MAX) {
        width = Math.floor((MAX / height) * width);
        height = MAX;
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);
    const imageData = canvas.toDataURL("image/jpeg", 0.95);
    processImage(imageData);
}

// Process image according to current step (state)
function processImage(dataUrl) {
    if (state === 1) {
        // Customer image captured or uploaded
        customerImage = dataUrl;
        state = 2;
        document.getElementById("title").textContent = "Cloth Capture";
        document.getElementById("subtitle").textContent = "Capture or upload clothing";
        updateDots();
        // (Transition effect can be added here via CSS/JS)
    }
    else if (state === 2) {
        // Clothing image captured/uploaded
        clothImage = dataUrl;
        state = 3;
        showReview();
    }
}

// Update the step indicator dots
function updateDots() {
    document.querySelectorAll(".dot").forEach(d => d.classList.remove("active"));
    const dot = document.getElementById("d" + state);
    if (dot) dot.classList.add("active");
}

// Show the review UI with both images and actions
function showReview() {
    updateDots();
    const overlay = document.getElementById("overlay");
    overlay.innerHTML = `
        <div class="glass-card">
          <h1>Review</h1>
          <div class="preview">
            <img src="${customerImage}" alt="Customer photo">
            <img src="${clothImage}" alt="Clothing photo">
          </div>
          <div class="actions">
            <button class="btn-primary" onclick="generateAI()">Generate Try-On</button>
            <button class="btn-secondary" onclick="reset()">Restart</button>
          </div>
        </div>`;
    // No new listeners needed here since buttons use inline handlers
}

// Call the AI API with the two images
async function generateAI() {
    vibrate(100);
    const overlay = document.getElementById("overlay");
    // Show loading spinner with message
    overlay.innerHTML = `
      <div class="glass-card">
        <div class="loader"></div>
        <p style="text-align:center">Generating AI try-on...</p>
      </div>`;
    updateDots();
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ personImage: customerImage, clothImage: clothImage })
        });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const data = await response.json();
        const resultURL = data.result || data.image || data.output;
        overlay.innerHTML = `
          <div class="glass-card">
            <h1>Result</h1>
            <img class="result" src="${resultURL}" alt="AI try-on result">
            <div class="actions">
              <button class="btn-primary" onclick="saveResult()">Save</button>
              <button class="btn-secondary" onclick="shareResult()">Share</button>
              <button class="btn-secondary" onclick="reset()">New Try-On</button>
            </div>
          </div>`;
        updateDots();
    } catch(err) {
        console.error("AI generation error:", err);
        overlay.innerHTML = `
          <div class="glass-card error-card">
            <h3>Generation Failed</h3>
            <p>${err.message}</p>
            <button class="btn-secondary" onclick="reset()">Try Again</button>
          </div>`;
    }
}

// Download (save) the result image
function saveResult() {
    const img = document.querySelector(".result");
    if (!img) return;
    const link = document.createElement("a");
    link.href = img.src;
    link.download = "ai-tryon.jpg";
    link.click();
}

// Share the result via Web Share API if available
function shareResult() {
    const img = document.querySelector(".result");
    if (img && navigator.share) {
        navigator.share({
            title: 'AI Try-On Result',
            text: 'Check out this AI try-on result!',
            url: img.src
        }).catch(err => console.warn("Share failed:", err));
    } else {
        alert("Share not supported on this device.");
    }
}

// Reset to initial state (customer capture)
function reset() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    state = 1;
    customerImage = null;
    clothImage = null;
    document.getElementById("title").textContent = "Customer Capture";
    document.getElementById("subtitle").textContent = "Capture customer image or upload photo";
    updateDots();
    const overlay = document.getElementById("overlay");
    overlay.innerHTML = `
      <div class="glass-card">
        <h1 id="title">Customer Capture</h1>
        <p id="subtitle">Capture customer image or upload photo</p>
        <div class="actions">
          <input type="file" id="fileInput" accept="image/*" capture="environment" hidden>
          <button class="btn-primary" onclick="capture()">Capture</button>
          <button class="btn-secondary" onclick="openUpload()">Upload</button>
        </div>
      </div>`;
    // Re-bind file input listener
    fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.addEventListener("change", handleUpload);
    startCamera();
}

// Expose for inline HTML handlers
window.capture = capture;
window.openUpload = openUpload;
window.switchCamera = switchCamera;
window.generateAI = generateAI;
window.reset = reset;
window.saveResult = saveResult;
window.shareResult = shareResult;
