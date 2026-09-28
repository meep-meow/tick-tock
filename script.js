// Past months scroll
let currentMonthOffset = 0; // 0 = this month, -1 = last month, etc.
// ========================================
// SESSION DATA
// ========================================

let sessions =
  JSON.parse(localStorage.getItem("sessions")) || [];


// ========================================
// DATE HELPER
// ========================================

// Gets the date using YOUR local timezone,
// rather than UTC.

function getLocalDateString(date = new Date()) {
  let year = date.getFullYear();

  let month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  let day = String(
    date.getDate()
  ).padStart(2, "0");

  return year + "-" + month + "-" + day;
}


// ========================================
// GENERAL TIME FORMATTING
// ========================================

function formatTime(seconds) {

  let hours = Math.floor(seconds / 3600);

  let minutes = Math.floor(
    (seconds % 3600) / 60
  );

  let secs = seconds % 60;

  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}


function formatMinutes(seconds) {

  let minutes = Math.floor(seconds / 60);
  let secs = seconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}


// Converts total seconds into:
// 2 days, 4 hours, 17 minutes

function formatTotalTime(seconds) {

  let days = Math.floor(
    seconds / 86400
  );

  let hours = Math.floor(
    (seconds % 86400) / 3600
  );

  let minutes = Math.floor(
    (seconds % 3600) / 60
  );

  return (
    days + " days, " +
    hours + " hours, " +
    minutes + " minutes"
  );
}



// ========================================
// STOPWATCH
// ========================================

let stopwatchStartTime = null;

let stopwatchElapsedBeforePause = 0;

let stopwatchInterval = null;


// ----------------------------------------
// Display
// ----------------------------------------

function getStopwatchSeconds() {

  let elapsed =
    stopwatchElapsedBeforePause;

  if (stopwatchStartTime !== null) {

    elapsed += Math.floor(
      (Date.now() - stopwatchStartTime) / 1000
    );

  }

  return elapsed;
}


function updateStopwatchDisplay() {

  let display =
    document.getElementById(
      "stopwatchDisplay"
    );

  if (!display) return;

  display.textContent =
    formatTime(getStopwatchSeconds());
}


// ----------------------------------------
// Save stopwatch state
// ----------------------------------------

function saveStopwatchState() {

  let state = {
    startTime: stopwatchStartTime,
    elapsedBeforePause:
      stopwatchElapsedBeforePause
  };

  localStorage.setItem(
    "stopwatchState",
    JSON.stringify(state)
  );
}


// ----------------------------------------
// Start
// ----------------------------------------

function startStopwatch() {

  // Already running
  if (stopwatchStartTime !== null) {
    return;
  }

  stopwatchStartTime = Date.now();

  saveStopwatchState();

  stopwatchInterval =
    setInterval(function () {

      updateStopwatchDisplay();

    }, 1000);

  updateStopwatchDisplay();
}


// ----------------------------------------
// Pause
// ----------------------------------------

function pauseStopwatch() {

  if (stopwatchStartTime !== null) {

    stopwatchElapsedBeforePause +=
      Math.floor(
        (
          Date.now() -
          stopwatchStartTime
        ) / 1000
      );

  }

  stopwatchStartTime = null;

  clearInterval(stopwatchInterval);

  stopwatchInterval = null;

  saveStopwatchState();

  updateStopwatchDisplay();
}


// ----------------------------------------
// Reset
// ----------------------------------------

function resetStopwatch() {

  clearInterval(stopwatchInterval);

  stopwatchInterval = null;

  stopwatchStartTime = null;

  stopwatchElapsedBeforePause = 0;

  localStorage.removeItem(
    "stopwatchState"
  );

  updateStopwatchDisplay();
}


// ----------------------------------------
// Log stopwatch session
// ----------------------------------------

function logStopwatchSession() {

  let totalSeconds =
    getStopwatchSeconds();

  if (totalSeconds <= 0) {
    return;
  }

  sessions.push({

    type: "stopwatch",

    durationSeconds:
      totalSeconds,

    date:
      getLocalDateString()

  });

  saveSessions();

  resetStopwatch();

  updateStats();
}



// ========================================
// POMODORO
// ========================================

let pomodoroLengths = {

  focus: 25 * 60,

  shortBreak: 5 * 60,

  longBreak: 15 * 60

};


let pomodoroMode = "focus";

