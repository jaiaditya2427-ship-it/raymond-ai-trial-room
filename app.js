let selectedCloth = "";

function selectCloth(src){
selectedCloth = src;
alert("Outfit selected");
}

document.getElementById("personImage").addEventListener("change", function(){

const file = this.files[0];
const preview = document.getElementById("preview");

if(file){
preview.src = URL.createObjectURL(file);
preview.style.display = "block";
}

});

async function generateTryOn(){

const personFile = document.getElementById("personImage").files[0];

if(!personFile || !selectedCloth){
alert("Please upload photo + select outfit");
return;
}

document.getElementById("result").innerHTML = "Generating look... 🔥";

const reader = new FileReader();

reader.onload = async function(){

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
<h3>Your AI Look</h3>
<img src="${data.result}" style="width:100%;border-radius:12px;">
`;

};

reader.readAsDataURL(personFile);
}
