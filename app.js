// app.js - Production-ready AI Try-On client script
// ------------------------------------------------
// Features: Handles camera start/stop, front/back camera switching, image capture from camera or file upload (gallery), image resizing (max 1024px), review screen with retake buttons, robust error handling, loading spinner, share/download result, accessible UI, and fallbacks if camera is unavailable (upload-only).
// Integration notes: Expects HTML elements with IDs video, overlay, fileInput, flash, switchCam, and dots d1..d4. Functions capture(), openUpload(), switchCamera(), generateAI(), reset(), retakeCloth() are exposed for HTML onclick handlers. Requires HTTPS (getUserMedia only works in secure context).
// Debug: Set DEBUG=true to enable console.log (log()) for tracing.

// Global state
let stream = null;
let facingMode = "environment"; // 'user' for front-facing, 'environment' for rear
let state = 1;                  // 1=Customer image, 2=Cloth image, 3=Review/Generate
let customerImage = null;
let clothImage = null;
const API_URL = "https://ai-fashion-api.onrender.com/generate"; // Backend endpoint (expects { personImage, clothImage } JSON)

// Debug flag
const DEBUG = false;
function log(...args) {
  if (DEBUG) console.log(...args);
}

document.addEventListener("DOMContentLoaded", async () => {
  // Setup file input listener (for upload)
  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", handleUpload);
  } else {
    console.error("fileInput element not found");
  }
  // Attempt to start camera if supported
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      await startCamera();
    } catch (err) {
      console.warn("Camera unavailable, falling back to upload only", err);
    }
  } else {
    alert("Camera API not supported on this device. Please use image upload.");
    log("Navigator.mediaDevices.getUserMedia not available");
  }
  updateDots();
});

// Vibrate for haptic feedback (optional)
function vibrate(pattern = 30) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// Flash effect overlay when capturing
function flashEffect() {
  const flash = document.getElementById("flash");
  if (!flash) return;
  flash.classList.add("active");
  setTimeout(() => flash.classList.remove("active"), 150);
}

// Optional ripple effect on buttons
function rippleEffect(event) {
  const button = event.currentTarget;
  const circle = document.createElement("span");
  const d = Math.max(button.clientWidth, button.clientHeight);
  circle.style.width = circle.style.height = d + "px";
  const rect = button.getBoundingClientRect();
  circle.style.left = event.clientX - rect.left - d/2 + "px";
  circle.style.top = event.clientY - rect.top - d/2 + "px";
  circle.className = "ripple";
  const ripple = button.getElementsByClassName("ripple")[0];
  if (ripple) ripple.remove(); // remove existing ripple
  button.appendChild(circle);
}
document.querySelectorAll("button").forEach(btn => btn.addEventListener("click", rippleEffect));

// Start (or restart) camera with current facingMode
async function startCamera() {
  const video = document.getElementById("video");
  if (!video) {
    console.error("video element not found");
    return;
  }
  // Stop any existing stream
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    log("Stopped existing video stream");
  }
  try {
    // Request camera access (HTTPS only)
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facingMode } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    log("Camera stream started with facingMode =", facingMode);
  } catch (err) {
    console.error("Error starting camera:", err);
    // Show error in overlay card
    const overlay = document.getElementById("overlay");
    overlay.innerHTML = `
      <div class="glass-card error-card">
        <h3>Camera Unavailable</h3>
        <p>${err.name}: ${err.message}</p>
      </div>`;
    throw err;
  }
}

// Switch front/rear camera (toggle facingMode)
async function switchCamera() {
  vibrate(50);
  facingMode = (facingMode === "environment") ? "user" : "environment";
  log("Switching camera to", facingMode);
  await startCamera();
}

// Trigger hidden file input (for upload)
function openUpload() {
  const fileInput = document.getElementById("fileInput");
  if (fileInput) fileInput.click();
}

// Handle file selection from upload (customer or cloth)
function handleUpload(e) {
  vibrate(50);
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    processImage(ev.target.result);
    // Clear file input for future use
    e.target.value = "";
  };
  reader.readAsDataURL(file); // Read file as base64 data URL
}

// Capture image from video element (camera)
function capture() {
  const video = document.getElementById("video");
  if (!video || video.videoWidth === 0) {
    alert("Camera not ready");
    return;
  }
  vibrate(50);
  flashEffect();
  // Compute resize (max dimension 1024px) to reduce upload size
  const MAX = 1024;
  let width = video.videoWidth;
  let height = video.videoHeight;
  if (width > MAX || height > MAX) {
    if (width > height) {
      height = (MAX / width) * height;
      width = MAX;
    } else {
      width = (MAX / height) * width;
      height = MAX;
    }
  }
  // Draw video frame to canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, width, height);
  const imageData = canvas.toDataURL("image/jpeg", 0.95);
  processImage(imageData);
}