let pomodoroRemainingSeconds =
  pomodoroLengths.focus;

let pomodoroEndTime = null;

let pomodoroInterval = null;


// ----------------------------------------
// Pomodoro display
// ----------------------------------------

function getPomodoroRemainingSeconds() {

  if (pomodoroEndTime !== null) {

    return Math.max(
      0,

      Math.ceil(
        (
          pomodoroEndTime -
          Date.now()
        ) / 1000
      )
    );

  }

  return pomodoroRemainingSeconds;
}


function updatePomodoroDisplay() {

  let remaining =
    getPomodoroRemainingSeconds();

  let display =
    document.getElementById(
      "pomodoroDisplay"
    );

  if (display) {

    display.textContent =
      formatMinutes(remaining);

  }


  let modeTitle =
    document.getElementById(
      "pomodoroMode"
    );

  if (modeTitle) {

    if (pomodoroMode === "focus") {

      modeTitle.textContent =
        "Focus";

    } else if (
      pomodoroMode === "shortBreak"
    ) {

      modeTitle.textContent =
        "Short Break";

    } else {

      modeTitle.textContent =
        "Long Break";

    }

  }

}


// ----------------------------------------
// Save Pomodoro state
// ----------------------------------------

function savePomodoroState() {

  let state = {

    mode:
      pomodoroMode,

    remainingSeconds:
      getPomodoroRemainingSeconds(),

    endTime:
      pomodoroEndTime

  };

  localStorage.setItem(
    "pomodoroState",
    JSON.stringify(state)
  );
}


// ----------------------------------------
// Start Pomodoro
// ----------------------------------------

function startPomodoro() {

  // Already running
  if (pomodoroEndTime !== null) {
    return;
  }

  pomodoroEndTime =
    Date.now() +
    pomodoroRemainingSeconds * 1000;

  savePomodoroState();


  pomodoroInterval =
    setInterval(function () {

      let remaining =
        getPomodoroRemainingSeconds();

      updatePomodoroDisplay();


      if (remaining <= 0) {

        completePomodoro();

      }

    }, 250);

}


// ----------------------------------------
// Pause Pomodoro
// ----------------------------------------

function pausePomodoro() {

  if (pomodoroEndTime !== null) {

    pomodoroRemainingSeconds =
      getPomodoroRemainingSeconds();

  }

  pomodoroEndTime = null;

  clearInterval(
    pomodoroInterval
  );

  pomodoroInterval = null;

  savePomodoroState();

  updatePomodoroDisplay();
}


// ----------------------------------------
// Reset Pomodoro
// ----------------------------------------

function resetPomodoro() {

  clearInterval(
    pomodoroInterval
  );

  pomodoroInterval = null;

  pomodoroEndTime = null;

  pomodoroRemainingSeconds =
    pomodoroLengths[pomodoroMode];

  savePomodoroState();

  updatePomodoroDisplay();
}


// ----------------------------------------
// Change Pomodoro mode
// ----------------------------------------

function setPomodoroMode(mode) {

  clearInterval(
    pomodoroInterval
  );

  pomodoroInterval = null;

  pomodoroEndTime = null;

  pomodoroMode = mode;

  pomodoroRemainingSeconds =
    pomodoroLengths[mode];

  savePomodoroState();

  updatePomodoroDisplay();
}


// ----------------------------------------
// COMPLETE POMODORO
// ----------------------------------------

function completePomodoro() {

  // Save the mode BEFORE changing anything.
  // This is important for session logging.

  let completedMode =
    pomodoroMode;


  let completedDuration =
    pomodoroLengths[
      completedMode
    ];


  // Stop timer first

  clearInterval(
    pomodoroInterval
  );

  pomodoroInterval = null;

  pomodoroEndTime = null;


  // -----------------------------
  // LOG FOCUS SESSION
  // -----------------------------

  if (completedMode === "focus") {

    sessions.push({

      type: "pomodoro",

      durationSeconds:
        completedDuration,

      date:
        getLocalDateString()

    });

    saveSessions();

    updateStats();

    // Move to break

    pomodoroMode =
      "shortBreak";

    pomodoroRemainingSeconds =
      pomodoroLengths.shortBreak;

    alert(
      "Focus session complete!"
    );

  }


  // -----------------------------
  // BREAK FINISHED
  // -----------------------------

  else {

    pomodoroMode =
      "focus";

    pomodoroRemainingSeconds =
      pomodoroLengths.focus;

    alert(
      "Break complete!"
    );

  }


  savePomodoroState();

  updatePomodoroDisplay();
}



