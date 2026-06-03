"use strict";

/* =========================
   GLOBAL STATE
========================= */

let stream = null;
let facingMode = 'environment';

// NEW FLOW STATES
// 0 = Welcome
// 1 = Choose Mode (Camera / Upload)
// 2 = Customer Capture
// 3 = Cloth Capture
// 4 = Review

let state = 0;

let customerImage = null;
let clothImage = null;

const API_URL = 'https://ai-fashion-api.onrender.com/generate';

/* =========================
   INIT (NO CAMERA AUTO START)
========================= */

document.addEventListener('DOMContentLoaded', () => {
  showWelcome();
});

/* =========================
   SCREEN NAVIGATION SYSTEM
========================= */

function goNext() {
  state++;

  if (state === 1) showModeScreen();
  if (state === 2) showCaptureScreen('Customer Capture', 'Capture or upload your photo');
  if (state === 3) showCaptureScreen('Cloth Capture', 'Capture or upload clothing image');
  if (state === 4) showReview();

  updateDots();
}

function goBack() {
  if (state > 0) state--;

  if (state === 0) showWelcome();
  if (state === 1) showModeScreen();
  if (state === 2) showCaptureScreen('Customer Capture', 'Capture or upload your photo');
  if (state === 3) showCaptureScreen('Cloth Capture', 'Capture or upload clothing image');

  updateDots();
}

/* =========================
   1. WELCOME SCREEN
========================= */

function showWelcome() {
  const overlay = document.getElementById('overlay');

  overlay.innerHTML = `
    <div class="glass-card">
      <h1>AI Try-On Studio</h1>
      <p>Try outfits virtually with AI</p>

      <div class="actions">
        <button class="btn-primary" onclick="goNext()">Start</button>
      </div>
    </div>
  `;

  state = 0;
}

/* =========================
   2. MODE SELECTION SCREEN
========================= */

function showModeScreen() {
  const overlay = document.getElementById('overlay');

  overlay.innerHTML = `
    <div class="glass-card">
      <h2>Select Input Method</h2>

      <div class="actions">
        <button class="btn-primary" onclick="startCameraMode()">📷 Camera</button>
        <button class="btn-secondary" onclick="openUpload()">🖼 Gallery</button>
      </div>

      <div class="actions">
        <button class="btn-secondary" onclick="goBack()">⬅ Back</button>
      </div>
    </div>
  `;
}

/* =========================
   CAMERA MODE START
========================= */

function startCameraMode() {
  startCamera();
  goNext();
}

/* =========================
   3. CAPTURE SCREEN
========================= */

function showCaptureScreen(title, subtitle) {
  const overlay = document.getElementById('overlay');

  overlay.innerHTML = `
    <div class="glass-card">
      <h1>${title}</h1>
      <p>${subtitle}</p>

      <video id="video" autoplay playsinline></video>

      <div class="actions">
        <button class="btn-primary" onclick="capture()">Capture</button>
        <button class="btn-secondary" onclick="openUpload()">Upload</button>
        <button class="btn-secondary" onclick="goBack()">Back</button>
      </div>
    </div>
  `;

  startCamera();
}

/* =========================
   CAMERA ENGINE
========================= */

async function startCamera() {
  const video = document.getElementById('video');
  if (!video) return;

  try {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: false
    });

    video.srcObject = stream;
    await video.play();

  } catch (err) {
    alert("Camera not available");
  }
}

/* =========================
   CAPTURE IMAGE
========================= */

function capture() {
  const video = document.getElementById('video');
  if (!video) return;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  const img = canvas.toDataURL('image/jpeg', 0.95);

  processImage(img);
}

/* =========================
   UPLOAD FROM GALLERY
========================= */

function openUpload() {
  let input = document.getElementById('fileInput');

  if (!input) {
    input = document.createElement('input');
    input.type = 'file';
    input.id = 'fileInput';
    input.accept = 'image/*';
    input.onchange = handleUpload;
    document.body.appendChild(input);
  }

  input.click();
}

function handleUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    processImage(event.target.result);
  };

  reader.readAsDataURL(file);
}

/* =========================
   PROCESS IMAGES
========================= */

function processImage(dataURL) {
  if (!customerImage) {
    customerImage = dataURL;
    goNext(); // move to cloth capture
  } else {
    clothImage = dataURL;
    goNext(); // review screen
  }
}

/* =========================
   REVIEW SCREEN
========================= */

function showReview() {
  const overlay = document.getElementById('overlay');

  overlay.innerHTML = `
    <div class="glass-card">
      <h1>Review</h1>

      <div class="preview">
        <img src="${customerImage}" />
        <img src="${clothImage}" />
      </div>

      <div class="actions">
        <button class="btn-primary" onclick="generateAI()">Generate</button>
        <button class="btn-secondary" onclick="goBack()">Back</button>
      </div>
    </div>
  `;
}

/* =========================
   AI GENERATION
========================= */

async function generateAI() {
  const overlay = document.getElementById('overlay');

  overlay.innerHTML = `
    <div class="glass-card">
      <div class="loader"></div>
      <p>Generating AI Try-On...</p>
    </div>
  `;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personImage: customerImage,
        clothImage: clothImage
      })
    });

    const data = await res.json();

    overlay.innerHTML = `
      <div class="glass-card">
        <h1>Result</h1>
        <img src="${data.result}" class="result" />

        <div class="actions">
          <button class="btn-primary" onclick="location.reload()">New Try</button>
        </div>
      </div>
    `;

  } catch (err) {
    alert("AI failed");
  }
}

/* =========================
   DOTS (OPTIONAL)
========================= */

function updateDots() {
  document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
  const el = document.getElementById('d' + state);
  if (el) el.classList.add('active');
}

/* =========================
   GLOBAL EXPORTS
========================= */

window.goNext = goNext;
window.goBack = goBack;
window.capture = capture;
window.openUpload = openUpload;
window.generateAI = generateAI;
