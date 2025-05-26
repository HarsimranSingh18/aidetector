const video = document.getElementById('video');

async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (e) {
    alert('Error accessing camera: ' + e.message);
  }
}

setupCamera();
