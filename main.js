const paragraphs = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once. Typing practice is essential for improving your speed and accuracy on the keyboard.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. The best way to predict the future is to create it. Every expert was once a beginner.",
  "Programming is the art of telling another human being what one wants the computer to do. Good code is its own best documentation. The best error message is the one that never shows up.",
  "Learning to type quickly and accurately is a valuable skill in today's digital world. Practice makes perfect, and consistent effort leads to improvement. Keep pushing yourself to achieve better results.",
];

// Initialize DOM elements after document is ready
let textArea, timerDisplay, speedDisplay, errorsDisplay;

function initializeDOMElements() {
  textArea = document.getElementById("input");
  timerDisplay = document.getElementById("timer");
  speedDisplay = document.getElementById("speed");
  errorsDisplay = document.getElementById("errors");
}

// Call this when the document is ready
if (typeof document !== "undefined") {
  initializeDOMElements();
}

// DOM Elements
const quoteDisplay = document.getElementById("quote");
const resetButton = document.getElementById("reset");
const stopButton = document.getElementById("stopTest");
const resultsContainer = document.querySelector(".results-container");
const changeButton = document.getElementById("changeParagraph");
const speedCanvas = document.getElementById("speedCanvas");
const ctx = speedCanvas.getContext("2d");
const pausePlayBtn = document.getElementById("pausePlayBtn");
const pausePlayIcon = document.getElementById("pausePlayIcon");

// State variables
let currentParagraphIndex = 0;
let timer;
let timeElapsed = 0;
let isTyping = false;
let mistakes = 0;
let correctChars = 0;
let totalChars = 0;
let isPaused = false;
let pausedTime = 0;
let pauseStartTime = 0;

// Replace the handleInput function
function handleInput(e) {
  const inputText = e.target.value;
  const targetText = paragraphs[currentParagraphIndex];

  if (!isTyping && inputText.length === 1) {
    isTyping = true;
    startTimer();
    stopButton.disabled = false;
    changeButton.disabled = true;
    pausePlayBtn.disabled = false; // Enable pause button when typing starts
  }

  if (isTyping) {
    // Calculate accuracy in real-time
    correctChars = 0;
    totalChars = inputText.length;

    for (let i = 0; i < inputText.length; i++) {
      if (inputText[i] === targetText[i]) {
        correctChars++;
      }
    }

    // Update accuracy displays
    updateAccuracyDisplays();
    highlightErrors();
    updateSpeed();

    if (inputText.length === targetText.length) {
      finishTest();
    }
  }
}

// Add this new function
function updateAccuracyDisplays() {
  const accuracy =
    totalChars === 0 ? 0 : Math.round((correctChars / totalChars) * 100);

  // Update the fill bar
  const accuracyFill = document.getElementById("accuracy-fill");
  if (accuracyFill) {
    accuracyFill.style.width = `${accuracy}%`;
  }

  // Update the value display
  const finalAccuracy = document.getElementById("final-accuracy");
  if (finalAccuracy) {
    finalAccuracy.style.display = "block";
    finalAccuracy.textContent = `${accuracy}%`;
  }
}

// Update the startTimer function
function startTimer() {
  const startTime = Date.now() - timeElapsed * 1000 - pausedTime;
  timer = setInterval(() => {
    timeElapsed = Math.floor((Date.now() - startTime - pausedTime) / 1000);
    timerDisplay.textContent = `${timeElapsed}s`;
    updateSpeed();
  }, 1000);
}

function updateSpeed() {
  const wordsTyped = textArea.value.trim().split(/\s+/).length;
  const minutes = timeElapsed / 60;
  const wpm = Math.round(wordsTyped / minutes || 0);
  speedDisplay.textContent = `${wpm} WPM`;
}

// Fix the highlightErrors function
function highlightErrors() {
  const inputText = textArea.value;
  const quoteText = paragraphs[currentParagraphIndex];
  mistakes = 0;

  // Create HTML with highlighted errors
  let displayHtml = "";

  // Loop through the entire quote text
  for (let i = 0; i < quoteText.length; i++) {
    if (i < inputText.length) {
      // User has typed this character
      if (inputText[i] === quoteText[i]) {
        displayHtml += `<span class="correct">${quoteText[i]}</span>`;
      } else {
        displayHtml += `<span class="error">${quoteText[i]}</span>`;
        mistakes++;
      }
    } else if (i === inputText.length) {
      // Current character position
      displayHtml += `<span class="current">${quoteText[i]}</span>`;
    } else {
      // Not yet typed characters
      displayHtml += `<span class="remaining">${quoteText[i]}</span>`;
    }
  }

  // Update the display and errors count
  quoteDisplay.innerHTML = displayHtml;
  errorsDisplay.textContent = mistakes;
  updateErrors();
}

