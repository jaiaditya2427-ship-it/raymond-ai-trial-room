let stream = null;
let facingMode = "user";

let capturedImage = "";
let selectedCloth = "";

/* ======================
   CAMERA START
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
console.log(err);
alert("Camera not available. Use HTTPS + allow permission.");
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
   CAPTURE CUSTOMER
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
   CLOTH SELECT (LIVE PREMIUM CLICK)
====================== */

function selectCloth(el){

document.querySelectorAll(".cloth").forEach(img=>{
img.classList.remove("active");
});

el.classList.add("active");

selectedCloth = el.src;

}

/* ======================
   AI TRY-ON
====================== */

async function generateTryOn(){

if(!capturedImage){
alert("Please capture customer image");
return;
}

if(!selectedCloth){
alert("Please select outfit");
return;
}

document.getElementById("result").innerHTML =
"Generating luxury AI try-on...";

try{

const res = await fetch("https://api.ideainfoline.com/tryon",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
personImage: capturedImage,
clothImage: selectedCloth
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
