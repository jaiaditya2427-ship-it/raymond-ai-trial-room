let stream;
let state = 1;

let currentFacingMode = "environment";

let customerImage = "";
let clothImage = "";

let captureEnabled = true;

/* =========================
   A) SHUTTER SOUND
========================= */

const shutterSound = new Audio(
"https://www.myinstants.com/media/sounds/camera-shutter-click.mp3"
);

function playShutter(){
try{
shutterSound.currentTime = 0;
shutterSound.play();
}catch(e){}
}

/* =========================
   B) HAPTIC VIBRATION
========================= */

function vibrate(){
if(navigator.vibrate){
navigator.vibrate(20);
}
}

/* =========================
   C) FLASH EFFECT
========================= */

function cameraFlash(){
const flash = document.getElementById("flash");

if(!flash) return;

flash.classList.add("active");

setTimeout(()=>{
flash.classList.remove("active");
},150);
}

/* =========================
   D) RIPPLE EFFECT
========================= */

document.addEventListener("click", function(e){

const ripple = document.createElement("div");
ripple.className = "ripple";

ripple.style.left = e.clientX + "px";
ripple.style.top = e.clientY + "px";

document.body.appendChild(ripple);

setTimeout(()=>{
ripple.remove();
},400);

});

/* =========================
   CAMERA START
========================= */

async function startCamera(){
function switchCamera(){

playShutter();
vibrate();

currentFacingMode =
currentFacingMode === "environment"
? "user"
: "environment";

startCamera();

}
try{

if(stream){
stream.getTracks().forEach(track => track.stop());
}

stream = await navigator.mediaDevices.getUserMedia({
video:{
facingMode: currentFacingMode
},
audio:false
});

document.getElementById("video").srcObject = stream;

}catch(err){
alert("Camera not allowed or not supported (use HTTPS)");
console.log(err);
}

}

try{

stream = await navigator.mediaDevices.getUserMedia({
video:{
facingMode:{ ideal:"environment" }
},
audio:false
});

document.getElementById("video").srcObject = stream;

}catch(err){
alert("Camera not allowed or not supported (use HTTPS)");
console.log(err);
}

}

/* =========================
   CAPTURE IMAGE
========================= */

function capture(){

if(!captureEnabled) return;

playShutter();
vibrate();
cameraFlash();

const video = document.getElementById("video");

if(!video.videoWidth){
alert("Camera not ready");
return;
}

const canvas = document.createElement("canvas");
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

canvas.getContext("2d").drawImage(video,0,0);

let img = canvas.toDataURL("image/jpeg",0.8);

if(state === 1){
customerImage = img;
state = 2;
updateUI();
return;
}

if(state === 2){
clothImage = img;
state = 3;
updateUI();
return;
}

}

/* =========================
   UPLOAD
========================= */

function openUpload(){
document.getElementById("fileInput").click();
}

document.getElementById("fileInput").addEventListener("change",(e)=>{

const file = e.target.files[0];
const reader = new FileReader();

reader.onload = function(ev){

if(state === 1){
customerImage = ev.target.result;
state = 2;
updateUI();
}

else if(state === 2){
clothImage = ev.target.result;
state = 3;
updateUI();
}

};

reader.readAsDataURL(file);

});

/* =========================
   E) UI FLOW (STATE SYSTEM)
========================= */

function updateUI(){

const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");

document.querySelectorAll(".dot").forEach(d=>d.classList.remove("active"));
document.getElementById("d"+state).classList.add("active");

if(state === 1){
captureEnabled = true;
title.innerText = "Customer Capture";
subtitle.innerText = "Capture or upload customer image";
}

if(state === 2){
captureEnabled = true;
title.innerText = "Cloth Capture";
subtitle.innerText = "Capture or upload cloth image";
}

if(state === 3){
captureEnabled = false;

document.getElementById("overlay").innerHTML = `
<div class="glass-card">

<h1>Review</h1>

<div class="preview">
<img src="${customerImage}">
<img src="${clothImage}">
</div>

<button onclick="generateAI()">Generate</button>

</div>
`;
}

if(state === 4){
document.getElementById("overlay").innerHTML = `
<div class="glass-card">
<div class="loader"></div>
<p>Processing AI...</p>
</div>
`;
}

}

/* =========================
   AI GENERATION (STEP 3)
========================= */

async function generateAI(){

state = 4;
updateUI();

/* SHOW AI SCREEN */
document.getElementById("aiScreen")?.classList.remove("hidden");

try{

const res = await fetch("https://ai-fashion-api.onrender.com",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
personImage: customerImage,
clothImage: clothImage
})
});

const data = await res.json();

/* HIDE AI SCREEN */
document.getElementById("aiScreen")?.classList.add("hidden");

document.getElementById("overlay").innerHTML = `
<div class="glass-card">

<h1>Result</h1>

<img class="result" src="${data.result}">

</div>
`;

}catch(err){

document.getElementById("aiScreen")?.classList.add("hidden");

document.getElementById("overlay").innerHTML =
"<div class='error-card'>AI Failed</div>";

console.log(err);

}

}

/* =========================
   INIT
========================= */

startCamera();
updateUI();
