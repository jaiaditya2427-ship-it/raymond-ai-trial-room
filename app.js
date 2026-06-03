// Production-Ready AI Try-On Script

// Global state
let stream = null;
let facingMode = 'environment'; // 'user' for front, 'environment' for rear
let state = 1;  // 1=Customer, 2=Cloth, 3=Review
let customerImage = null;
let clothImage = null;
const API_URL = 'https://ai-fashion-api.onrender.com/generate';  // <--- replace with your actual endpoint

// Debug flag for verbose logging
const DEBUG = false;

// Utility: Log if debug mode
function log(...args) {
  if (DEBUG) console.log(...args);
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  log('DOM loaded');
  // Check for camera API
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Camera API not supported. App will use upload only.');
    const video = document.getElementById('video');
    if (video) video.style.display = 'none';
  } else {
    startCamera();  // Initialize camera
  }

  // File input handler
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleUpload);
  } else {
    console.error('File input element not found');
  }
});

// Haptic feedback: vibrate pattern (if supported, requires user interaction)
function vibrate(pattern = 30) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// Click sound effect (requires a sound file, optional)
function playClickSound() {
  const audio = new Audio('click.mp3'); // Add a click.mp3 in your project root
  audio.play().catch(e => console.warn('Click sound error:', e));
}

// Flash effect for capture
function flashEffect() {
  const flash = document.getElementById('flash');
  if (!flash) return;
  flash.classList.add('active');
  setTimeout(() => { flash.classList.remove('active'); }, 100);
}

// Ripple effect on buttons (basic implementation)
function rippleEffect(event) {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  circle.style.width = circle.style.height = diameter + 'px';
  circle.style.left = (event.clientX - button.offsetLeft - radius) + 'px';
  circle.style.top = (event.clientY - button.offsetTop - radius) + 'px';
  circle.classList.add('ripple');
  const ripple = button.getElementsByClassName('ripple')[0];
  if (ripple) ripple.remove();
  button.appendChild(circle);
}
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', rippleEffect);
});

// Start (or restart) the camera with the current facingMode
async function startCamera() {
  const video = document.getElementById('video');
  if (!video) {
    console.error('Video element not found');
    return;
  }
  try {
    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      log('Stopped previous stream');
    }
    // Request camera
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facingMode },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    log('Camera started:', facingMode);
  } catch (err) {
    console.error('Error starting camera:', err);
    const overlay = document.getElementById('overlay');
    overlay.innerHTML = `
      <div class="glass-card error-card">
        <h3>Camera Error</h3>
        <p>${err.message}</p>
      </div>`;
  }
}

// Switch between front and rear camera
async function switchCamera() {
  vibrate(50);
  facingMode = (facingMode === 'environment') ? 'user' : 'environment';
  await startCamera();
}

// Trigger the hidden file input
function openUpload() {
  document.getElementById('fileInput').click();
}

// Handle uploaded image file
function handleUpload(event) {
  vibrate(50);
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Resize if needed (max dimension = 1024px)
      const MAX = 1024;
      let width = img.width;
      let height = img.height;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = (MAX / width) * height;
          width = MAX;
        } else {
          width = (MAX / height) * width;
          height = MAX;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataURL = canvas.toDataURL('image/jpeg', 0.95);
      processImage(dataURL);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Capture an image from the camera
function capture() {
  const video = document.getElementById('video');
  if (!video || video.videoWidth === 0) {
    alert('Camera not ready');
    return;
  }
  vibrate(50);
  flashEffect();
  // Prepare a canvas to capture frame (and resize if needed)
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
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, width, height);
  const dataURL = canvas.toDataURL('image/jpeg', 0.95);
  processImage(dataURL);
}

// Process the captured or uploaded image based on current state
function processImage(dataURL) {
  if (state === 1) {
    // First image captured/uploaded: Customer image
    customerImage = dataURL;
    state = 2;
    document.getElementById('title').textContent = 'Cloth Capture';
    document.getElementById('subtitle').textContent = 'Capture or upload clothing image';
    updateDots();
    return;
  }
  if (state === 2) {
    // Second image: Clothing image
    clothImage = dataURL;
    state = 3;
    showReview();
  }
}

// Update the progress dots (IDs d1..d3) to highlight the current step
function updateDots() {
  document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
  const dot = document.getElementById('d' + state);
  if (dot) dot.classList.add('active');
}

// Show the review screen with both images and generate/restart options
function showReview() {
  updateDots();
  const overlay = document.getElementById('overlay');
  overlay.innerHTML = `
    <div class="glass-card">
      <h1>Review</h1>
      <div class="preview">
        <img src="${customerImage}" alt="Customer Image">
        <img src="${clothImage}" alt="Clothing Image">
      </div>
      <div class="actions">
        <button class="btn-primary" onclick="generateAI()">Generate Try-On</button>
        <button class="btn-secondary" onclick="reset()">Restart</button>
      </div>
    </div>
  `;
}

// Call the AI backend to combine images
async function generateAI() {
  vibrate(100);
  const overlay = document.getElementById('overlay');
  // Show a loading state
  overlay.innerHTML = `
    <div class="glass-card">
      <div class="loader"></div>
      <p style="text-align:center">Generating AI Try-On...</p>
    </div>
  `;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ personImage: customerImage, clothImage: clothImage })
    });
    if (!response.ok) {
      throw new Error('Network response was not OK');
    }
    const data = await response.json();
    // Support different response fields
    const resultURL = data.result || data.image || data.output;
    overlay.innerHTML = `
      <div class="glass-card">
        <h1>Result</h1>
        <img class="result" src="${resultURL}" alt="Try-On Result">
        <div class="actions">
          <button class="btn-primary" onclick="location.reload()">New Try-On</button>
        </div>
      </div>
    `;
    updateDots();
  } catch (err) {
    console.error('AI generation error:', err);
    overlay.innerHTML = `
      <div class="glass-card error-card">
        <h3>Generation Failed</h3>
        <p>${err.message}</p>
        <button class="btn-secondary" onclick="reset()">Try Again</button>
      </div>
    `;
  }
}

// Reset to the initial state (Customer capture)
function reset() {
  state = 1;
  customerImage = null;
  clothImage = null;
  document.getElementById('title').textContent = 'Customer Capture';
  document.getElementById('subtitle').textContent = 'Capture customer image or upload photo';
  const overlay = document.getElementById('overlay');
  overlay.innerHTML = `
    <div class="glass-card">
      <h1 id="title">Customer Capture</h1>
      <p id="subtitle">Capture customer image or upload photo</p>
      <div class="actions">
        <input type="file" id="fileInput" accept="image/*" hidden>
        <button class="btn-primary" onclick="capture()">Capture</button>
        <button class="btn-secondary" onclick="openUpload()">Upload</button>
      </div>
    </div>
  `;
  // Re-attach the file input listener after injecting new HTML
  const newFileInput = document.getElementById('fileInput');
  if (newFileInput) newFileInput.addEventListener('change', handleUpload);
  updateDots();
  startCamera();
}

// Debug helper (inspect the current state)
function dumpState() {
  console.log({state, facingMode, customerImage, clothImage});
}

// Expose functions for onclick handlers in HTML
window.capture = capture;
window.openUpload = openUpload;
window.switchCamera = switchCamera;
window.generateAI = generateAI;
window.reset = reset;
