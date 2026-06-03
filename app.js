let stream = null;
let facingMode = "environment";

async function startCamera() {
try {

```
if (stream) {
  stream.getTracks().forEach(track => track.stop());
}

stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: facingMode
  },
  audio: false
});

const video = document.getElementById("video");

video.srcObject = stream;

await video.play();
```

} catch (err) {
alert("Camera Error: " + err.message);
console.error(err);
}
}

async function switchCamera() {

facingMode =
facingMode === "environment"
? "user"
: "environment";

await startCamera();
}

function openUpload() {
document.getElementById("fileInput").click();
}

document.addEventListener("DOMContentLoaded", () => {

const fileInput =
document.getElementById("fileInput");

fileInput.addEventListener("change", e => {

```
const file = e.target.files[0];

if (!file) return;

const reader = new FileReader();

reader.onload = event => {

  const img = new Image();

  img.src = event.target.result;

  img.style.maxWidth = "250px";
  img.style.borderRadius = "20px";

  const overlay =
    document.getElementById("overlay");

  overlay.innerHTML = "";

  overlay.appendChild(img);
};

reader.readAsDataURL(file);
```

});

startCamera();

});

function capture() {

const video =
document.getElementById("video");

if (!video.videoWidth) {
alert("Camera not ready");
return;
}

const canvas =
document.createElement("canvas");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const ctx =
canvas.getContext("2d");

ctx.drawImage(
video,
0,
0,
canvas.width,
canvas.height
);

const image =
canvas.toDataURL("image/jpeg");

const preview =
document.createElement("img");

preview.src = image;

preview.style.maxWidth = "250px";
preview.style.borderRadius = "20px";

const overlay =
document.getElementById("overlay");

overlay.innerHTML = "";

overlay.appendChild(preview);
}
