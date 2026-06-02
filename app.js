document.getElementById("imageInput").addEventListener("change", function(){
const file = this.files[0];
const preview = document.getElementById("preview");

if(file){
preview.src = URL.createObjectURL(file);
preview.style.display = "block";
}
});

async function generateTryOn(){

const imageInput = document.getElementById("imageInput");
const outfit = document.getElementById("outfit").value;
const result = document.getElementById("result");

if(!imageInput.files[0]){
alert("Please upload image first");
return;
}

result.innerHTML = "Processing try-on... 🔥";

const file = imageInput.files[0];

const reader = new FileReader();

reader.onload = async function(){

const personImage = reader.result;

// send to backend (Hostinger)
const res = await fetch("https://api.ideainfoline.com/tryon", {
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
personImage: personImage,
outfit: outfit
})
});

const data = await res.json();

result.innerHTML = `
<h3>Try-On Preview</h3>
<img src="${data.finalImage}" style="width:100%;border-radius:12px;" />
`;

};

reader.readAsDataURL(file);
}border-radius:12px;" />
`;

};

reader.readAsDataURL(file);
}
