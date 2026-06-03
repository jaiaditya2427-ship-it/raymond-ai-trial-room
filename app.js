let stream = null;
let facingMode = "environment";

let state = 1;
let customerImage = "";
let clothImage = "";

const API_URL =
"https://ai-fashion-api.onrender.com/generate";

document.addEventListener("DOMContentLoaded", () => {

startCamera();

const fileInput =
document.getElementById("fileInput");

fileInput.addEventListener(
"change",
handleUpload
);

});

function vibrate(ms = 30) {
if (navigator.vibrate) {
navigator.vibrate(ms);
}
}

async function startCamera() {

try {

```
const video =
  document.getElementById("video");

if (stream) {
  stream
    .getTracks()
    .forEach(track => track.stop());
}

stream =
  await navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode
      },
      audio: false
    });

video.srcObject = stream;

await video.play();
```

} catch (err) {

```
alert(
  "Camera Error: " +
  err.message
);

console.error(err);
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
document
.getElementById("fileInput")
.click();
}

function handleUpload(e) {

const file = e.target.files[0];

if (!file) return;

const reader =
new FileReader();

reader.onload = ev => {
processImage(
ev.target.result
);
};

reader.readAsDataURL(file);
}

function flashEffect() {

const flash =
document.getElementById("flash");

if (!flash) return;

flash.classList.add("active");

setTimeout(() => {
flash.classList.remove(
"active"
);
}, 150);
}

function capture() {

vibrate(50);
flashEffect();

const video =
document.getElementById("video");

const canvas =
document.createElement(
"canvas"
);

canvas.width =
video.videoWidth;

canvas.height =
video.videoHeight;

const ctx =
canvas.getContext("2d");

ctx.drawImage(
video,
0,
0
);

const image =
canvas.toDataURL(
"image/jpeg",
0.95
);

processImage(image);
}

function processImage(image) {

if (state === 1) {

```
customerImage = image;
state = 2;

document.getElementById(
  "title"
).textContent =
  "Cloth Capture";

document.getElementById(
  "subtitle"
).textContent =
  "Capture or upload cloth";

updateDots();

return;
```

}

if (state === 2) {

```
clothImage = image;
state = 3;

showReview();
```

}
}

function updateDots() {

document
.querySelectorAll(".dot")
.forEach(dot =>
dot.classList.remove(
"active"
)
);

const active =
document.getElementById(
"d" + state
);

if (active) {
active.classList.add(
"active"
);
}
}

function showReview() {

updateDots();

document.getElementById(
"overlay"
).innerHTML = `

  <div class="glass-card">

```
<h1>Review</h1>

<div class="preview">
  <img src="${customerImage}">
  <img src="${clothImage}">
</div>

<div class="actions">

  <button
    class="btn-primary"
    onclick="generateAI()">
    Generate
  </button>

  <button
    class="btn-secondary"
    onclick="location.reload()">
    Restart
  </button>

</div>
```

  </div>
  `;
}

async function generateAI() {

document.getElementById(
"overlay"
).innerHTML = `

  <div class="glass-card">

```
<div class="loader"></div>

<p style="text-align:center">
  Generating...
</p>
```

  </div>
  `;

try {

```
const response =
  await fetch(
    API_URL,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body:
        JSON.stringify({
          personImage:
            customerImage,
          clothImage:
            clothImage
        })
    }
  );

const data =
  await response.json();

const result =
  data.result ||
  data.output ||
  data.image ||
  "";

document.getElementById(
  "overlay"
).innerHTML = `

<div class="glass-card">

  <h1>Result</h1>

  <img
    class="result"
    src="${result}"
  >

  <div class="actions">

    <button
      class="btn-primary"
      onclick="location.reload()">
      Start Again
    </button>

  </div>

</div>
`;
```

} catch (err) {

```
console.error(err);

document.getElementById(
  "overlay"
).innerHTML = `

<div class="error-card">

  AI generation failed

</div>
`;
```

}
}
