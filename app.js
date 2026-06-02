let stream;
let state = 1;

let customerImage = "";
let clothImage = "";

/* ---------------- CAMERA START ---------------- */

async function startCamera(){
try{

stream = await navigator.mediaDevices.getUserMedia({
video:{ facingMode:"user" },
audio:false
});

document.getElementById("video").srcObject = stream;

}catch(err){
alert("Camera not allowed or not supported. Use HTTPS (Vercel) + allow permission.");
console.log(err);
}
}

/* ---------------- CAPTURE ---------------- */

function capture(){

const video = document.getElementById("video");

if(!video.videoWidth){
alert("Camera not ready yet");
return;
}

const canvas = document.createElement("canvas");
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

canvas.getContext("2d").drawImage(video,0,0);

let img = canvas.toDataURL("image/jpeg");

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

/* ---------------- UPLOAD ---------------- */

function openUpload(){
document.getElementById("fileInput").click();
}

document.getElementById("fileInput").addEventListener("change", function(e){

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

/* ---------------- UI FLOW ---------------- */

function updateUI(){

const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");

document.querySelectorAll(".dot").forEach(d=>d.classList.remove("active"));
document.getElementById("d"+state).classList.add("active");

if(state === 1){
title.innerText = "Customer Capture";
subtitle.innerText = "Capture or upload customer image";
}

if(state === 2){
title.innerText = "Cloth Capture";
subtitle.innerText = "Capture or upload cloth image";
}

if(state === 3){
title.innerText = "Review";

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
document.getElementById("overlay").innerHTML =
"<div class='glass-card'><div class='loader'></div><p>Processing AI...</p></div>";
}
}

/* ---------------- AI CALL (SAFE) ---------------- */

async function generateAI(){

state = 4;
updateUI();

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
<div class="glass-card">

<h1>Result</h1>

<img class="result" src="${data.result}">

</div>
`;

}catch(err){

document.getElementById("overlay").innerHTML =
"<div class='error-card'>AI Failed</div>";

console.log(err);

}
}

/* ---------------- INIT ---------------- */

startCamera();
