// Robust AI Try-On single-file script

// Global variables for state
let stream = null;
let facingMode = 'environment';  // 'environment' (rear) or 'user' (front) camera
let state = 1;                   // 1=Customer, 2=Cloth, 3=Review
let customerImage = null;
let clothImage = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
  startCamera();  // Initialize camera on load

  // Set up file input handler
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleUpload);
  } else {
    console.error('File input element (#fileInput) not found');
  }
});

// Helper: vibrate for haptic feedback (if supported and after user interaction)
function vibrate(pattern = 30) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// Start or restart the camera with the current facingMode
async function startCamera() {
  const video = document.getElementById('video');
  if (!video) {
    console.error('Video element (#video) not found');
    return;
  }
  try {
    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      console.log('Previous camera stream stopped');
    }
    // Request user media
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facingMode } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    console.log(`Camera started (${facingMode})`);
  } catch (err) {
    console.error('Failed to start camera', err);
    alert('Camera Error: ' + err.message);
  }
}

// Switch between front and rear cameras
async function switchCamera() {
  vibrate();
  facingMode = (facingMode === 'environment' ? 'user' : 'environment');
  console.log('Switching camera to', facingMode);
  await startCamera();
}

// Trigger the hidden file input for upload
function openUpload() {
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.click();
  } else {
    console.error('File input element (#fileInput) not found');
  }
}

// Handle file selection for upload (customer or cloth image)
function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  console.log('File selected:', file.name);
  const reader = new FileReader();
  reader.onload = ev => {
    processImage(ev.target.result);
  };
  reader.readAsDataURL(file);
}

// Flash effect for capture (assumes CSS with .active on #flash creates a brief white flash)
function flashEffect() {
  const flash = document.getElementById('flash');
  if (!flash) return;
  flash.classList.add('active');  // e.g. .active { opacity: 1; transition: none; }
  setTimeout(() => flash.classList.remove('active'), 150);
}

// Capture an image from the video stream
function capture() {
  const video = document.getElementById('video');
  if (!video || !video.videoWidth) {
    alert('Camera not ready');
    console.warn('Video element not ready for capture');
    return;
  }
  vibrate(50);
  flashEffect();

  // Draw video frame to canvas
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert to JPEG data URL
  const imageData = canvas.toDataURL('image/jpeg', 0.95);
  processImage(imageData);
}

// Process the captured or uploaded image according to the current step
function processImage(imageData) {
  if (state === 1) {
    // Customer image captured
    customerImage = imageData;
    state = 2;
    console.log('Customer image captured, moving to Cloth Capture');
    // Update UI text for next step
    const title = document.getElementById('title');
    const subtitle = document.getElementById('subtitle');
    if (title) title.textContent = 'Cloth Capture';
    if (subtitle) subtitle.textContent = 'Capture or upload garment image';
    updateDots();
    return;
  }
  if (state === 2) {
    // Cloth image captured
    clothImage = imageData;
    state = 3;
    console.log('Cloth image captured, moving to Review');
    showReview();
    return;
  }
}

// Update the dot indicators (assumes CSS .active highlights the dot)
function updateDots() {
  document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
  const activeDot = document.getElementById('d' + state);
  if (activeDot) {
    activeDot.classList.add('active');
  }
}

// Show the review overlay with both images and action buttons
function showReview() {
  updateDots();
  const overlay = document.getElementById('overlay');
  if (!overlay) {
    console.error('Overlay element (#overlay) not found');
    return;
  }
  // Build the review HTML (glass-card, images, Generate/Restart buttons)
  overlay.innerHTML = `
    <div class="glass-card">
      <h1>Review</h1>
      <div class="preview">
        <img src="${customerImage}" alt="Customer Photo">
        <img src="${clothImage}" alt="Cloth Photo">
      </div>
      <div class="actions">
        <button class="btn-primary" onclick="generateAI()">Generate</button>
        <button class="btn-secondary" onclick="location.reload()">Restart</button>
      </div>
    </div>
  `;
  console.log('Review screen displayed');
}

// Call the AI backend to generate the try-on result
async function generateAI() {
  const overlay = document.getElementById('overlay');
  if (!overlay) {
    console.error('Overlay element (#overlay) not found');
    return;
  }
  // Show loading indicator
  overlay.innerHTML = `
    <div class="glass-card">
      <div class="loader"></div>
      <p style="text-align:center">Generating AI Try-On...</p>
    </div>
  `;
  console.log('Sending images to AI backend');
  const API_URL = 'https://ai-fashion-api.onrender.com/generate'; // Provided backend URL
  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personImage: customerImage, clothImage: clothImage }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    const data = await response.json();
    const result = data.result || data.output || data.image || '';
    if (!result) {
      throw new Error('Empty response from AI service');
    }
    console.log('AI generation successful, displaying result');
    // Display result image
    overlay.innerHTML = `
      <div class="glass-card">
        <h1>Result</h1>
        <img class="result" src="${result}" alt="AI Try-On Result">
        <div class="actions">
          <button class="btn-primary" onclick="location.reload()">Start Again</button>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('AI generation failed:', err);
    overlay.innerHTML = `
      <div class="glass-card error-card">
        <h3>Generation Failed</h3>
        <p>${err.message}</p>
        <button class="btn-secondary" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }
}

// Expose functions globally (the HTML uses these names)
window.capture = capture;
window.openUpload = openUpload;
window.switchCamera = switchCamera;
window.generateAI = generateAI;
