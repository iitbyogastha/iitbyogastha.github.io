// Paste your Google Apps Script Web App URL here
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxSihB9KvWqjsWPa-ETW5qWOvjAPIIGDECUXM0QwEpXVRIP-ZzCW0flExto41JvLyjwow/exec";

const QUIZ_CONFIG = {
  secondsPerQuestion: 20,
  storageKey: "idy2026QuizState",
  localLeaderboardKey: "idy2026QuizLocalLeaderboard"
};

let questions = [];
let localAnswerKey = {};
let activeConfig = null;
let currentStorageKey = QUIZ_CONFIG.storageKey;

function getActiveQuizConfig() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  const hours = now.getHours();

  if (month === 4) { // May is month 4 (0-indexed)
    if (date >= 4 && date <= 7) {
      if (hours >= 8 && hours < 20) {
        return {
          filename: `Yoga_Quiz_Set_${date - 3}.txt`,
          start: new Date(year, month, date, 8, 0, 0),
          end: new Date(year, month, date, 20, 0, 0)
        };
      }
    } else if (date === 30) {
      return {
        filename: `test.txt`,
        start: new Date(year, month, date, 0, 0, 0),
        end: new Date(year, month, date, 23, 59, 59)
      };
    }
  }
  return null;
}

const state = {
  name: "",
  email: "",
  phone: "",
  currentIndex: 0,
  answers: {},
  startedAt: null,
  questionStartedAt: null,
  questionOrder: [],
  submitted: false,
  timerId: null
};

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const els = {
  durationLabel: document.getElementById("durationLabel"),
  questionCountLabel: document.getElementById("questionCountLabel"),
  statusText: document.getElementById("statusText"),
  timerText: document.getElementById("timerText"),
  progressText: document.getElementById("progressText"),
  connectionNotice: document.getElementById("connectionNotice"),
  participantForm: document.getElementById("participantForm"),
  participantName: document.getElementById("participantName"),
  participantEmail: document.getElementById("participantEmail"),
  participantPhone: document.getElementById("participantPhone"),
  startView: document.getElementById("startView"),
  questionView: document.getElementById("questionView"),
  resultView: document.getElementById("resultView"),
  questionDots: document.getElementById("questionDots"),
  questionMeta: document.getElementById("questionMeta"),
  answeredMeta: document.getElementById("answeredMeta"),
  questionText: document.getElementById("questionText"),
  optionsList: document.getElementById("optionsList"),
  submitBtn: document.getElementById("submitBtn"),
  scoreTitle: document.getElementById("scoreTitle"),
  scoreSummary: document.getElementById("scoreSummary"),
  scoreValue: document.getElementById("scoreValue"),
  elapsedValue: document.getElementById("elapsedValue"),
  rankValue: document.getElementById("rankValue"),
  reviewList: document.getElementById("reviewList"),
  leaderboardBody: document.getElementById("leaderboardBody")
};



function showNotice(message) {
  els.connectionNotice.hidden = false;
  els.connectionNotice.textContent = message;
}

