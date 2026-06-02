let stream = null;

const video = () => document.getElementById("video");
const canvas = () => document.getElementById("canvas");

let facingMode = "user"; // front default

/* =========================
   START CAMERA (UNIVERSAL SAFE)
========================= */

async function startCamera() {

try {

// stop old stream safely
if (stream) {
stream.getTracks().forEach(track => track.stop());
stream = null;
}

const constraints = {
video: {
facingMode: facingMode
},
audio: false
};

stream = await navigator.mediaDevices.getUserMedia(constraints);

const v = video();

v.srcObject = stream;
v.setAttribute("playsinline", true);
v.setAttribute("webkit-playsinline", true);

await v.play();

}catch(err){

console.log("Camera error:", err);

alert(
"Camera blocked.\n\nFix checklist:\n" +
"1. Open in HTTPS site (Vercel / Domain)\n" +
"2. Allow camera permission\n" +
"3. Use Chrome or Safari\n" +
"4. Reset camera permissions if denied"
);

}

}

/* =========================
   SWITCH CAMERA
========================= */

async function switchCamera() {

facingMode = (facingMode === "user") ? "environment" : "user";
await startCamera();

}

/* =========================
   CAPTURE IMAGE
========================= */

let capturedImage = "";

function capture() {

const v = video();
const c = canvas();

c.width = v.videoWidth;
c.height = v.videoHeight;

c.getContext("2d").drawImage(v, 0, 0);

capturedImage = c.toDataURL("image/png");

document.getElementById("preview").src = capturedImage;

}

/* =========================
   CLOTH SELECT
========================= */

let selectedCloth = "";

function selectCloth(src) {
selectedCloth = src;
alert("Cloth selected ✔");
}

/* =========================
   TRY ON API CALL
========================= */

async function generateTryOn() {

if (!capturedImage) {
alert("Capture customer image first");
return;
}

if (!selectedCloth) {
alert("Select cloth first");
return;
}

document.getElementById("result").innerHTML = "Generating AI Try-On...";

try {

const res = await fetch("https://api.ideainfoline.com/tryon", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
personImage: capturedImage,
clothImage: selectedCloth
})
});

const data = await res.json();

document.getElementById("result").innerHTML = `
<h3>Result</h3>
<img src="${data.result}" style="width:100%;border-radius:12px;">
`;

}catch(err){

console.log(err);

document.getElementById("result").innerHTML =
"Server error. Try again.";

}

}