function drawSpeedometer(speed) {
  const width = speedCanvas.width;
  const height = speedCanvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;

  ctx.clearRect(0, 0, width, height);

  // Draw background arc
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
  ctx.lineWidth = 20;
  ctx.strokeStyle = "#e9ecef";
  ctx.stroke();

  // Draw speed arc
  const normalizedSpeed = Math.min(speed / 100, 1);
  const endAngle = Math.PI + Math.PI * normalizedSpeed;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, endAngle, false);
  ctx.lineWidth = 20;
  ctx.strokeStyle = `hsl(${120 * normalizedSpeed}, 70%, 45%)`;
  ctx.stroke();

  // Draw speed text
  ctx.fillStyle = "#2c3e50";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${speed} WPM`, centerX, centerY + 10);
}

// Update the finishTest function to show time in results
function finishTest() {
  clearInterval(timer);
  isTyping = false;
  textArea.disabled = true;
  stopButton.disabled = true;
  changeButton.disabled = false;
  pausePlayBtn.disabled = true;

  const words = textArea.value.trim().split(/\s+/).length;
  const minutes = timeElapsed / 60;
  const finalWpm = Math.round(words / minutes || 0);

  // Use the tracked accuracy
  const finalAccuracy =
    totalChars === 0 ? 0 : Math.round((correctChars / totalChars) * 100);

  // Update display with final stats
  speedDisplay.textContent = `${finalWpm} WPM`;

  // Update accuracy displays one last time
  const accuracyFill = document.getElementById("accuracy-fill");
  const finalAccuracyDisplay = document.getElementById("final-accuracy");

  if (accuracyFill) {
    accuracyFill.style.width = `${finalAccuracy}%`;
  }

  if (finalAccuracyDisplay) {
    finalAccuracyDisplay.style.display = "block";
    finalAccuracyDisplay.textContent = `${finalAccuracy}%`;
  }

  // Update time display in results
  const timeDisplay = document.getElementById("final-time");
  if (timeDisplay) {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    timeDisplay.textContent =
      minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  // Update graphical results
  drawSpeedometer(finalWpm);
  updateErrors();

  // Check failure conditions with accurate stats
  checkTestResults(finalWpm, timeElapsed);

  resultsContainer.classList.remove("hidden");
}

// Update the checkTestResults function
function checkTestResults(wpm, time) {
  const accuracy = Math.round((correctChars / totalChars) * 100) || 0;

  const successNotif = document.getElementById("successNotification");
  const warningNotif = document.getElementById("warningNotification");
  const failureNotif = document.getElementById("failureNotification");

  // Hide all notifications first
  [successNotif, warningNotif, failureNotif].forEach((notif) => {
    notif.classList.add("hidden");
    notif.classList.remove("show");
  });

  // Perfect pass: Under 45 seconds with required WPM and accuracy
  const perfectPass = wpm >= 30 && accuracy >= 90 && time <= 45;
  // Close pass: Between 45-60 seconds with required WPM and accuracy
  const closePass = wpm >= 30 && accuracy >= 90 && time > 45 && time <= 60;

  if (perfectPass) {
    // Update success notification
    document.getElementById("finalSpeedValue").textContent = `${wpm} WPM`;
    document.getElementById("finalAccuracyValue").textContent = `${accuracy}%`;
    document.getElementById("finalTimeValue").textContent = `${time}s`;
    successNotif.classList.remove("hidden");
    successNotif.classList.add("show");
  } else if (closePass) {
    // Show warning notification for close pass
    document.getElementById("warningSpeedValue").textContent = `${wpm} WPM`;
    document.getElementById(
      "warningAccuracyValue"
    ).textContent = `${accuracy}%`;
    document.getElementById("warningTimeValue").textContent = `${time}s`;
    warningNotif.classList.remove("hidden");
    warningNotif.classList.add("show");
  } else {
    // Build failure message
    let reasons = [];
    if (wpm < 30) reasons.push(`Speed: ${wpm} WPM (need 30+ WPM)`);
    if (accuracy < 90) reasons.push(`Accuracy: ${accuracy}% (need 90%+)`);
    if (time > 60) reasons.push(`Time: ${time}s (must be under 60s)`);
    document.getElementById("failureReason").textContent = reasons.join("\n");
    failureNotif.classList.remove("hidden");
    failureNotif.classList.add("show");
  }
}

function showNotification(type, message) {
  const notification = document.getElementById(`${type}Notification`);
  if (notification) {
    notification.classList.remove("hidden");
    setTimeout(() => {
      notification.classList.add("hidden");
    }, 5000);
  }
}

function stopTest() {
  if (isTyping) {
    finishTest();
  }
}

// Update the resetTest function
function resetTest() {
  isTyping = false;
  clearInterval(timer);
  timeElapsed = 0;
  mistakes = 0;
  textArea.value = "";
  textArea.disabled = false;
  timerDisplay.textContent = "0s";
  if (document.getElementById("final-time")) {
    document.getElementById("final-time").textContent = "0s";
  }
  speedDisplay.textContent = "0 WPM";
  errorsDisplay.textContent = "0";
  quoteDisplay.innerHTML = paragraphs[currentParagraphIndex];
  stopButton.disabled = true;
  changeButton.disabled = false;
  resultsContainer.classList.add("hidden");
  isPaused = false;
  pausedTime = 0;
  pauseStartTime = 0;
  pausePlayIcon.src = "pause.png";
  pausePlayBtn.disabled = true;

  // Reset graphical elements
  drawSpeedometer(0);
  document.getElementById("accuracy-fill").style.width = "0%";
  document.getElementById("error-bar").style.height = "0%";
  correctChars = 0;
  totalChars = 0;
}

function changeParagraph() {
  if (!isTyping) {
    currentParagraphIndex = (currentParagraphIndex + 1) % paragraphs.length;
    quoteDisplay.textContent = paragraphs[currentParagraphIndex];
    resetTest();
  }
}

// Initialize canvas
function initializeCanvas() {
  speedCanvas.width = 200;
  speedCanvas.height = 200;
  drawSpeedometer(0);
}

function updateErrors() {
  const errorBar = document.getElementById("error-bar");
  const errorPercentage = Math.max(
    15,
    ((mistakes * 4) / paragraphs[currentParagraphIndex].length) * 100
  );
  const finalPercentage = Math.min(errorPercentage, 100);

  // Update height and error count
  errorBar.style.height = `${finalPercentage}%`;

  // Create or update error count label
  let errorLabel = document.querySelector(".error-label");
  if (!errorLabel) {
    errorLabel = document.createElement("div");
    errorLabel.className = "error-label";
    errorBar.parentElement.appendChild(errorLabel);
  }
  errorLabel.textContent = `${mistakes} Errors`;
}

// Add this new function
function togglePausePlay() {
  if (!isTyping) return;

  isPaused = !isPaused;

  if (isPaused) {
    // Pause the test
    clearInterval(timer);
    pauseStartTime = Date.now();
    pausePlayIcon.src = "play.png";
    textArea.disabled = true;

    // Show pause notification
    showNotification("info", "Test paused. Click play to resume.");
  } else {
    // Resume the test
    pausedTime += Date.now() - pauseStartTime;
    startTimer();
    pausePlayIcon.src = "pause.png";
    textArea.disabled = false;
    textArea.focus();
  }
}

// Event Listeners
textArea.addEventListener("input", handleInput);
stopButton.addEventListener("click", stopTest);
resetButton.addEventListener("click", resetTest);
changeButton.addEventListener("click", changeParagraph);
pausePlayBtn.addEventListener("click", togglePausePlay);
document.getElementById("closeResults").addEventListener("click", () => {
  resultsContainer.classList.add("hidden");
});

document.getElementById("infoButton").addEventListener("click", () => {
  const infoPopup = document.getElementById("infoPopup");
  infoPopup.classList.add("show");
});

document.getElementById("closeInfo").addEventListener("click", () => {
  const infoPopup = document.getElementById("infoPopup");
  infoPopup.classList.remove("show");
});

// Close on outside click
document.getElementById("infoPopup").addEventListener("click", (e) => {
  if (e.target.id === "infoPopup") {
    e.target.classList.remove("show");
  }
});

document.querySelectorAll(".notification-close").forEach((button) => {
  button.addEventListener("click", () => {
    const notification = button.closest(".notification");
    if (notification) {
      notification.classList.remove("show");
      notification.classList.add("hidden");
    }
  });
});

// Initialize
initializeCanvas();
resetTest();

// Export functions for testing
function calculateAccuracy(correctChars, totalChars) {
  return Math.round((correctChars / totalChars) * 100);
}

// Update the checkFailureConditions function
function checkFailureConditions(wpm, errors, duration) {
  if (wpm < 30) {
    return { failed: true, reason: "typing speed is too low" };
  }
  if (errors > 10) {
    return { failed: true, reason: "too many errors" };
  }
  if (duration > 45) {
    return { failed: true, reason: "time limit exceeded" };
  }
  return { failed: false, reason: "" };
}

// Add to your initialization code
pausePlayBtn.disabled = true;
