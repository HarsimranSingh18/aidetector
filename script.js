// script.js

let model;
const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const detectionList = document.getElementById("detection-list");
const overviewBox = document.getElementById("overview-box");
const overviewTitle = document.getElementById("overview-title");
const overviewContent = document.getElementById("overview-content");
const closeBtn = document.getElementById("close-overview");

const filteredClasses = ["donut", "cup", "chair", "remote"];

async function loadModel() {
  model = await cocoSsd.load();
  runDetection();
}

function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    video.srcObject = stream;
  });
}

function runDetection() {
  video.addEventListener("loadeddata", async () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detect = async () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const predictions = await model.detect(video);

      let listed = 0;
      detectionList.innerHTML = "";

      predictions.forEach(async (prediction) => {
        if (filteredClasses.includes(prediction.class)) return;

        const [x, y, width, height] = prediction.bbox;

        context.strokeStyle = "white";
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);

        if (listed < 3) {
          const label = `${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`;
          const li = document.createElement("li");
          li.textContent = label;
          detectionList.appendChild(li);
          listed++;
        }

        if (prediction.class !== "person") {
          video.pause();
          showOverview(prediction.class);
        }
      });

      requestAnimationFrame(detect);
    };
    detect();
  });
}

function showOverview(label) {
  overviewTitle.textContent = label;
  overviewContent.textContent = `This is an overview of ${label}. More AI-generated info would go here.`;
  overviewBox.style.display = "flex";
}

closeBtn.addEventListener("click", () => {
  overviewBox.style.display = "none";
  video.play();
});

startCamera();
loadModel();
