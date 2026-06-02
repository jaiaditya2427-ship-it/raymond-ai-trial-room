let selectedCloth = "";

function selectCloth(src){
selectedCloth = src;
alert("Outfit selected ✔");
}

// preview image
document.getElementById("personImage").addEventListener("change", function(){

const file = this.files[0];
const preview = document.getElementById("preview");

if(file){
preview.src = URL.createObjectURL(file);
preview.style.display = "block";
}

});

// MAIN TRY-ON FUNCTION
async function generateTryOn(){

const file = document.getElementById("personImage").files[0];

if(!file){
alert("Please upload customer photo");
return;
}

if(!selectedCloth){
alert("Please select outfit");
return;
}

document.getElementById("result").innerHTML = "Generating AI Look... ✨";

const reader = new FileReader();

reader.onload = async function(){

try{

const res = await fetch("https://api.ideainfoline.com/tryon", {
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
personImage: reader.result,
clothImage: selectedCloth
})
});

const data = await res.json();

document.getElementById("result").innerHTML = `
<h3>AI Try-On Result</h3>
<img src="${data.result}" style="width:100%;border-radius:12px;">
`;

}catch(err){
document.getElementById("result").innerHTML = "Server error";
}

};

reader.readAsDataURL(file);
}
