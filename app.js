let selectedOutfit = "White Shirt";

// preview image
document.getElementById("imageInput").addEventListener("change", function(){
const file = this.files[0];
const preview = document.getElementById("preview");

if(file){
preview.src = URL.createObjectURL(file);
preview.style.display = "block";
}
});

// outfit select
function selectOutfit(outfit){
selectedOutfit = outfit;
}

// AI generate (backend call)
async function generateTryOn(){
  async function fetchLiveUpdate(){

try{

const res = await fetch("https://api.ideainfoline.com/update");
const data = await res.json();

document.getElementById("result").innerHTML = `
<div style="padding:10px;background:rgba(255,215,0,0.1);border-radius:10px;">
🔔 <b>Live Update</b><br><br>
${data.message}
</div>
`;

}catch(err){
console.log("Live update error", err);
}

}

// run every 5 seconds
setInterval(fetchLiveUpdate, 5000);

// run immediately once
fetchLiveUpdate();

const imageInput = document.getElementById("imageInput");
const result = document.getElementById("result");

if(!imageInput.files[0]){
alert("Upload photo first");
return;
}

result.innerHTML = "Styling your look... ✨";

const reader = new FileReader();

reader.onload = async function(){

const res = await fetch("https://api.ideainfoline.com/tryon", {
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
personImage: reader.result,
outfit: selectedOutfit
})
});

const data = await res.json();

result.innerHTML = `
<h3>AI Look Ready</h3>
<img src="${data.finalImage}" style="width:100%;border-radius:12px;" />
`;

};

reader.readAsDataURL(imageInput.files[0]);
}

// tab switch
function switchTab(tab){

document.querySelectorAll(".section").forEach(s=>{
s.classList.remove("active");
});

document.querySelectorAll(".tab").forEach(t=>{
t.classList.remove("active");
});

document.getElementById(tab).classList.add("active");
event.target.classList.add("active");
}