// Process captured or uploaded image per current state
function processImage(dataURL) {
  if (state === 1) {
    // Customer image step complete
    customerImage = dataURL;
    state = 2;
    document.getElementById("title").textContent = "Cloth Capture";
    document.getElementById("subtitle").textContent = "Capture or upload cloth";
    updateDots();
    log("Customer image captured/uploaded, proceed to cloth step");
    return;
  }
  if (state === 2) {
    // Cloth image step complete
    clothImage = dataURL;
    state = 3;
    updateDots();
    log("Cloth image captured/uploaded, showing review");
    showReview();
  }
}

// Update progress dots (IDs d1..d4) to reflect current state
function updateDots() {
  document.querySelectorAll(".dot").forEach(d => d.classList.remove("active"));
  const dot = document.getElementById("d" + state);
  if (dot) dot.classList.add("active");
}

// Display review screen with images and actions
function showReview() {
  const overlay = document.getElementById("overlay");
  overlay.innerHTML = `
    <div class="glass-card">
      <h1>Review</h1>
      <div class="preview">
        <div>
          <img src="${customerImage}" alt="Customer Image">
          <button class="btn-secondary" onclick="reset()">Retake Customer</button>
        </div>
        <div>
          <img src="${clothImage}" alt="Clothing Image">
          <button class="btn-secondary" onclick="retakeCloth()">Retake Clothing</button>
        </div>
      </div>
      <div class="actions">
        <button class="btn-primary" onclick="generateAI()">Generate Try-On</button>
        <button class="btn-secondary" onclick="reset()">Restart</button>
      </div>
    </div>`;
}

// Trigger AI backend to generate try-on result
async function generateAI() {
  vibrate(100);
  const overlay = document.getElementById("overlay");
  overlay.innerHTML = `
    <div class="glass-card">
      <div class="loader"></div>
      <p style="text-align:center">Generating...</p>
    </div>`;
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personImage: customerImage, clothImage: clothImage })
    });
    const data = await response.json();
    const resultURL = data.result || data.image || data.output || "";
    log("Received AI result URL:", resultURL);
    overlay.innerHTML = `
      <div class="glass-card">
        <h1>Result</h1>
        <img class="result" src="${resultURL}" alt="AI Try-On Result">
        <div class="actions">
          <button class="btn-secondary" onclick="downloadImage('${resultURL}')">Download</button>
          <button class="btn-secondary" onclick="shareResult('${resultURL}')">Share</button>
          <button class="btn-primary" onclick="reset()">New Try-On</button>
        </div>
      </div>`;
    updateDots();
  } catch (err) {
    console.error("AI generation error:", err);
    document.getElementById("overlay").innerHTML = `
      <div class="glass-card error-card">
        <h3>Generation Failed</h3>
        <p>${err.message}</p>
        <button class="btn-secondary" onclick="reset()">Try Again</button>
      </div>`;
  }
}

// Download the result image
function downloadImage(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "tryon_result.jpg";
  a.click();
}

// Share the result image (Web Share API if available)
async function shareResult(url) {
  if (navigator.share) {
    try {
      await navigator.share({ title: "AI Try-On Result", url: url });
      log("Shared successfully");
    } catch (err) {
      console.warn("Share canceled or failed:", err);
    }
  } else {
    alert("Share not supported. Copy the URL or download the image.");
  }
}

// Reset to initial state (Customer capture)
function reset() {
  state = 1;
  customerImage = null;
  clothImage = null;
  // Rebuild initial overlay content
  const overlay = document.getElementById("overlay");
  overlay.innerHTML = `
    <div class="glass-card">
      <h1 id="title">Customer Capture</h1>
      <p id="subtitle">Capture customer image or upload photo</p>
      <div class="actions">
        <input type="file" accept="image/*" id="fileInput" hidden>
        <button class="btn-primary" onclick="capture()">Capture</button>
        <button class="btn-secondary" onclick="openUpload()">Upload</button>
      </div>
    </div>`;
  // Re-attach file input listener
  const newInput = document.getElementById("fileInput");
  if (newInput) newInput.addEventListener("change", handleUpload);
  updateDots();
  // Try to restart camera
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    startCamera().catch(err => console.warn("Camera restart failed:", err));
  }
}

// Retake clothing image while preserving customer image
function retakeCloth() {
  state = 2;
  // Rebuild cloth capture overlay (like state=2 interface)
  const overlay = document.getElementById("overlay");
  overlay.innerHTML = `
    <div class="glass-card">
      <h1 id="title">Cloth Capture</h1>
      <p id="subtitle">Capture or upload cloth</p>
      <div class="actions">
        <input type="file" accept="image/*" id="fileInput" hidden>
        <button class="btn-primary" onclick="capture()">Capture</button>
        <button class="btn-secondary" onclick="openUpload()">Upload</button>
      </div>
    </div>`;
  const newInput = document.getElementById("fileInput");
  if (newInput) newInput.addEventListener("change", handleUpload);
  updateDots();
}

window.capture = capture;
window.openUpload = openUpload;
window.switchCamera = switchCamera;
window.generateAI = generateAI;
window.reset = reset;
window.retakeCloth = retakeCloth;
window.downloadImage = downloadImage;
window.shareResult = shareResult;
