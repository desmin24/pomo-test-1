// 隨機鼓勵語陣列
const encouragements = [
  "太棒了！你完成一輪番茄鐘，記得給自己一個微笑！",
  "完成任務好厲害，喝口水休息一下！",
  "棒棒！專注的你最閃耀，快去休息一下～",
  "你已經前進一大步，給自己掌聲！",
  "很棒哦，記得伸伸懶腰再開始！"
];

let tasks = [];
let timers = {};

const taskInput = document.getElementById('taskInput');
const minuteInput = document.getElementById('minuteInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const alarmSound = document.getElementById('alarmSound');
const alarmCheckbox = document.getElementById('alarmCheckbox');

addTaskBtn.addEventListener('click', function () {
  const name = taskInput.value.trim();
  const minutes = parseInt(minuteInput.value, 10);
  const alarm = alarmCheckbox.checked;
  if (!name) return alert('請輸入任務名稱！');
  const taskId = Date.now();
  tasks.push({ id: taskId, name, minutes, alarm });
  taskInput.value = '';
  renderTasks();
});

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'task-info';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'task-name';
    nameSpan.textContent = task.name;

    const timerSpan = document.createElement('span');
    timerSpan.className = 'timer';
    timerSpan.textContent = (timers[task.id] && timers[task.id].running)
      ? formatTime(timers[task.id].timeLeft)
      : `${task.minutes}:00`;

    infoDiv.appendChild(nameSpan);
    infoDiv.appendChild(timerSpan);

    // 功能按鈕
    const btnDiv = document.createElement('div');
    btnDiv.className = 'task-btns';

    const startBtn = document.createElement('button');
    startBtn.textContent = '開始計時';
    startBtn.onclick = function () { startTimer(task, timerSpan, btnDiv); };

    const resetBtn = document.createElement('button');
    resetBtn.textContent = '重設';
    resetBtn.onclick = function () { resetTimer(task.id, timerSpan, task.minutes); };

    const delBtn = document.createElement('button');
    delBtn.textContent = '刪除';
    delBtn.className = 'delete-btn';
    delBtn.onclick = function () { deleteTask(task.id); };

    btnDiv.appendChild(startBtn);
    btnDiv.appendChild(resetBtn);
    btnDiv.appendChild(delBtn);

    li.appendChild(infoDiv);
    li.appendChild(btnDiv);
    taskList.appendChild(li);
  });
}

// 開始倒數
function startTimer(task, timerElem, btnDiv, isRest = false) {
  if (!timers[task.id]) {
    timers[task.id] = { timeLeft: (isRest ? 15 : task.minutes) * 60, running: false, interval: null, isRest };
  }
  // 如果有倒數正在跑就不再啟動
  if (timers[task.id].running) return;

  timers[task.id].running = true;
  // 修改按鈕顯示
  if (btnDiv) {
    btnDiv.querySelectorAll('button').forEach(btn => btn.disabled = true);
    // 休息倒數時可刪除任務
    if (isRest) btnDiv.querySelector('.delete-btn').disabled = false;
  }

  timers[task.id].interval = setInterval(() => {
    timers[task.id].timeLeft -= 1;
    timerElem.textContent = formatTime(timers[task.id].timeLeft);

    if (timers[task.id].timeLeft <= 0) {
      clearInterval(timers[task.id].interval);
      timers[task.id].running = false;
      timerElem.textContent = "00:00";
      // 鬧鐘響
      if ((task.alarm !== false) && !isRest) alarmSound.play();

      setTimeout(() => {
        if (!isRest) {
          // 完成任務，顯示鼓勵語
          alert(getRandomEncouragement());
          // 進入15分鐘休息
          timerElem.textContent = "15:00";
          timers[task.id] = null; // 清掉任務倒數
          startRestCountdown(task, timerElem, btnDiv);
        } else {
          // 休息結束
          alert("休息結束！準備進入下一輪吧！");
          resetTimer(task.id, timerElem, task.minutes);
        }
      }, 300);
    }
  }, 1000);
}

// 休息倒數（15分鐘）
function startRestCountdown(task, timerElem, btnDiv) {
  // 新增一個休息倒數
  timers[task.id] = { timeLeft: 15 * 60, running: false, interval: null, isRest: true };
  startTimer(task, timerElem, btnDiv, true);
}

// 重設倒數
function resetTimer(taskId, timerElem, minutes) {
  if (timers[taskId]) {
    clearInterval(timers[taskId].interval);
    timers[taskId] = null;
  }
  timerElem.textContent = `${minutes}:00`;
  // 啟用所有按鈕
  const li = timerElem.closest('.task-item');
  if (li) li.querySelectorAll('button').forEach(btn => btn.disabled = false);
}

// 刪除任務
function deleteTask(taskId) {
  if (timers[taskId]) {
    clearInterval(timers[taskId].interval);
    timers[taskId] = null;
  }
  tasks = tasks.filter(t => t.id !== taskId);
  renderTasks();
}

// 時間格式
function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function getRandomEncouragement() {
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}

renderTasks();