function setView(view) {
  [els.startView, els.questionView, els.resultView].forEach(item => item.classList.remove("is-active"));
  view.classList.add("is-active");
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function getElapsedSeconds(finishedAt = Date.now()) {
  if (!state.startedAt) return 0;
  return Math.max(0, Math.round((finishedAt - state.startedAt) / 1000));
}

function getRemainingSeconds() {
  if (!state.questionStartedAt) return QUIZ_CONFIG.secondsPerQuestion;
  const elapsed = (Date.now() - state.questionStartedAt) / 1000;
  return Math.max(0, QUIZ_CONFIG.secondsPerQuestion - Math.floor(elapsed));
}

function updateStatus() {
  const answered = Object.keys(state.answers).length;
  els.progressText.textContent = `${answered} / ${questions.length}`;
  els.timerText.textContent = formatTime(getRemainingSeconds());
  els.statusText.textContent = state.submitted ? "Submitted" : state.startedAt ? "In progress" : "Ready";
}

function saveState() {
  const payload = {
    name: state.name,
    email: state.email,
    phone: state.phone,
    currentIndex: state.currentIndex,
    answers: state.answers,
    startedAt: state.startedAt,
    questionStartedAt: state.questionStartedAt,
    questionOrder: state.questionOrder,
    submitted: state.submitted
  };
  localStorage.setItem(currentStorageKey, JSON.stringify(payload));
}

function restoreState() {
  const raw = localStorage.getItem(currentStorageKey);
  if (!raw) return false;

  try {
    const saved = JSON.parse(raw);
    if (!saved.startedAt || saved.submitted) return false;
    state.name = saved.name || "";
    state.email = saved.email || "";
    state.phone = saved.phone || "";
    state.currentIndex = saved.currentIndex || 0;
    state.answers = saved.answers || {};
    state.startedAt = saved.startedAt;
    state.questionStartedAt = saved.questionStartedAt || saved.startedAt;
    state.questionOrder = saved.questionOrder || questions.map(q => q.id);
    els.participantName.value = state.name;
    if (els.participantEmail) els.participantEmail.value = state.email;
    if (els.participantPhone) els.participantPhone.value = state.phone;
    return getRemainingSeconds() > 0;
  } catch {
    return false;
  }
}

function renderDots() {
  els.questionDots.innerHTML = "";
  questions.forEach((question, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "question-dot";
    button.textContent = index + 1;
    if (index === state.currentIndex) button.classList.add("is-current");
    const qId = state.questionOrder[index];
    if (qId && state.answers[qId] !== undefined) button.classList.add("is-answered");
    button.disabled = true;
    els.questionDots.appendChild(button);
  });
}

function renderQuestion() {
  const questionId = state.questionOrder[state.currentIndex];
  const question = questions.find(q => q.id === questionId);
  const answerData = state.answers[question.id];
  const selected = typeof answerData === 'object' ? answerData.selectedIndex : answerData;

  els.questionMeta.textContent = `Question ${state.currentIndex + 1} of ${questions.length}`;
  els.answeredMeta.textContent = selected === undefined ? "Not answered" : "Answered";
  els.questionText.textContent = question.prompt;
  els.optionsList.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    if (selected === index) button.classList.add("is-selected");
    button.innerHTML = `<strong>${String.fromCharCode(65 + index)}</strong>${option}`;
    button.addEventListener("click", () => {
      if (state.answers[question.id] === undefined) {
        state.answers[question.id] = {
          selectedIndex: index,
          remainingSeconds: getRemainingSeconds()
        };
        if (state.currentIndex < questions.length - 1) {
          state.currentIndex++;
          state.questionStartedAt = Date.now();
          renderQuestion();
          saveState();
        } else {
          submitQuiz(true);
        }
      }
    });
    els.optionsList.appendChild(button);
  });

  renderDots();
  updateStatus();
}

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    updateStatus();
    if (getRemainingSeconds() <= 0 && !state.submitted) {
      if (state.currentIndex < questions.length - 1) {
        state.currentIndex++;
        state.questionStartedAt = Date.now();
        renderQuestion();
        saveState();
      } else {
        submitQuiz(true);
      }
    }
  }, 1000);
}

function beginQuiz(name, email, phone) {
  state.name = name.trim();
  state.email = email.trim();
  state.phone = phone.trim();

  if (!state.name) {
    showNotice("Please enter your name.");
    return;
  }

  if (!state.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    showNotice("Please enter a valid email address.");
    return;
  }

  if (!state.phone || !/^\d{10}$/.test(state.phone)) {
    showNotice("Please enter a valid 10-digit phone number.");
    return;
  }

  const leaderboard = getLocalLeaderboard();
  const isDuplicate = leaderboard.some(entry => entry.email && entry.email.toLowerCase() === state.email.toLowerCase());
  if (isDuplicate) {
    showNotice("You have already submitted the quiz with this email address.");
    return;
  }

  const now = new Date();
  const endTime = activeConfig ? activeConfig.end : new Date(0);
  if (now > endTime) {
    showNotice("The quiz has ended and the leaderboard is frozen. No new attempts can be started.");
    return;
  }

  state.questionOrder = shuffle(questions.map(q => q.id));
  state.startedAt = state.startedAt || Date.now();
  state.questionStartedAt = Date.now();
  state.submitted = false;
  setView(els.questionView);
  renderQuestion();
  startTimer();
  saveState();
}

function localScoreAttempt(finishedAt) {
  let score = 0;
  const review = questions.map(question => {
    const answerData = state.answers[question.id];
    const selectedIndex = typeof answerData === 'object' ? answerData.selectedIndex : answerData;
    const correctIndex = localAnswerKey[question.id];
    const isCorrect = selectedIndex === correctIndex;

    let points = 0;
    if (isCorrect) {
      const remainingSeconds = typeof answerData === 'object' && answerData.remainingSeconds !== undefined ? answerData.remainingSeconds : 0;
      const timeTaken = QUIZ_CONFIG.secondsPerQuestion - remainingSeconds;

      if (timeTaken <= 2) {
        points = 100;
      } else if (timeTaken <= 5) {
        points = 90;
      } else if (timeTaken <= 10) {
        points = 75;
      } else if (timeTaken <= 15) {
        points = 50;
      } else if (timeTaken < 19) {
        points = 25;
      }
    }
    score += points;

    return {
      id: question.id,
      prompt: question.prompt,
      options: question.options,
      selectedIndex,
      correctIndex,
      isCorrect,
      points
    };
  });

  const elapsedSeconds = getElapsedSeconds(finishedAt);
  const total = questions.length * 100;

  const entry = {
    name: state.name,
    email: state.email,
    phone: state.phone,
    score,
    total,
    elapsedSeconds,
    submittedAt: new Date(finishedAt).toISOString()
  };
  const leaderboard = getLocalLeaderboard();

  leaderboard.push(entry);
  leaderboard.sort(sortLeaderboard);
  localStorage.setItem(QUIZ_CONFIG.localLeaderboardKey, JSON.stringify(leaderboard.slice(0, 20)));

  return {
    name: entry.name,
    email: entry.email,
    phone: entry.phone,
    submittedAt: entry.submittedAt,
    score,
    total,
    elapsedSeconds,
    rank: getLocalLeaderboard().findIndex(item => item.email === state.email && item.submittedAt === entry.submittedAt) + 1 || "--",
    review
  };
}

