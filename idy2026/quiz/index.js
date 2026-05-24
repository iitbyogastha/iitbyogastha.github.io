// Paste your Google Apps Script Web App URL here
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwoFgskZkSIv3j6mPA0RngXtfWQHsaAi5unNqO9VlMsHbAD2zDXhJWz09HqGL_SxUhCZg/exec";

const QUIZ_CONFIG = {
  secondsPerQuestion: 20,
  competitionStart: "2026-05-24T08:00:00+05:30",
  competitionEnd: "2026-05-24T20:00:00+05:30",
  storageKey: "idy2026QuizState",
  localLeaderboardKey: "idy2026QuizLocalLeaderboard"
};

const questions = [
  {
    id: "q1",
    prompt: "International Day of Yoga is observed every year on which date?",
    options: ["1 January", "21 June", "15 August", "5 September"]
  },
  {
    id: "q2",
    prompt: "Which Sanskrit word is commonly translated as union or integration?",
    options: ["Yoga", "Ahimsa", "Prana", "Dharana"]
  },
  {
    id: "q3",
    prompt: "Which practice is most directly associated with regulated breathing?",
    options: ["Pranayama", "Trataka", "Yama", "Asana"]
  },
  {
    id: "q4",
    prompt: "Surya Namaskar is commonly known in English as what?",
    options: ["Moon Salutation", "Sun Salutation", "Lotus Seat", "Breath Retention"]
  },
  {
    id: "q5",
    prompt: "In the eight limbs of yoga, which limb refers to physical postures?",
    options: ["Dhyana", "Pratyahara", "Asana", "Samadhi"]
  },
  {
    id: "q6",
    prompt: "Which of these is a common benefit associated with regular mindfulness practice?",
    options: ["Improved focus", "Reduced need for sleep entirely", "Instant cure for all illness", "Loss of hydration"]
  },
  {
    id: "q7",
    prompt: "What is Shavasana most commonly used for at the end of a yoga session?",
    options: ["Deep relaxation", "Fast running", "Jump training", "Strength testing"]
  },
  {
    id: "q8",
    prompt: "Which ministry in India is closely associated with promoting International Day of Yoga activities?",
    options: ["Ministry of AYUSH", "Ministry of Railways", "Ministry of Coal", "Ministry of Power"]
  },
  {
    id: "q9",
    prompt: "Trataka is primarily a practice of concentration using what kind of focus?",
    options: ["Steady gazing", "Rapid jumping", "Loud chanting only", "Random movement"]
  },
  {
    id: "q10",
    prompt: "Which principle is usually understood as non-violence in yogic ethics?",
    options: ["Ahimsa", "Aparigraha", "Tapas", "Svadhyaya"]
  }
];

const localAnswerKey = {
  q1: 1,
  q2: 0,
  q3: 0,
  q4: 1,
  q5: 2,
  q6: 0,
  q7: 0,
  q8: 0,
  q9: 0,
  q10: 0
};

const state = {
  name: "",
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
    currentIndex: state.currentIndex,
    answers: state.answers,
    startedAt: state.startedAt,
    questionStartedAt: state.questionStartedAt,
    questionOrder: state.questionOrder,
    submitted: state.submitted
  };
  localStorage.setItem(QUIZ_CONFIG.storageKey, JSON.stringify(payload));
}

function restoreState() {
  const raw = localStorage.getItem(QUIZ_CONFIG.storageKey);
  if (!raw) return false;

  try {
    const saved = JSON.parse(raw);
    if (!saved.startedAt || saved.submitted) return false;
    state.name = saved.name || "";
    state.currentIndex = saved.currentIndex || 0;
    state.answers = saved.answers || {};
    state.startedAt = saved.startedAt;
    state.questionStartedAt = saved.questionStartedAt || saved.startedAt;
    state.questionOrder = saved.questionOrder || questions.map(q => q.id);
    els.participantName.value = state.name;
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

function beginQuiz(name) {
  state.name = name.trim();

  if (!state.name) {
    showNotice("Please enter your name.");
    return;
  }

  const leaderboard = getLocalLeaderboard();
  const isDuplicate = leaderboard.some(entry => entry.name.toLowerCase() === state.name.toLowerCase());
  if (isDuplicate) {
    showNotice("You have already submitted the quiz under this name.");
    return;
  }

  const now = new Date();
  const endTime = new Date(QUIZ_CONFIG.competitionEnd);
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
    submittedAt: entry.submittedAt,
    score,
    total,
    elapsedSeconds,
    rank: getLocalLeaderboard().findIndex(item => item.name === state.name && item.submittedAt === entry.submittedAt) + 1 || "--",
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
    beginQuiz(els.participantName.value);
  });

  els.submitBtn.addEventListener("click", () => submitQuiz(false));
}

function init() {
  els.durationLabel.textContent = `${QUIZ_CONFIG.secondsPerQuestion}s / Q`;
  els.questionCountLabel.textContent = String(questions.length);
  updateStatus();
  bindEvents();

  if (restoreState()) {
    showNotice("Your in-progress quiz was restored from this browser.");
    setView(els.questionView);
    renderQuestion();
    startTimer();
  }
}

init();