// ========================================
// SESSION STORAGE
// ========================================

function saveSessions() {

  localStorage.setItem(
    "sessions",
    JSON.stringify(sessions)
  );

}



// ========================================
// STATISTICS
// ========================================

function updateStats() {

  let today =
    getLocalDateString();


  // --------------------------------------
  // Total time
  // --------------------------------------

  let totalSeconds =
    sessions.reduce(
      function (sum, session) {

        return (
          sum +
          session.durationSeconds
        );

      },
      0
    );


  // --------------------------------------
  // Today's time
  // --------------------------------------

  let todaySeconds =
    sessions
      .filter(
        function (session) {

          return (
            session.date === today
          );

        }
      )

      .reduce(
        function (sum, session) {

          return (
            sum +
            session.durationSeconds
          );

        },
        0
      );


  // --------------------------------------
  // Number of Pomodoro focus sessions
  // --------------------------------------

  let pomodoroSessions =
    sessions.filter(
      function (session) {

        return (
          session.type ===
          "pomodoro"
        );

      }
    ).length;


  // --------------------------------------
  // Update page
  // --------------------------------------

  let sessionCountElement =
    document.getElementById(
      "sessionCount"
    );

  if (sessionCountElement) {

    sessionCountElement.textContent =
      "Sessions: " +
      sessions.length;

  }


  let pomodoroCountElement =
    document.getElementById(
      "pomodoroCount"
    );

  if (pomodoroCountElement) {

    pomodoroCountElement.textContent =
      "Pomodoro sessions: " +
      pomodoroSessions;

  }


  let todayElement =
    document.getElementById(
      "todayTime"
    );

  if (todayElement) {

    todayElement.textContent =
      "Today: " +
      Math.floor(
        todaySeconds / 60
      ) +
      " minutes";

  }


  let totalElement =
    document.getElementById(
      "totalTime"
    );

  if (totalElement) {

    totalElement.textContent =
      "Total time: " +
      formatTotalTime(
        totalSeconds
      );

  }


  // Update your existing calendar

  if (
    typeof generateCalendar ===
    "function"
  ) {

    generateCalendar();

  }

}



// ========================================
// RESET STATS
// ========================================

function resetStats() {

  sessions = [];

  saveSessions();

  updateStats();

}



// ========================================
// RESTORE STOPWATCH AFTER REFRESH
// ========================================

function restoreStopwatch() {

  let saved =
    localStorage.getItem(
      "stopwatchState"
    );

  if (!saved) {

    updateStopwatchDisplay();
    return;

  }


  let state =
    JSON.parse(saved);


  stopwatchStartTime =
    state.startTime || null;

  stopwatchElapsedBeforePause =
    state.elapsedBeforePause || 0;


  // If it was running when page closed,
  // resume display updates.

  if (
    stopwatchStartTime !== null
  ) {

    stopwatchInterval =
      setInterval(
        updateStopwatchDisplay,
        1000
      );

  }


  updateStopwatchDisplay();
}



// ========================================
// RESTORE POMODORO AFTER REFRESH
// ========================================

function restorePomodoro() {

  let saved =
    localStorage.getItem(
      "pomodoroState"
    );


  if (!saved) {

    updatePomodoroDisplay();
    return;

  }


  let state =
    JSON.parse(saved);


  pomodoroMode =
    state.mode ||
    "focus";


  pomodoroRemainingSeconds =
    state.remainingSeconds ??
    pomodoroLengths[
      pomodoroMode
    ];


  pomodoroEndTime =
    state.endTime || null;


  // Timer was running before refresh

  if (
    pomodoroEndTime !== null
  ) {

    // Timer finished while the page
    // was closed.

    if (
      Date.now() >=
      pomodoroEndTime
    ) {

      completePomodoro();

      return;

    }


    // Timer is still running.

    pomodoroInterval =
      setInterval(
        function () {

          let remaining =
            getPomodoroRemainingSeconds();

          updatePomodoroDisplay();

          if (
            remaining <= 0
          ) {

            completePomodoro();

          }

        },
        250
      );

  }


  updatePomodoroDisplay();
}



// ========================================
// START APP
// ========================================

restoreStopwatch();
restorePomodoro();
updateStats();

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
