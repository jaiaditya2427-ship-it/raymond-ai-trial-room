const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const tryBtn = document.getElementById("tryBtn");
const result = document.getElementById("result");

imageInput.addEventListener("change", function(){

const file = this.files[0];

if(file){

preview.src = URL.createObjectURL(file);
preview.style.display = "block";

}

});

tryBtn.addEventListener("click", function(){

const outfit =
document.getElementById("outfit").value;

result.innerHTML =
"Generating AI preview with " +
outfit +
"...";

});
async function checkUpdates(){

try{

const res = await fetch("https://api.ideainfoline.com/update");
const data = await res.json();

document.getElementById("result").innerHTML =
"🔔 " + data.message;

}catch(err){
console.log("Live update error");
}

}

// run every 5 seconds
setInterval(checkUpdates, 5000);
