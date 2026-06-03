// Past months scroll
let currentMonthOffset = 0; // 0 = this month, -1 = last month, etc.

// Pomodoro
let pomodoroInterval = null;
let pomodoroMode = "focus";

let pomodoroLengths = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

let pomodoroEndTime = null;
let pomodoroRemainingSeconds =
  pomodoroLengths.focus;

function formatMinutes(seconds) {
  let mins = Math.floor(seconds / 60);
  let secs = seconds % 60;

  return (
    String(mins).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}

function updatePomodoroDisplay() {
  let remaining = pomodoroRemainingSeconds;

  if (pomodoroEndTime) {
    remaining = Math.max(
      0,
      Math.floor(
        (pomodoroEndTime - Date.now()) / 1000
      )
    );
  }

  document.getElementById(
    "pomodoroDisplay"
  ).textContent = formatMinutes(remaining);

  document.getElementById(
    "pomodoroMode"
  ).textContent =
    pomodoroMode === "focus"
      ? "Focus"
      : pomodoroMode === "shortBreak"
      ? "Short Break"
      : "Long Break";
}

function startPomodoro() {
  if (pomodoroInterval) return;

  pomodoroEndTime =
    Date.now() +
    pomodoroRemainingSeconds * 1000;

  pomodoroInterval = setInterval(function () {

    let remaining = Math.max(
      0,
      Math.floor(
        (pomodoroEndTime - Date.now()) / 1000
      )
    );

    pomodoroRemainingSeconds = remaining;

    updatePomodoroDisplay();

    if (remaining <= 0) {
      completePomodoro();
    }

  }, 1000);
}

function pausePomodoro() {

  if (pomodoroEndTime) {

    pomodoroRemainingSeconds = Math.max(
      0,
      Math.floor(
        (pomodoroEndTime - Date.now()) / 1000
      )
    );

  }

  pomodoroEndTime = null;

  clearInterval(pomodoroInterval);
  pomodoroInterval = null;

  updatePomodoroDisplay();
}

function resetPomodoro() {

  pausePomodoro();

  pomodoroRemainingSeconds =
    pomodoroLengths[pomodoroMode];

  updatePomodoroDisplay();
}

function setPomodoroMode(mode) {

  pausePomodoro();

  pomodoroMode = mode;

  pomodoroRemainingSeconds =
    pomodoroLengths[mode];

  updatePomodoroDisplay();
}

function completePomodoro() {
  pausePomodoro();

  if (pomodoroMode === "focus") {
    sessions.push({
      type: "pomodoro",
      durationSeconds: pomodoroLengths.focus,
      date: new Date().toISOString().split("T")[0]
    });

    localStorage.setItem("sessions", JSON.stringify(sessions));
    updateStats();

    alert("Focus session complete!");
    setPomodoroMode("shortBreak");
  } else {
    alert("Break complete!");
    setPomodoroMode("focus");
  }
}


// Stopwatch
let stopwatchStartTime = null;
let stopwatchElapsedBeforePause = 0;
let stopwatchInterval = null;

let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

function showSection(sectionId) {
  document.querySelectorAll(".page").forEach(function (page) {
    page.classList.add("hidden");
  });

  document.getElementById(sectionId).classList.remove("hidden");
  
  document.querySelectorAll(".sidebar button").forEach(btn => {
  btn.classList.remove("active");
});

event.target.classList.add("active");
}

function formatTime(seconds) {
  let hrs = Math.floor(seconds / 3600);
  let mins = Math.floor((seconds % 3600) / 60);
  let secs = seconds % 60;

  return (
    String(hrs).padStart(2, "0") +
    ":" +
    String(mins).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}

function updateStopwatchDisplay() {
  let elapsed = stopwatchElapsedBeforePause;

  if (stopwatchStartTime) {
    elapsed += Math.floor(
      (Date.now() - stopwatchStartTime) / 1000
    );
  }

  document.getElementById("stopwatchDisplay").textContent =
    formatTime(elapsed);
}

function startStopwatch() {
  if (stopwatchInterval) return;

  stopwatchStartTime = Date.now();

  stopwatchInterval = setInterval(function () {
    updateStopwatchDisplay();
  }, 1000);
}

function pauseStopwatch() {
  if (stopwatchStartTime) {
    stopwatchElapsedBeforePause += Math.floor(
      (Date.now() - stopwatchStartTime) / 1000
    );
  }

  stopwatchStartTime = null;

  clearInterval(stopwatchInterval);
  stopwatchInterval = null;

  updateStopwatchDisplay();
}

function resetStopwatch() {
  pauseStopwatch();

  stopwatchElapsedBeforePause = 0;

  updateStopwatchDisplay();
}

function logStopwatchSession() {
  let totalSeconds = stopwatchElapsedBeforePause;

  if (stopwatchStartTime) {
    totalSeconds += Math.floor(
      (Date.now() - stopwatchStartTime) / 1000
    );
  }

  if (totalSeconds === 0) return;

  sessions.push({
    type: "stopwatch",
    durationSeconds: totalSeconds,
    date: new Date().toISOString().split("T")[0]
  });

  localStorage.setItem(
    "sessions",
    JSON.stringify(sessions)
  );

  resetStopwatch();
  updateStats();
}
// Stats
// Calendar

function generateCalendar() {
  let calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  let weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  weekdays.forEach(function (dayName) {
    let weekdayDiv = document.createElement("div");
    weekdayDiv.classList.add("weekday");
    weekdayDiv.textContent = dayName;
    calendar.appendChild(weekdayDiv);
  });

  let today = new Date();

  let year = today.getFullYear();
  let month = today.getMonth() + currentMonthOffset;

  let firstDay = new Date(year, month, 1);
  let lastDay = new Date(year, month + 1, 0);

  let startDayOfWeek = firstDay.getDay();
  let daysInMonth = lastDay.getDate();

  document.getElementById("calendarTitle").textContent =
    new Date(year, month).toLocaleString("default", {
      month: "long",
      year: "numeric"
    });

  for (let i = 0; i < startDayOfWeek; i++) {
    let emptyDiv = document.createElement("div");
    emptyDiv.classList.add("day");
    emptyDiv.style.visibility = "hidden";
    calendar.appendChild(emptyDiv);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    let date = new Date(year, month, day);
    let dateStr = date.toISOString().split("T")[0];

    let daySeconds = sessions
      .filter(function (s) {
        return s.date === dateStr;
      })
      .reduce(function (sum, s) {
        return sum + s.durationSeconds;
      }, 0);

    let minutes = Math.round(daySeconds / 60);

    let dayDiv = document.createElement("div");
    dayDiv.classList.add("day");

    if (minutes >= 120) {
      dayDiv.classList.add("level-4");
    } else if (minutes >= 60) {
      dayDiv.classList.add("level-3");
    } else if (minutes >= 30) {
      dayDiv.classList.add("level-2");
    } else if (minutes > 0) {
      dayDiv.classList.add("level-1");
    }

    let todayStr = new Date().toISOString().split("T")[0];

    if (dateStr === todayStr) {
      dayDiv.classList.add("today");
    }

    dayDiv.textContent = day;
    dayDiv.title = minutes + " minutes logged";

    calendar.appendChild(dayDiv);
  }
}

function changeMonth(direction) {
  currentMonthOffset += direction;
  generateCalendar();
}

function updateStats() {
  let today = new Date().toISOString().split("T")[0];

  let totalSeconds = sessions.reduce(function (sum, session) {
    return sum + session.durationSeconds;
  }, 0);

  let todaySeconds = sessions
    .filter(function (session) {
      return session.date === today;
    })
    .reduce(function (sum, session) {
      return sum + session.durationSeconds;
    }, 0);

  document.getElementById("sessionCount").textContent =
    "Sessions: " + sessions.length;

  document.getElementById("todayTime").textContent =
    "Today: " + Math.round(todaySeconds / 60) + " minutes";

  document.getElementById("totalTime").textContent =
    "Total time: " + Math.round(totalSeconds / 60) + " minutes";
  generateCalendar();
}

function changeBackground(background) {
  document.body.style.background = background;
  localStorage.setItem("background", background);
}

let savedBackground = localStorage.getItem("background");
if (savedBackground) {
  document.body.style.background = savedBackground;
}

updateStopwatchDisplay();
updateStats();

updatePomodoroDisplay();

function resetStats() {
  sessions = [];
  localStorage.setItem("sessions", JSON.stringify(sessions));
  updateStats();
  alert("Stats reset!");
}

// Customization
function uploadBackground() {
  let fileInput = document.getElementById("backgroundUpload");
  let file = fileInput.files[0];

  if (!file) {
    alert("Choose an image first.");
    return;
  }

  let reader = new FileReader();

  reader.onload = function (event) {
    setBackground(event.target.result);
    fileInput.value = "";
  };

  reader.readAsDataURL(file);
}

function setBackground(imageData) {
  document.body.style.backgroundImage = "url('" + imageData + "')";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundAttachment = "fixed";
}

function clearBackground() {
  document.body.style.backgroundImage = "";
}
