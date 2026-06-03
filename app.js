let stream = null;
let currentFacingMode = "environment";
let state = 1;

let customerImage = "";
let clothImage = "";

async function startCamera() {
try {
if (stream) {
stream.getTracks().forEach(t => t.stop());
}

```
stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: currentFacingMode },
  audio: false
});

const video = document.getElementById("video");
video.srcObject = stream;
await video.play();
```

} catch (err) {
console.error("Camera error:", err);
alert("Unable to access camera.");
}
}

async function switchCamera() {
currentFacingMode =
currentFacingMode === "environment" ? "user" : "environment";

await startCamera();
}

function openUpload() {
document.getElementById("fileInput").click();
}

document.getElementById("fileInput").addEventListener("change", (e) => {
const file = e.target.files[0];
if (!file) return;

const reader = new FileReader();

reader.onload = (ev) => {
if (state === 1) {
customerImage = ev.target.result;
state = 2;
updateUI();
} else if (state === 2) {
clothImage = ev.target.result;
state = 3;
updateUI();
}
};

reader.readAsDataURL(file);
});

function capture() {
if (!stream) return;

const video = document.getElementById("video");

const canvas = document.createElement("canvas");
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const ctx = canvas.getContext("2d");
ctx.drawImage(video, 0, 0);

const image = canvas.toDataURL("image/jpeg", 0.9);

if (state === 1) {
customerImage = image;
state = 2;
} else if (state === 2) {
clothImage = image;
state = 3;
}

updateUI();
}

function updateUI() {
document.querySelectorAll(".dot").forEach(d => d.classList.remove("active"));

const dot = document.getElementById("d" + state);
if (dot) dot.classList.add("active");

const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const overlay = document.getElementById("overlay");

if (state === 1) {
title.innerText = "Customer Capture";
subtitle.innerText = "Capture customer image or upload photo";
}

if (state === 2) {
title.innerText = "Cloth Capture";
subtitle.innerText = "Capture garment image or upload photo";
}

if (state === 3) {
overlay.innerHTML = `       <div class="glass-card">         <h1>Review</h1>         <div class="preview">           <img src="${customerImage}">           <img src="${clothImage}">         </div>         <button class="btn-primary" onclick="generateAI()">Generate</button>       </div>
    `;
}
}

async function generateAI() {
const overlay = document.getElementById("overlay");

overlay.innerHTML = `     <div class="glass-card">       <div class="loader"></div>       <p>Generating...</p>     </div>
  `;

try {
const res = await fetch(
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

```
const data = await res.json();

overlay.innerHTML = `
  <div class="glass-card">
    <h1>Result</h1>
    <img class="result" src="${data.result || data.image || ''}">
  </div>
`;
```

} catch (err) {
console.error(err);

```
overlay.innerHTML = `
  <div class="error-card">
    AI generation failed
  </div>
`;
```

}
}

startCamera();
updateUI();
