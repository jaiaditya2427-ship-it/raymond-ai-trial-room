let stream = null;

let facingMode = "user";
let mode = "customer"; // customer or cloth

let customerImage = "";
let clothImage = "";

/* ======================
   START CAMERA
====================== */

async function startCamera(){

try{

if(stream){
stream.getTracks().forEach(t=>t.stop());
}

stream = await navigator.mediaDevices.getUserMedia({
video:{ facingMode: facingMode },
audio:false
});

document.getElementById("video").srcObject = stream;

}catch(err){
alert("Camera error. Use HTTPS + allow permission.");
console.log(err);
}

}

/* ======================
   SWITCH FRONT / BACK
====================== */

function switchCamera(){

facingMode = (facingMode === "user") ? "environment" : "user";
startCamera();

}

/* ======================
   SWITCH MODE
====================== */

function switchMode(){

mode = (mode === "customer") ? "cloth" : "customer";

alert("Mode: " + mode.toUpperCase());

}

/* ======================
   CAPTURE IMAGE (BOTH TYPES)
====================== */

function capture(){

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

canvas.getContext("2d").drawImage(video,0,0);

let image = canvas.toDataURL("image/png");

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
   AI TRY-ON
====================== */

async function generateTryOn(){

if(!customerImage){
alert("Capture CUSTOMER image first");
return;
}

if(!clothImage){
alert("Capture CLOTH image first");
return;
}

document.getElementById("result").innerHTML =
"Generating AI Try-On...";

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
"AI failed";

}

}
