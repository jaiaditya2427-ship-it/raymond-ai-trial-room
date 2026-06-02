let stream = null;
let facingMode = "user";

let mode = "customer";

let customerImage = "";
let clothImage = "";

/* ======================
   START CAMERA (ONLY ONCE)
====================== */

async function startCamera(){

try{

if(stream){
console.log("Camera already running");
return;
}

stream = await navigator.mediaDevices.getUserMedia({
video:{
facingMode: facingMode
},
audio:false
});

document.getElementById("video").srcObject = stream;

}catch(err){
console.log(err);
alert("Camera error. Open in HTTPS browser and allow permission.");
}

}

/* ======================
   SWITCH CAMERA (FRONT/BACK)
====================== */

function switchCamera(){

facingMode = (facingMode === "user") ? "environment" : "user";

if(stream){
stream.getTracks().forEach(t=>t.stop());
stream = null;
}

startCamera();

}

/* ======================
   SET MODE (NO CAMERA RESTART)
====================== */

function setMode(newMode){

mode = newMode;

document.getElementById("btnCustomer").style.background =
(mode === "customer") ? "#000" : "#333";

document.getElementById("btnCloth").style.background =
(mode === "cloth") ? "#000" : "#333";

}

/* ======================
   CAPTURE FRAME (OPTIMIZED)
====================== */

function capture(){

const video = document.getElementById("video");

const canvas = document.createElement("canvas");

// smaller resolution = faster + smoother
canvas.width = video.videoWidth * 0.6;
canvas.height = video.videoHeight * 0.6;

const ctx = canvas.getContext("2d");
ctx.drawImage(video,0,0,canvas.width,canvas.height);

// compressed output (FAST)
const image = canvas.toDataURL("image/jpeg",0.7);

if(mode === "customer"){
customerImage = image;
document.getElementById("customerPreview").src = image;
}

if(mode === "cloth"){
clothImage = image;
document.getElementById("clothPreview").src = image;
}

}

/* ======================
   AI GENERATE
====================== */

async function generate(){

if(!customerImage){
alert("Capture customer first");
return;
}

if(!clothImage){
alert("Capture cloth first");
return;
}

document.getElementById("result").innerHTML =
"Processing AI try-on...";

try{

const res = await fetch("https://api.ideainfoline.com/tryon",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
personImage: customerImage,
clothImage: clothImage
})
});

const data = await res.json();

document.getElementById("result").innerHTML =
`<img src="${data.result}" style="width:100%;border-radius:14px;">`;

}catch(err){

console.log(err);

document.getElementById("result").innerHTML =
"AI failed. Try again.";

}

}
