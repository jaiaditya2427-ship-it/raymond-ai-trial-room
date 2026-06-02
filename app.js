let customerStream;
let clothStream;

let customerFacing = "user";
let clothFacing = "environment";

let customerImage = "";
let clothImage = "";

/* ======================
   START BOTH CAMERAS
====================== */

async function startCustomerCam(){

if(customerStream){
customerStream.getTracks().forEach(t=>t.stop());
}

customerStream = await navigator.mediaDevices.getUserMedia({
video:{facingMode: customerFacing}
});

document.getElementById("customerVideo").srcObject = customerStream;
}

async function startClothCam(){

if(clothStream){
clothStream.getTracks().forEach(t=>t.stop());
}

clothStream = await navigator.mediaDevices.getUserMedia({
video:{facingMode: clothFacing}
});

document.getElementById("clothVideo").srcObject = clothStream;
}

/* ======================
   SWITCH CAMERAS
====================== */

function switchCustomerCam(){

customerFacing = (customerFacing === "user") ? "environment" : "user";
startCustomerCam();
}

function switchClothCam(){

clothFacing = (clothFacing === "user") ? "environment" : "user";
startClothCam();
}

/* ======================
   CAPTURE CUSTOMER
====================== */

function captureCustomer(){

const video = document.getElementById("customerVideo");
const canvas = document.getElementById("customerCanvas");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

canvas.getContext("2d").drawImage(video,0,0);

customerImage = canvas.toDataURL("image/png");

document.getElementById("customerPreview").src = customerImage;
document.getElementById("customerPreview").style.display = "block";
}

/* ======================
   CAPTURE CLOTH
====================== */

function captureCloth(){

const video = document.getElementById("clothVideo");
const canvas = document.getElementById("clothCanvas");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

canvas.getContext("2d").drawImage(video,0,0);

clothImage = canvas.toDataURL("image/png");

document.getElementById("clothPreview").src = clothImage;
document.getElementById("clothPreview").style.display = "block";
}

/* ======================
   TRY ON
====================== */

async function generateTryOn(){

if(!customerImage || !clothImage){
alert("Capture both images first");
return;
}

document.getElementById("result").innerHTML =
"Generating AI Try-On... ✨";

const res = await fetch("https://api.ideainfoline.com/tryon", {
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
personImage: customerImage,
clothImage: clothImage
})
});

const data = await res.json();

document.getElementById("result").innerHTML = `
<h3>AI Result</h3>
<img src="${data.result}" style="width:100%;border-radius:12px;display:block;">
`;
}

/* ======================
   INIT
====================== */

startCustomerCam();
startClothCam();
