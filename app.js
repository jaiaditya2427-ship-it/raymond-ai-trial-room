let customerImage = "";
let clothImage = "";

/* -----------------------------
START CAMERA (BOTH)
----------------------------- */
navigator.mediaDevices.getUserMedia({ video:true })
.then(stream => {

document.getElementById("customerCam").srcObject = stream;
document.getElementById("clothCam").srcObject = stream;

})
.catch(err=>{
alert("Camera access denied");
});

/* -----------------------------
CAPTURE CUSTOMER
----------------------------- */
function captureCustomer(){

const video = document.getElementById("customerCam");
const canvas = document.getElementById("customerCanvas");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

canvas.getContext("2d").drawImage(video,0,0);

customerImage = canvas.toDataURL("image/png");

document.getElementById("customerPreview").src = customerImage;
document.getElementById("customerPreview").style.display = "block";

}

/* -----------------------------
CAPTURE CLOTH
----------------------------- */
function captureCloth(){

const video = document.getElementById("clothCam");
const canvas = document.getElementById("clothCanvas");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

canvas.getContext("2d").drawImage(video,0,0);

clothImage = canvas.toDataURL("image/png");

document.getElementById("clothPreview").src = clothImage;
document.getElementById("clothPreview").style.display = "block";

}

/* -----------------------------
GENERATE TRY-ON (BACKEND CALL)
----------------------------- */
async function generateTryOn(){

if(!customerImage || !clothImage){
alert("Please capture both images");
return;
}

document.getElementById("result").innerHTML = "Generating AI Try-On... ✨";

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
<img src="${data.result}" style="display:block;">
`;

}
