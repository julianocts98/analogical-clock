const clockContainer = document.getElementById("clockContainer");
const secondsPointer = document.getElementById("seconds");
const DEGREE_PER_SECOND = 360 / 60;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function updateSecondsPointer(seconds) {
  const degreesToRotate = seconds * DEGREE_PER_SECOND;
  secondsPointer.style.transform = `rotate(${degreesToRotate}deg)`;
}

async function mainLoop() {
  while (true) {
    const now = new Date();
    updateSecondsPointer(now.getSeconds());
    await sleep(1000);
  }
}

document.body.onload = async () => {
  await mainLoop();
};
