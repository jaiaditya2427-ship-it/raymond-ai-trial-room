let stream;
let facingMode = "user";

let state = 1;

let customerImage = "";
let clothImage = "";

/* ======================
   SOUND (SAFE)
====================== */

const clickSound = new Audio("https://www.myinstants.com/media/sounds/mouse-click.mp3");

function playClick(){
try{
clickSound.currentTime = 0;
clickSound.play();
}catch(e){}
}

/* ======================
   VIBRATION
====================== */

function vibrate(){
if(navigator.vibrate){
navigator.vibrate(15);
}
}

/* ======================
   CAMERA INIT (IMPORTANT FIXED)
====================== */

async function initCamera(){

try{

stream = await navigator.mediaDevices.getUserMedia({
video:{facingMode},
audio:false
});

document.getElementById("video").srcObject = stream;

}catch(err){
alert("Camera blocked. Please allow permission + use HTTPS (Vercel)");
console.log(err);
}

}

/* ======================
   TAP = CAPTURE
====================== */

document.addEventListener("click", capture);

/* ======================
   SWIPE (BASIC + SAFE)
====================== */

let startX = 0;

document.addEventListener("touchstart",(e)=>{
startX = e.touches[0].clientX;
});

document.addEventListener("touchend",(e)=>{
let endX = e.changedTouches[0].clientX;

if(endX < startX - 50) next();
if(endX > startX + 50) prev();
});

/* ======================
   CAPTURE IMAGE
====================== */

function capture(){

playClick();
vibrate();

const video = document.getElementById("video");

const canvas = document.createElement("canvas");

canvas.width = video.videoWidth || 300;
canvas.height = video.videoHeight || 300;

canvas.getContext("2d").drawImage(video,0,0);

let img = canvas.toDataURL("image/jpeg",0.7);

if(state === 1){
customerImage = img;
next();
}

else if(state === 2){
clothImage = img;
next();
}

}

/* ======================
   STATE CONTROL
====================== */

function next(){
if(state < 4) state++;
render();
}

function prev(){
if(state > 1) state--;
render();
}

/* ======================
   UI RENDER
====================== */

function render(){

document.querySelectorAll(".dot").forEach(d=>d.classList.remove("active"));
document.getElementById("d"+state).classList.add("active");

const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");

if(state === 1){
title.innerText = "Customer Capture";
subtitle.innerText = "Tap to capture customer image";
}

if(state === 2){
title.innerText = "Cloth Capture";
subtitle.innerText = "Tap to capture outfit image";
}

if(state === 3){
title.innerText = "Review";
subtitle.innerText = "Swipe to generate AI result";

document.getElementById("overlay").innerHTML = `
<h2>Review</h2>
<div class="preview">
<img src="${customerImage}">
<img src="${clothImage}">
</div>
<p>Swipe left to generate</p>
`;

}

if(state === 4){
title.innerText = "Processing";
subtitle.innerText = "AI generating result...";

generate();
}

}

/* ======================
   AI CALL (SAFE)
====================== */

async function generate(){

document.getElementById("overlay").innerHTML =
"<h2>Generating...</h2>";

try{

const res = await fetch("https://api.ideainfoline.com/tryon",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
personImage: customerImage,
clothImage: clothImage
})
});

const data = await res.json();

document.getElementById("overlay").innerHTML = `
<h2>Result</h2>
<img src="${data.result}" class="result">
<p>Swipe to restart</p>
`;

}catch(err){

document.getElementById("overlay").innerHTML =
"<h2>AI Error</h2>";

console.log(err);

}

}

/* ======================
   START
====================== */

initCamera();
render();
