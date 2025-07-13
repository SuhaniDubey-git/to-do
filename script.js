function formatDate(dateStr) {
  return new Date(dateStr).setHours(0,0,0,0);
}

function createTaskCard(title, date, completed = false, target = "planned") {
  const taskList = document.getElementById(
    target === "pending" ? "task-list-pending" : "task-list-planned"
  );

  const taskItem = document.createElement("div");
  taskItem.className = "task";
  if (completed) taskItem.classList.add("completed");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = completed;

  const taskText = document.createElement("span");
  taskText.innerHTML = `<strong>${title}</strong><br/><small>${date || "No deadline"}</small>`;

  const delBtn = document.createElement("button");
  delBtn.className = "delete-task";
  delBtn.innerText = "X";

  taskItem.appendChild(checkbox);
  taskItem.appendChild(taskText);
  taskItem.appendChild(delBtn);
  taskList.appendChild(taskItem);

  checkbox.addEventListener("change", () => {
    taskItem.classList.toggle("completed", checkbox.checked);
    updateTaskStatus(title, date, checkbox.checked);
    loadTasks();
    updateCounter();
  });

  delBtn.addEventListener("click", () => {
    deleteTaskCard(taskItem, title, date);
  });

  updateCounter();
}

function updateTaskStatus(title, date, completed) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.map(t => {
    if (t.title === title && t.date === date) t.completed = completed;
    return t;
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}



function deleteTaskCard(taskItem, title, date) {
  taskItem.remove();
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter(t => !(t.title === title && t.date === date));
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateCounter();
  loadTasks();
}

function updateCounter() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  document.getElementById("task-counter").textContent = `${total} task${total !== 1 ? "s" : ""} total, ${completed} completed`;
}

function loadTasks() {
  document.getElementById("task-list-planned").innerHTML = "";
  document.getElementById("task-list-pending").innerHTML = "";

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const today = new Date().setHours(0, 0, 0, 0);

  const todayAndFuture = [];
  const pastIncomplete = [];

  tasks.forEach(task => {
    const taskDate = formatDate(task.date);
    if (!task.date || taskDate >= today || task.completed) {
      todayAndFuture.push(task);
    } else if (taskDate < today && !task.completed) {
      pastIncomplete.push(task);
    }
  });

  todayAndFuture.sort((a, b) => new Date(a.date) - new Date(b.date));
  pastIncomplete.sort((a, b) => new Date(a.date) - new Date(b.date));

  todayAndFuture.forEach(t =>
    createTaskCard(t.title, t.date, t.completed, "planned")
  );

  pastIncomplete.forEach(t =>
    createTaskCard(t.title, t.date, t.completed, "pending")
  );
}

document.getElementById("add-task").addEventListener("click", () => {
  const titleInput = document.getElementById("task-title");
  const dateInput = document.getElementById("task-date");
  const warning = document.getElementById("warning-msg");

  const title = titleInput.value.trim();
  let date = dateInput.value;

  // Clear previous warning
  warning.textContent = "";
  dateInput.style.border = "1px solid #ccc";

  if (!title) {
    warning.textContent = "Please enter a task title.";
    titleInput.style.border = "2px solid red";
    titleInput.focus();
    return;
  }

  if (!date) {
    // Auto-set to today
    const now = new Date();
    date = now.toISOString().split("T")[0];
  }

  const selectedDate = new Date(date).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    warning.textContent = "❌ You cannot select a past date!";
    dateInput.style.border = "2px solid red";
    dateInput.focus();
    return;
  }

  saveTask(title, date);
  loadTasks();

  // Clear inputs and warnings
  titleInput.value = "";
  dateInput.value = "";
  warning.textContent = "";
  titleInput.style.border = "1px solid #ccc";
});




function updateDigitalClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('digital-clock').textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateDigitalClock, 1000);
updateDigitalClock();

function generateCalendar() {
  const calendarEl = document.getElementById("calendar");
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const today = now.getDate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  let html = `<div class="month-header">${now.toLocaleString('default', { month: 'long' })} ${year}</div>`;
  html += "<table><tr>";
  ["S","M","T","W","T","F","S"].forEach(d => html += `<th>${d}</th>`);
  html += "</tr><tr>";

  for (let i = 0; i < startDay; i++) html += "<td></td>";

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today;
    html += `<td class="${isToday ? 'today' : ''}">${d}</td>`;
    if ((startDay + d) % 7 === 0) html += "</tr><tr>";
  }

  html += "</tr></table>";
  calendarEl.innerHTML = html;
}

generateCalendar();
function saveTask(title, date) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push({ title, date, completed: false });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

loadTasks();
// Theme Toggle
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  // Optionally, store theme preference
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

// Apply stored theme on load
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
});
let timerInterval = null;
let timeLeft = 0;

const display = document.getElementById("timer-display");
const startBtn = document.getElementById("start-timer");
const pauseBtn = document.getElementById("pause-timer");
const resetBtn = document.getElementById("reset-timer");
const customTimeInput = document.getElementById("custom-time");

function updateTimerDisplay() {
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  display.textContent = `${mins}:${secs}`;
}

function startTimer() {
  if (timerInterval) return;

  // If timer not set, read from input
  if (timeLeft === 0) {
    const inputMinutes = parseInt(customTimeInput.value);
    if (!inputMinutes || inputMinutes < 1) {
      alert("Please enter a valid time in minutes.");
      return;
    }
    timeLeft = inputMinutes * 60;
  }

  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("⏰ Time's up!");
    }
  }, 1000);

  updateTimerDisplay();
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  pauseTimer();
  timeLeft = 0;
  updateTimerDisplay();
  customTimeInput.value = "";
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

// Set initial state
updateTimerDisplay();
