let stream;
let facingMode = "user";

let state = 1;

let customerImage = "";
let clothImage = "";

/* ======================
   CAMERA INIT (ONLY ONCE)
====================== */

async function initCamera(){

if(stream) return;

stream = await navigator.mediaDevices.getUserMedia({
video:{facingMode},
audio:false
});

document.getElementById("video").srcObject = stream;

}

/* ======================
   SWITCH CAMERA
====================== */

function switchCamera(){

facingMode = (facingMode === "user") ? "environment" : "user";

if(stream){
stream.getTracks().forEach(t=>t.stop());
stream = null;
}

initCamera();

}

/* ======================
   CAPTURE IMAGE
====================== */

function capture(){

const video = document.getElementById("video");
const canvas = document.createElement("canvas");

canvas.width = video.videoWidth * 0.7;
canvas.height = video.videoHeight * 0.7;

canvas.getContext("2d").drawImage(video,0,0,canvas.width,canvas.height);

let img = canvas.toDataURL("image/jpeg",0.7);

if(state === 1){
customerImage = img;
next(2);
}

else if(state === 2){
clothImage = img;
next(3);
}

}

/* ======================
   UPLOAD CUSTOMER IMAGE
====================== */

function uploadCustomer(event){

const file = event.target.files[0];
const reader = new FileReader();

reader.onload = function(e){
customerImage = e.target.result;
next(2);
};

reader.readAsDataURL(file);
}

/* ======================
   UPLOAD CLOTH IMAGE
====================== */

function uploadCloth(event){

const file = event.target.files[0];
const reader = new FileReader();

reader.onload = function(e){
clothImage = e.target.result;
next(3);
};

reader.readAsDataURL(file);
}

/* ======================
   STATE NAVIGATION
====================== */

function next(n){

state = n;

document.querySelectorAll(".step").forEach(s=>s.classList.remove("active"));
document.getElementById("s"+n).classList.add("active");

render();

}

/* ======================
   UI ENGINE
====================== */

function render(){

const panel = document.getElementById("panelContent");

panel.className = "fade";

if(state === 1){

panel.innerHTML = `
<h2>Capture or Upload Customer</h2>

<div class="uploadBox">
<input type="file" accept="image/*" onchange="uploadCustomer(event)">
</div>

<p>Use camera or upload image</p>
`;

}

if(state === 2){

panel.innerHTML = `
<h2>Capture or Upload Cloth</h2>

<div class="uploadBox">
<input type="file" accept="image/*" onchange="uploadCloth(event)">
</div>

<p>Take photo or upload outfit</p>
`;

}

if(state === 3){

panel.innerHTML = `
<h2>Review</h2>

<div class="preview">
<img src="${customerImage}">
<img src="${clothImage}">
</div>

<button onclick="next(4)">Generate AI Try-On</button>
`;

}

if(state === 4){

panel.innerHTML = `
<h2>Result</h2>
<div id="result">Processing...</div>
`;

generate();

}

}

/* ======================
   AI CALL
====================== */

async function generate(){

const res = await fetch("https://api.ideainfoline.com/tryon",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
personImage: customerImage,
clothImage: clothImage
})
});

const data = await res.json();

document.getElementById("result").innerHTML =
`<img src="${data.result}" class="resultImg">`;

}

/* ======================
   START APP
====================== */

initCamera();
render();
next(1);