function sortLeaderboard(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  if (a.elapsedSeconds !== b.elapsedSeconds) return a.elapsedSeconds - b.elapsedSeconds;
  return new Date(a.submittedAt) - new Date(b.submittedAt);
}

function getLocalLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(QUIZ_CONFIG.localLeaderboardKey)) || [];
  } catch {
    return [];
  }
}

async function submitQuiz(isAutoSubmit = false) {
  if (state.submitted) return;

  const unanswered = questions.length - Object.keys(state.answers).length;
  if (!isAutoSubmit && unanswered > 0) {
    const shouldSubmit = window.confirm(`${unanswered} question(s) are unanswered. Submit anyway?`);
    if (!shouldSubmit) return;
  }

  state.submitted = true;
  clearInterval(state.timerId);
  updateStatus();
  saveState();

  const finishedAt = Date.now();

  try {
    const result = localScoreAttempt(finishedAt);

    if (SCRIPT_URL) {
      try {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            name: result.name,
            email: result.email,
            phone: result.phone,
            score: result.score,
            total: result.total,
            elapsedSeconds: result.elapsedSeconds,
            submittedAt: result.submittedAt
          }),
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
      } catch (e) {
        console.warn("Could not save to Google Sheets", e);
      }
    }

    renderResult(result);
  } catch (error) {
    state.submitted = false;
    saveState();
    showNotice(error.message || "Submission failed. Please check your connection and try again.");
    console.error(error);
  }
}

function renderResult(result) {
  setView(els.resultView);

  let count = 10;
  els.scoreValue.textContent = `Redirecting to homepage in ${count}...`;

  const timerId = setInterval(() => {
    count--;
    els.scoreValue.textContent = `Redirecting to homepage in ${count}...`;
    if (count <= 0) {
      clearInterval(timerId);
      window.location.href = "../index.html";
    }
  }, 1000);
}

function bindEvents() {
  els.participantForm.addEventListener("submit", event => {
    event.preventDefault();
    beginQuiz(els.participantName.value, els.participantEmail.value, els.participantPhone.value);
  });

  els.submitBtn.addEventListener("click", () => submitQuiz(false));
}

async function init() {
  els.durationLabel.textContent = `${QUIZ_CONFIG.secondsPerQuestion}s / Q`;

  activeConfig = getActiveQuizConfig();
  if (!activeConfig) {
    els.questionCountLabel.textContent = "0";
    showNotice("No quiz is active at this time.");
    els.participantName.disabled = true;
    if (els.participantEmail) els.participantEmail.disabled = true;
    if (els.participantPhone) els.participantPhone.disabled = true;
    const submitBtn = els.participantForm.querySelector('button');
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  currentStorageKey = QUIZ_CONFIG.storageKey + "_" + activeConfig.filename;

  try {
    const res = await fetch(activeConfig.filename);
    if (!res.ok) throw new Error("Could not fetch questions.");
    const text = await res.text();

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let currentQuestion = null;
    let options = [];

    for (let line of lines) {
      if (line.match(/^\d+\.\s/)) {
        if (currentQuestion) {
          questions.push({
            id: `q${questions.length + 1}`,
            prompt: currentQuestion,
            options: options
          });
          options = [];
        }
        currentQuestion = line.replace(/^\d+\.\s*/, '');
      } else if (line.match(/^[A-D]\)\s/)) {
        options.push(line.replace(/^[A-D]\)\s*/, ''));
      } else if (line.startsWith('Answer:')) {
        const ansMatch = line.match(/Answer:\s*([A-D])\)/);
        if (ansMatch) {
          localAnswerKey[`q${questions.length + 1}`] = ansMatch[1].charCodeAt(0) - 65;
        }
      }
    }

    if (currentQuestion) {
      questions.push({
        id: `q${questions.length + 1}`,
        prompt: currentQuestion,
        options: options
      });
    }

    els.questionCountLabel.textContent = String(questions.length);
    updateStatus();
    bindEvents();

    if (restoreState()) {
      showNotice("Your in-progress quiz was restored from this browser.");
      setView(els.questionView);
      renderQuestion();
      startTimer();
    }
  } catch (error) {
    console.error(error);
    showNotice("Failed to load quiz questions.");
    els.participantName.disabled = true;
    const submitBtn = els.participantForm.querySelector('button');
    if (submitBtn) submitBtn.disabled = true;
  }
}

init();
