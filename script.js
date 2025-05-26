
let model, video, canvas, context;
const excluded = ["donut", "cup", "remote", "chair"];
let popup = document.getElementById("popup");
let popupDesc = document.getElementById("objectDescription");
let popupImg = document.getElementById("objectImage");
let closePopup = document.getElementById("closePopup");
let detectionsEl = document.getElementById("detections");
let lastDetections = [];

async function setupCamera() {
  video = document.getElementById("video");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(resolve => video.onloadedmetadata = resolve);
}

async function detectFrame() {
  const predictions = await model.detect(video);
  context.clearRect(0, 0, canvas.width, canvas.height);
  detectionsEl.innerHTML = "";

  predictions.forEach(prediction => {
    if (excluded.includes(prediction.class)) return;

    const [x, y, width, height] = prediction.bbox;
    context.strokeStyle = "white";
    context.lineWidth = 3;
    context.strokeRect(x, y, width, height);

    if (!lastDetections.includes(prediction.class)) {
      lastDetections.push(prediction.class);
      if (lastDetections.length > 3) lastDetections.shift();
    }
  });

  lastDetections.forEach(det => {
    const label = document.createElement("div");
    label.textContent = det;
    detectionsEl.appendChild(label);
  });

  if (predictions.length > 0) {
    const main = predictions.find(p => !excluded.includes(p.class) && p.class !== "person");
    if (main) {
      showPopup(main.class);
      return;
    }
  }

  requestAnimationFrame(detectFrame);
}

function showPopup(label) {
  video.pause();
  fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${label}`)
    .then(res => res.json())
    .then(data => {
      popupDesc.textContent = data.extract || "No description available.";
      popupImg.src = data.thumbnail?.source || "";
      popup.classList.remove("hidden");
    });
}

closePopup.onclick = () => {
  popup.classList.add("hidden");
  video.play();
  requestAnimationFrame(detectFrame);
};

async function main() {
  await setupCamera();
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  model = await cocoSsd.load();
  detectFrame();
}

main();
