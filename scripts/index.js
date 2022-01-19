const clockContainer = document.getElementById("clockContainer");
const secondsPointer = document.getElementById("seconds");
const minutesPointer = document.getElementById("minutes");
const hoursPointer = document.getElementById("hours");

const DEGREE_PER_SECOND = 360 / 60;
const DEGREE_PER_MINUTE = 360 / 60;
const DEGREE_PER_HOUR = 360 / 12;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function updateSecondsPointer(seconds) {
  const degreesToRotate = seconds * DEGREE_PER_SECOND;
  secondsPointer.style.transform = `rotate(${degreesToRotate}deg)`;
}

function updateMinutesPointer(minutes) {
  const degreesToRotate = minutes * DEGREE_PER_MINUTE;
  minutesPointer.style.transform = `rotate(${degreesToRotate}deg)`;
}

function updateHoursPointer(hours) {
  const degreesToRotate = hours * DEGREE_PER_HOUR;
  hoursPointer.style.transform = `rotate(${degreesToRotate}deg)`;
}

async function mainLoop() {
  while (true) {
    const now = new Date();
    updateSecondsPointer(now.getSeconds());
    updateMinutesPointer(now.getMinutes());
    updateHoursPointer(now.getHours());
    await sleep(1000);
  }
}

function initializeClock() {
  const now = new Date();
  updateSecondsPointer(now.getSeconds());
  updateMinutesPointer(now.getMinutes());
  updateHoursPointer(now.getHours());
}

document.body.onload = async () => {
  initializeClock();
  await mainLoop();
};
