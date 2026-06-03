const video = document.getElementById("video");

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    alert("Camera started successfully");

  } catch (err) {

    alert(
      "Camera failed\n\n" +
      err.name +
      "\n" +
      err.message
    );

    console.error(err);
  }
}

window.onload = startCamera;

function switchCamera() {}
function capture() {}
function openUpload() {}
