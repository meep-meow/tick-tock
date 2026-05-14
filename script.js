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

let pomodoroSeconds = pomodoroLengths.focus;

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
  document.getElementById("pomodoroDisplay").textContent =
    formatMinutes(pomodoroSeconds);

  document.getElementById("pomodoroMode").textContent =
    pomodoroMode === "focus"
      ? "Focus"
      : pomodoroMode === "shortBreak"
      ? "Short Break"
      : "Long Break";
}

function startPomodoro() {
  if (pomodoroInterval) return;

  pomodoroInterval = setInterval(function () {
    if (pomodoroSeconds > 0) {
      pomodoroSeconds--;
      updatePomodoroDisplay();
    } else {
      completePomodoro();
    }
  }, 1000);
}

function pausePomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroInterval = null;
}

function resetPomodoro() {
  pausePomodoro();
  pomodoroSeconds = pomodoroLengths[pomodoroMode];
  updatePomodoroDisplay();
}

function setPomodoroMode(mode) {
  pausePomodoro();
  pomodoroMode = mode;
  pomodoroSeconds = pomodoroLengths[mode];
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
let stopwatchSeconds = 0;
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
  document.getElementById("stopwatchDisplay").textContent =
    formatTime(stopwatchSeconds);
}

function startStopwatch() {
  if (stopwatchInterval) return;

  stopwatchInterval = setInterval(function () {
    stopwatchSeconds++;
    updateStopwatchDisplay();
  }, 1000);
}

function pauseStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchInterval = null;
}

function resetStopwatch() {
  pauseStopwatch();
  stopwatchSeconds = 0;
  updateStopwatchDisplay();
}

function logStopwatchSession() {
  if (stopwatchSeconds === 0) return;

  sessions.push({
    type: "stopwatch",
    durationSeconds: stopwatchSeconds,
    date: new Date().toISOString().split("T")[0]
  });

  localStorage.setItem("sessions", JSON.stringify(sessions));

  resetStopwatch();
  updateStats();
  alert("Session logged!");
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
let backgrounds = JSON.parse(localStorage.getItem("backgrounds")) || [];

function uploadBackground() {
  let fileInput = document.getElementById("backgroundUpload");
  let file = fileInput.files[0];

  if (!file) {
    alert("Choose an image first.");
    return;
  }

  let reader = new FileReader();

  reader.onload = function (event) {
    let img = new Image();

    img.onload = function () {
      // Create canvas
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");

      // Resize dimensions
      let maxWidth = 1200;
      let scale = maxWidth / img.width;

      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      // Draw resized image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Compress image
      let compressedImage = canvas.toDataURL("image/jpeg", 0.7);

      try {
        backgrounds.push(compressedImage);

        localStorage.setItem(
          "backgrounds",
          JSON.stringify(backgrounds)
        );

        setBackground(compressedImage);
        renderBackgroundGallery();

        fileInput.value = "";
      } catch (error) {
        alert("Storage full. Try removing old backgrounds.");
        console.error(error);
      }
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
}
function setBackground(imageData) {
  document.body.style.backgroundImage = "url('" + imageData + "')";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundAttachment = "fixed";

  localStorage.setItem("selectedBackground", imageData);
}

function renderBackgroundGallery() {
  let gallery = document.getElementById("backgroundGallery");
  gallery.innerHTML = "";

  backgrounds.forEach(function (bg, index) {
    let img = document.createElement("img");
    img.src = bg;
    img.classList.add("background-thumb");
    img.onclick = function () {
      setBackground(bg);
    };

    gallery.appendChild(img);
  });
}

let savedSelectedBackground = localStorage.getItem("selectedBackground");

if (savedSelectedBackground) {
  setBackground(savedSelectedBackground);
}

renderBackgroundGallery();
