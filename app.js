/* =========================
   GLOBAL VARIABLES
========================= */

let currentFacingMode = "user"; // front camera default
let stream;

let customerImage = "";
let clothImage = "";

/* =========================
   START CAMERA
========================= */

async function startCamera() {

try {

if (stream) {
stream.getTracks().forEach(track => track.stop());
}

stream = await navigator.mediaDevices.getUserMedia({
video: {
facingMode: currentFacingMode
}
});

document.getElementById("video").srcObject = stream;

} catch (err) {
console.log("Camera error:", err);
alert("Camera access denied or not supported");
}

}

/* =========================
   SWITCH CAMERA (FRONT/BACK)
========================= */

function switchCamera() {

currentFacingMode = (currentFacingMode === "user") ? "environment" : "user";
startCamera();

}

/* =========================
   CAPTURE IMAGE
========================= */

function capture() {

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

canvas.getContext("2d").drawImage(video, 0, 0);

const image = canvas.toDataURL("image/png");

customerImage = image; // store captured image

document.getElementById("preview").src = image;
document.getElementById("preview").style.display = "block";

}

/* =========================
   SELECT CLOTH (IF USING IMAGE GRID)
========================= */

function selectCloth(src) {

clothImage = src;
alert("Cloth selected ✔");

}

/* =========================
   GENERATE TRY-ON
========================= */

async function generateTryOn() {

if (!customerImage) {
alert("Please capture customer image first");
return;
}

if (!clothImage) {
alert("Please select cloth");
return;
}

document.getElementById("result").innerHTML =
"Generating AI Try-On... ✨";

try {

const res = await fetch("https://api.ideainfoline.com/tryon", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
personImage: customerImage,
clothImage: clothImage
})
});

const data = await res.json();

document.getElementById("result").innerHTML = `
<h3>AI Result</h3>
<img src="${data.result}" style="width:100%;border-radius:12px;">
`;

} catch (err) {

console.log(err);
document.getElementById("result").innerHTML =
"Error connecting backend ❌";

}

}

/* =========================
   INIT CAMERA ON LOAD
========================= */

startCamera();
