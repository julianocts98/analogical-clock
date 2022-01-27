const clockContainer = document.getElementById("clockContainer");
const secondsPointer = document.getElementById("seconds");
const minutesPointer = document.getElementById("minutes");
const hoursPointer = document.getElementById("hours");
const timezoneSelect = document.getElementById("timezoneSelect");
const roomNameField = document.getElementById("roomNameField");
const createRoomBtn = document.getElementById("createRoomBtn");
const connectRoomBtn = document.getElementById("connectRoomBtn");
const timezoneRoomHeader = document.getElementById("timezoneRoomHeader");
const connectedUsersUL = document.getElementById("connectedUsersUL");

const DEGREES_PER_SECOND = 360 / 60;
const DEGREES_PER_MINUTE = 360 / 60;
const DEGREES_PER_HOUR = 360 / 12;

let timeOffset = 0;
let socket;
let roomOwner = "";

function updateTimeOffset(datetime) {
  const localTime = new Date();
  const timezoneTime = new Date(datetime);
  timeOffset = timezoneTime.getTime() - localTime.getTime();
}

async function getActualDate() {
  if (timezoneSelect.selectedIndex === 0) return new Date();
  const time = new Date().getTime() + timeOffset;
  return new Date(time);
}

async function fillSelectWithTimezones(timezonesAvailable) {
  try {
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

function updateSecondsPointer(date) {
  const degreesToRotate = date.getSeconds() * DEGREES_PER_SECOND;
  secondsPointer.style.transform = `rotate(${degreesToRotate}deg)`;
}

function updateMinutesPointer(date) {
  const degreesToRotate =
    (date.getMinutes() + date.getSeconds() / 60) * DEGREES_PER_MINUTE;
  minutesPointer.style.transform = `rotate(${degreesToRotate}deg)`;
}

function updateHoursPointer(date) {
  const degreesToRotate =
    (date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600) *
    DEGREES_PER_HOUR;
  hoursPointer.style.transform = `rotate(${degreesToRotate}deg)`;
}

function updateClock(date) {
  updateSecondsPointer(date);
  updateMinutesPointer(date);
  updateHoursPointer(date);
}

function createBigTick() {
  const tick = document.createElement("div");
  tick.className = "tick bigTick";
  clockContainer.appendChild(tick);
  return tick;
}

function createSmallTick() {
  const tick = document.createElement("div");
  tick.className = "tick smallTick";
  clockContainer.appendChild(tick);
  return tick;
}

function createClockNumber(number) {
  const clockNumber = document.createElement("span");
  clockNumber.className = "clockNumber";
  clockNumber.id = `clockNumber${number}`;
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
    const tick = createBigTick();
    positionTick(tick, -angle);
    const clockNumber = createClockNumber(12 - number);
    positionClockNumber(clockNumber, -angle);
  }
  for (let angle = 0; angle < 360; angle += 360 / 60) {
    if (angle % 30 != 0) {
      const tick = createSmallTick();
      positionTick(tick, -angle);
    }
  }
}

function getTickTransform(angleInDegree) {
  return `rotate(${-angleInDegree}deg) translate(0px, -135px)`;
}

function getClockNumberTransform(angleInDegree) {
  return `rotate(${angleInDegree}deg) translate(0px, -113px) rotate(${-angleInDegree}deg)`;
}

function positionTick(tick, angleInDegree) {
  tick.style.transform = getTickTransform(angleInDegree);
}

function positionClockNumber(clockNumber, angleInDegree) {
  clockNumber.style.transform = getClockNumberTransform(angleInDegree);
}

createRoomBtn.onclick = () => {
  socket.emit("timezoneRoom:create", roomNameField.value);
};

connectRoomBtn.onclick = () => {
  socket.emit("timezoneRoom:join", roomNameField.value);
};

timezoneSelect.onchange = async () => {
  socket.emit("timezoneChanged", timezoneSelect.selectedOptions[0].value);
};

function clearTimezoneRoomContainer() {
  connectedUsersUL.innerHTML = "";
  timezoneRoomHeader.innerHTML = "";
}

function populateTimezoneRoomContainer(roomName, userIds) {
  timezoneRoomHeader.innerHTML = roomName;

  if (Array.isArray(userIds)) {
    for (userId of userIds) {
      const userLi = document.createElement("li");
      if (userId === roomOwner) {
        userLi.innerHTML = userId + " [Owner]";
        userLi.style.fontWeight = 600;
        userLi.style.color = "red";
      } else {
        userLi.innerHTML = userId;
      }
      connectedUsersUL.appendChild(userLi);
    }
  } else {
    const userLi = document.createElement("li");
    userLi.innerHTML = userIds;
    connectedUsersUL.appendChild(userLi);
  }
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
  getSocketConnection();
  setSocketListeners();
  await mainLoop();
};

async function getSocketConnection() {
  try {
    socket = io("http://127.0.0.1:3000");
    socket.on("welcome", (message) => {
      console.log(message);
    });
  } catch (error) {
    console.log(error);
  }
}

function setSocketListeners() {
  socket.on("fetchTimezones", async (message, timezones) => {
    if (timezoneSelect.options.length === 1) {
      console.log(message);
      await fillSelectWithTimezones(timezones);
    }
  });

  socket.on("datetimeOfTimezone", async (datetimeOfTimezone) => {
    console.log(datetimeOfTimezone);
    updateTimeOffset(datetimeOfTimezone);
  });

  socket.on(
    "timezoneRoom:create:result",
    (message, statusResponse, roomName, owner) => {
      alert(message);
      if (statusResponse) {
        roomOwner = owner;
        clearTimezoneRoomContainer();
        populateTimezoneRoomContainer(roomName, socket.id);
      }
    }
  );

  socket.on(
    "timezoneRoom:join:result",
    (message, statusResponse, roomName, users, owner) => {
      alert(message);
      if (statusResponse) {
        roomOwner = owner;
        clearTimezoneRoomContainer();
        populateTimezoneRoomContainer(roomName, users);
      }
    }
  );

  socket.on("timezoneRoom:newUserJoined", (roomName, users) => {
    clearTimezoneRoomContainer();
    populateTimezoneRoomContainer(roomName, users);
  });

  socket.on("timezoneRoom:userLeft", (roomName, users, newOwner) => {
    roomOwner = newOwner;
    clearTimezoneRoomContainer();
    populateTimezoneRoomContainer(roomName, users);
  });
}
