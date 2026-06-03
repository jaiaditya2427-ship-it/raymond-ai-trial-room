let stream = null;
let facingMode = "environment";

let state = 1;
let customerImage = null;
let clothImage = null;

const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const fileInput = document.getElementById("fileInput");

function vibrate() {
if (navigator.vibrate) {
navigator.vibrate(30);
}
}

async function startCamera() {
try {
if (stream) {
stream.getTracks().forEach(track => track.stop());
}

```
stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: facingMode
  },
  audio: false
});

video.srcObject = stream;
await video.play();
```

} catch (err) {
console.error(err);

```
overlay.innerHTML = `
  <div class="glass-card">
    <h1>Camera Error</h1>
    <p>Please allow camera access.</p>
  </div>
`;
```

}
}

async function switchCamera() {
vibrate();

facingMode =
facingMode === "environment"
? "user"
: "environment";

await startCamera();
}

function openUpload() {
fileInput.click();
}

fileInput.addEventListener("change", (e) => {
const file = e.target.files[0];

if (!file) return;

const reader = new FileReader();

reader.onload = (ev) => {
processImage(ev.target.result);
};

reader.readAsDataURL(file);
});

function capture() {
vibrate();

const canvas = document.createElement("canvas");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const ctx = canvas.getContext("2d");

ctx.drawImage(video, 0, 0);

const image = canvas.toDataURL("image/jpeg", 0.9);

processImage(image);
}

function processImage(image) {
if (state === 1) {
customerImage = image;
state = 2;

```
document.getElementById("title").textContent =
  "Cloth Capture";

document.getElementById("subtitle").textContent =
  "Capture or upload garment photo";

updateDots();
return;
```

}

if (state === 2) {
clothImage = image;
state = 3;

```
showReview();
```

}
}

function updateDots() {
document
.querySelectorAll(".dot")
.forEach(dot => dot.classList.remove("active"));

const active = document.getElementById("d" + state);

if (active) active.classList.add("active");
}

function showReview() {
updateDots();

overlay.innerHTML = `

  <div class="glass-card">
      <h1>Review</h1>

```
  <div class="preview">
      <img src="${customerImage}">
      <img src="${clothImage}">
  </div>

  <div class="actions">
      <button class="btn-primary"
        onclick="generateAI()">
        Generate
      </button>

      <button class="btn-secondary"
        onclick="location.reload()">
        Restart
      </button>
  </div>
```

  </div>
  `;
}

async function generateAI() {

overlay.innerHTML = `

  <div class="glass-card">
      <div class="loader"></div>
      <p style="text-align:center">
      Generating AI Try-On...
      </p>
  </div>
  `;

try {

```
const response = await fetch(
  "https://ai-fashion-api.onrender.com/generate",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personImage: customerImage,
      clothImage: clothImage
    })
  }
);

const data = await response.json();

const resultImage =
  data.result ||
  data.image ||
  data.output ||
  "";

overlay.innerHTML = `
  <div class="glass-card">

    <h1>Result</h1>

    <img
      class="result"
      src="${resultImage}"
    >

    <div class="actions">

      <button
        class="btn-primary"
        onclick="location.reload()">
        Try Again
      </button>

    </div>

  </div>
`;
```

} catch (err) {

```
console.error(err);

overlay.innerHTML = `
  <div class="error-card">

    <h3>Generation Failed</h3>

    <p>
    Backend unavailable or API error.
    </p>

  </div>
`;
```

}
}

startCamera();
updateDots();
