const clockContainer = document.getElementById("clockContainer");
const secondsPointer = document.getElementById("seconds");
const minutesPointer = document.getElementById("minutes");
const hoursPointer = document.getElementById("hours");
const timezoneSelect = document.getElementById("timezoneSelect");

const DEGREE_PER_SECOND = 360 / 60;
const DEGREE_PER_MINUTE = 360 / 60;
const DEGREE_PER_HOUR = 360 / 12;

const WORLD_TIME_API_URL = "https://worldtimeapi.org/api/timezone";

async function getTimezones() {
  const response = await fetch(WORLD_TIME_API_URL);
  return response.json();
}

async function getDatetime() {
  const timezoneSelected = timezoneSelect.selectedOptions[0].value;
  const response = await fetch(`${WORLD_TIME_API_URL}/${timezoneSelected}`);
  const data = await response.json();
  return data.datetime;
}

async function getActualDate() {
  if (timezoneSelect.selectedIndex === 0) return new Date();
  const datetime = await getDatetime();
  const time = datetime.substring(0, 26);
  return new Date(time);
}

async function fillSelectWithTimezones() {
  const timezonesAvailable = await getTimezones();
  for (timezone of timezonesAvailable) {
    const option = document.createElement("option");
    option.value = timezone;
    option.text = timezone;
    timezoneSelect.appendChild(option);
  }
}

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

function updateClock(date) {
  updateSecondsPointer(date.getSeconds());
  updateMinutesPointer(date.getMinutes());
  updateHoursPointer(date.getHours());
}

async function mainLoop() {
  while (true) {
    const now = await getActualDate();
    updateClock(now);
    await sleep(1000);
  }
}

document.body.onload = async () => {
  await fillSelectWithTimezones();
  await mainLoop();
};
