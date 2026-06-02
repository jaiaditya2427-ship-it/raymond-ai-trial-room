/* ======================
   STATE
====================== */

let stream;
let facingMode = "user";
let state = 1;

let customerImage = "";
let clothImage = "";

let captureEnabled = true;
let audioUnlocked = false;

/* ======================
   AUDIO UNLOCK SYSTEM
====================== */

function unlockAudio(){
if(audioUnlocked) return;

const temp = new Audio("https://www.myinstants.com/media/sounds/mouse-click.mp3");

temp.play().then(()=>{
audioUnlocked = true;
}).catch(()=>{});

document.removeEventListener("click", unlockAudio);
}

document.addEventListener("click", unlockAudio);

/* ======================
   SOUND + VIBRATION
====================== */

const clickSound = new Audio("https://www.myinstants.com/media/sounds/mouse-click.mp3");

function playClick(){
if(!audioUnlocked) return;
try{
clickSound.currentTime = 0;
clickSound.play();
}catch(e){}
}

function vibrate(){
if(navigator.vibrate){
navigator.vibrate(15);
}
}

function speak(text){
if(!audioUnlocked) return;

try{
const msg = new SpeechSynthesisUtterance(text);
msg.rate = 1;
speechSynthesis.speak(msg);
}catch(e){}
}

/* ======================
   CAMERA INIT
====================== */

async function initCamera(){

try{

stream = await navigator.mediaDevices.getUserMedia({
video:{facingMode},
audio:false
});

document.getElementById("video").srcObject = stream;

}catch(err){
alert("Camera blocked. Allow permission + use HTTPS (Vercel)");
}

}

/* ======================
   CAPTURE IMAGE
====================== */

function capture(){

if(!captureEnabled) return;

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
speak("Customer captured");
next();
}

else if(state === 2){
clothImage = img;
speak("Cloth captured");
next();
}

}

/* ======================
   UPLOAD CUSTOMER
====================== */

function uploadCustomer(event){

const file = event.target.files[0];
const reader = new FileReader();

reader.onload = function(e){
customerImage = e.target.result;
next();
};

reader.readAsDataURL(file);
}

/* ======================
   UPLOAD CLOTH
====================== */

function uploadCloth(event){

const file = event.target.files[0];
const reader = new FileReader();

reader.onload = function(e){
clothImage = e.target.result;
next();
};

reader.readAsDataURL(file);
}

/* ======================
   STATE CONTROL
====================== */

function next(){
if(state < 4) state++;
render();
}

/* ======================
   RENDER UI
====================== */

function render(){

document.querySelectorAll(".dot").forEach(d=>d.classList.remove("active"));
document.getElementById("d"+state).classList.add("active");

const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");

if(state === 1){

captureEnabled = true;

title.innerText = "Customer Capture";
subtitle.innerText = "Tap or upload image";

}

if(state === 2){

captureEnabled = true;

title.innerText = "Cloth Capture";
subtitle.innerText = "Tap or upload outfit";

}

if(state === 3){

captureEnabled = false;

document.getElementById("overlay").innerHTML = `
<h2>Review</h2>

<div class="preview">
<img src="${customerImage}">
<img src="${clothImage}">
</div>

<button onclick="next()">Generate AI</button>
`;

}

if(state === 4){

document.getElementById("overlay").innerHTML =
"<h2>Generating...</h2>";

generateAI();

}

}

/* ======================
   AI CALL
====================== */

async function generateAI(){

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

}

}

/* ======================
   START APP
====================== */

initCamera();
render();
