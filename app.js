let stream;
let facingMode = "user";

let state = 1;

let customerImage = "";
let clothImage = "";

/* ======================
   INIT CAMERA ONCE
====================== */

async function initCamera(){

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
}

initCamera();

}

/* ======================
   CAPTURE IMAGE (SMART)
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
nextState(2);
}

else if(state === 2){
clothImage = img;
nextState(3);
}

}

/* ======================
   STATE ENGINE
====================== */

function nextState(n){

state = n;
renderUI();
highlightSteps();

}

/* ======================
   STEP UI HIGHLIGHT
====================== */

function highlightSteps(){

document.querySelectorAll(".step").forEach(s=>s.classList.remove("active"));

document.getElementById("s"+state).classList.add("active");

}

/* ======================
   UI RENDER ENGINE
====================== */

function renderUI(){

const panel = document.getElementById("panelContent");

panel.classList.remove("fade");
void panel.offsetWidth;
panel.classList.add("fade");

if(state === 1){

panel.innerHTML = `
<h2>Capture Customer</h2>
<p>Align face in frame and capture.</p>
`;

}

if(state === 2){

panel.innerHTML = `
<h2>Capture Cloth</h2>
<p>Show shirt / outfit in camera and capture.</p>
`;

}

if(state === 3){

panel.innerHTML = `
<h2>Review</h2>

<div class="preview">
<img src="${customerImage}">
<img src="${clothImage}">
</div>

<button onclick="generate()">Generate AI Try-On</button>
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
renderUI();
highlightSteps();
