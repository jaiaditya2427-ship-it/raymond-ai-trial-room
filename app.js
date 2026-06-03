let stream;
let facingMode = "environment";

async function startCamera() {
try {
const video = document.getElementById("video");

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

video.srcObject = stream;
```

} catch (err) {
console.error("Camera Error:", err);
alert("Camera access denied or unavailable.");
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

function capture() {
const video = document.getElementById("video");

if (!video.srcObject) {
alert("Camera not started.");
return;
}

const canvas = document.createElement("canvas");
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const ctx = canvas.getContext("2d");
ctx.drawImage(video, 0, 0);

const image = canvas.toDataURL("image/jpeg");

console.log("Captured Image:", image.substring(0, 50));
alert("Image captured successfully.");
}

document.addEventListener("DOMContentLoaded", () => {
const fileInput = document.getElementById("fileInput");

fileInput.addEventListener("change", (e) => {
const file = e.target.files[0];

```
if (!file) return;

const reader = new FileReader();

reader.onload = function(event) {
  console.log("Uploaded Image:", event.target.result.substring(0, 50));
  alert("Image uploaded successfully.");
};

reader.readAsDataURL(file);
```

});

startCamera();
});
