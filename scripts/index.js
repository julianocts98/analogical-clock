const clockContainer = document.getElementById("clockContainer");
const secondsPointer = document.getElementById("seconds");
const minutesPointer = document.getElementById("minutes");
const hoursPointer = document.getElementById("hours");
const timezoneSelect = document.getElementById("timezoneSelect");

const DEGREE_PER_SECOND = 360 / 60;
const DEGREE_PER_MINUTE = 360 / 60;
const DEGREE_PER_HOUR = 360 / 12;

let timeOffset = 0;
let isOnline = true;

const WORLD_TIME_API_URL = "https://worldtimeapi.org/api/timezone";

async function getTimezones() {
  const response = await fetch(WORLD_TIME_API_URL);
  return response.json();
}

async function getDatetime() {
  try {
    const timezoneSelected = timezoneSelect.selectedOptions[0].value;
    const response = await fetch(`${WORLD_TIME_API_URL}/${timezoneSelected}`);
    const data = await response.json();
    return data.datetime;
  } catch (error) {
    return false;
  }
}

async function getActualDate() {
  if (timezoneSelect.selectedIndex === 0) return new Date();
  const datetime = await getDatetime();
  if (datetime) {
    const time = datetime.substring(0, 26);
    return new Date(time);
  }
  const time = new Date().getTime() + timeOffset;
  return new Date(time);
}

async function fillSelectWithTimezones() {
  try {
    const timezonesAvailable = await getTimezones();
    for (timezone of timezonesAvailable) {
      const option = document.createElement("option");
      option.value = timezone;
      option.text = timezone;
      timezoneSelect.appendChild(option);
    }
  } catch (error) {}
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
  createTicksAndClockNumbers();
  await fillSelectWithTimezones();
  await mainLoop();
};

timezoneSelect.onchange = async () => {
  const localTime = new Date();
  const timezoneTime = await getActualDate();
  timeOffset = timezoneTime.getTime() - localTime.getTime();
};

function createTick() {
  const tick = document.createElement("div");
  tick.className = "tick";
  clockContainer.appendChild(tick);
  return tick;
}

function createClockNumber(number) {
  const clockNumber = document.createElement("span");
  clockNumber.className = "clockNumber";
  clockNumber.innerHTML = number;
  clockContainer.appendChild(clockNumber);
  return clockNumber;
}

function createTicksAndClockNumbers() {
  const degreesPerElement = 360 / 12;
  for (
    let angle = 0, number = 0;
    angle < 360;
    angle += degreesPerElement, number++
  ) {
    const tick = createTick();
    positionTick(tick, -angle);
    const clockNumber = createClockNumber(12 - number);
    positionClockNumber(clockNumber, -angle);
  }
}

function getTickTransform(angleInDegree) {
  return `rotate(${-angleInDegree}deg) translate(0px, -130px)`;
}

function getClockNumberTransform(angleInDegree) {
  return `rotate(${angleInDegree}deg) translate(0px, -100px) rotate(${-angleInDegree}deg)`;
}

function positionTick(tick, angleInDegree) {
  tick.style.transform = getTickTransform(angleInDegree);
}

function positionClockNumber(clockNumber, angleInDegree) {
  clockNumber.style.transform = getClockNumberTransform(angleInDegree);
}
