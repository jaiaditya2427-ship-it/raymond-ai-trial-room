let stream = null;
let facingMode = "user";

let capturedImage = "";
let selectedCloth = "";

/* ======================
   START CAMERA (SAFE + FIXED)
====================== */

async function startCamera() {

try {

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
alert("Camera not supported in this browser");
return;
}

if (stream) {
stream.getTracks().forEach(track => track.stop());
stream = null;
}

stream = await navigator.mediaDevices.getUserMedia({
video: { facingMode: facingMode },
audio: false
});

const video = document.getElementById("video");

video.srcObject = stream;
video.setAttribute("playsinline", true);
video.setAttribute("autoplay", true);

await video.play();

}catch(err){

console.log(err);

alert(
"Camera blocked or not supported.\n\nIMPORTANT FIX:\n1. Open in HTTPS (Vercel / Hostinger)\n2. Use Chrome or Safari\n3. Allow camera permission\n4. Do NOT open from file or Koder preview"
);

}

}

/* ======================
   SWITCH CAMERA
====================== */

async function switchCamera() {

facingMode = (facingMode === "user") ? "environment" : "user";
await startCamera();

}

/* ======================
   CAPTURE IMAGE
====================== */

function capture() {

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

canvas.getContext("2d").drawImage(video, 0, 0);

capturedImage = canvas.toDataURL("image/png");

document.getElementById("preview").src = capturedImage;

}

/* ======================
   SELECT CLOTH
====================== */

function selectCloth(src) {
selectedCloth = src;
alert("Cloth selected ✔");
}

/* ======================
   TRY ON
====================== */

async function generateTryOn() {

if (!capturedImage) {
alert("Capture image first");
return;
}

if (!selectedCloth) {
alert("Select cloth first");
return;
}

document.getElementById("result").innerHTML =
"Generating AI Try-On...";

try {

const res = await fetch("https://api.ideainfoline.com/tryon", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
personImage: capturedImage,
clothImage: selectedCloth
})
});

const data = await res.json();

document.getElementById("result").innerHTML =
`<img src="${data.result}" style="width:100%;border-radius:12px;">`;

}catch(err){

console.log(err);

document.getElementById("result").innerHTML =
"Server error";

}

}
