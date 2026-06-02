let stream;
let facingMode = "user";

let capturedImage = "";
let selectedCloth = "";

/* ======================
   START CAMERA
====================== */

async function startCamera(){

try{

if(stream){
stream.getTracks().forEach(track => track.stop());
}

stream = await navigator.mediaDevices.getUserMedia({
video:{ facingMode: facingMode }
});

document.getElementById("video").srcObject = stream;

}catch(err){
alert("Camera blocked. Please allow permission in Safari settings.");
console.log(err);
}

}

/* ======================
   SWITCH CAMERA
====================== */

function switchCamera(){

facingMode = (facingMode === "user") ? "environment" : "user";
startCamera();

}

/* ======================
   CAPTURE IMAGE
====================== */

function capture(){

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

canvas.getContext("2d").drawImage(video,0,0);

capturedImage = canvas.toDataURL("image/png");

document.getElementById("preview").src = capturedImage;

}

/* ======================
   SELECT CLOTH
====================== */

function selectCloth(src){
selectedCloth = src;
alert("Cloth selected ✔");
}

/* ======================
   TRY ON (BACKEND READY)
====================== */

async function generateTryOn(){

if(!capturedImage){
alert("Capture customer image first");
return;
}

if(!selectedCloth){
alert("Select cloth first");
return;
}

document.getElementById("result").innerHTML =
"Generating AI Try-On...";

const res = await fetch("https://api.ideainfoline.com/tryon", {
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
personImage: capturedImage,
clothImage: selectedCloth
})
});

const data = await res.json();

document.getElementById("result").innerHTML = `
<h3>Result</h3>
<img src="${data.result}">
`;

}
