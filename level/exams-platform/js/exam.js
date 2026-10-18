let currentExam = null;
let currentQuestionIndex = 0;
let userAnswers = {};
let markedQuestions = {};
let timerInterval = null;
let timeLeft = 0;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('id');

    currentExam = IT_EXAMS.find(e => e.id === examId);
    if (!currentExam) {
        alert('الامتحان غير موجود!');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('exam-title-header').textContent = currentExam.title;
    
    const savedState = JSON.parse(localStorage.getItem(`active_exam_${examId}`) || 'null');
    if (savedState) {
        userAnswers = savedState.userAnswers || {};
        currentQuestionIndex = Number.isInteger(savedState.currentQuestionIndex) ? savedState.currentQuestionIndex : 0;
        timeLeft = savedState.timeLeft || (currentExam.durationMinutes * 60);
    } else {
        timeLeft = currentExam.durationMinutes * 60;
    }

    startTimer();
    renderQuestion();

    document.getElementById('next-btn').addEventListener('click', handleNext);
    document.getElementById('prev-btn').addEventListener('click', handlePrev);
    document.getElementById('mark-btn').addEventListener('click', handleMark);
});

function startTimer() {
    const timerDisplay = document.getElementById('timer-display');
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('انتهى الوقت المخصص للامتحان!');
            submitExam();
            return;
        }
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerDisplay.textContent = `◷ الوقت المتبقي: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        timerDisplay.classList.toggle('timer-low', timeLeft <= 60);
        saveActiveState();
    }, 1000);
}

function saveActiveState() {
    const state = {
        userAnswers,
        currentQuestionIndex,
        timeLeft
    };
    localStorage.setItem(`active_exam_${currentExam.id}`, JSON.stringify(state));
}

function renderQuestion() {
    const q = currentExam.questions[currentQuestionIndex];
    const container = document.getElementById('question-container');

    const progressPercent = ((currentQuestionIndex + 1) / currentExam.questions.length) * 100;
    document.getElementById('exam-progress-fill').style.width = progressPercent + '%';
    const progressLabel = document.getElementById('progress-label');
    if (progressLabel) progressLabel.textContent = `السؤال ${currentQuestionIndex + 1} من ${currentExam.questions.length}`;

    let optionsHtml = '';
    q.options.forEach((opt, idx) => {
        const isSelected = userAnswers[currentQuestionIndex] === idx;
        optionsHtml += `<button type="button" class="option-item ${isSelected ? 'selected' : ''}" aria-pressed="${isSelected}" onclick="selectOption(${idx})"><span class="option-letter">${String.fromCharCode(65 + idx)}</span><span>${opt}</span></button>`;
    });

    container.innerHTML = `
        <p class="question-count">السؤال ${currentQuestionIndex + 1}</p>
        <h3 class="question-text">${q.question}</h3>
        <div class="options-list" role="group" aria-label="خيارات الإجابة">${optionsHtml}</div>
    `;

    document.getElementById('prev-btn').style.display = currentQuestionIndex === 0 ? 'none' : 'inline-flex';
    const nextBtn = document.getElementById('next-btn');
    if (currentQuestionIndex === currentExam.questions.length - 1) {
        nextBtn.textContent = 'تسليم الامتحان ✓';
        nextBtn.classList.add('btn-success');
    } else {
        nextBtn.textContent = 'السؤال التالي ←';
        nextBtn.classList.remove('btn-success');
    }
    const markBtn = document.getElementById('mark-btn');
    if (markBtn) {
        markBtn.textContent = markedQuestions[currentQuestionIndex] ? '★ تمت المراجعة' : '☆ مراجعة لاحقًا';
        markBtn.classList.toggle('marked', Boolean(markedQuestions[currentQuestionIndex]));
    }
}
window.selectOption = function(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    saveActiveState();
    renderQuestion();
};

function handleNext() {
    if (currentQuestionIndex < currentExam.questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        if (confirm('هل أنت متأكد من رغبتك في تسليم الامتحان نهائياً؟')) {
            submitExam();
        }
    }
}

function handlePrev() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

function handleMark() {
    markedQuestions[currentQuestionIndex] = !markedQuestions[currentQuestionIndex];
    renderQuestion();
}

function submitExam() {
    clearInterval(timerInterval);
    localStorage.removeItem(`active_exam_${currentExam.id}`);

    let score = 0;
    currentExam.questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correct) {
            score++;
        }
    });

    const attemptData = {
        examId: currentExam.id,
        score: score,
        total: currentExam.questions.length,
        answers: userAnswers,
        date: new Date().toLocaleString()
    };

    let globalData = JSON.parse(localStorage.getItem('it_exams_data') || '{"attempts": [], "completed": {}}');
    globalData.attempts.push(attemptData);
    globalData.completed[currentExam.id] = true;
    localStorage.setItem('it_exams_data', JSON.stringify(globalData));

    window.location.href = `result.html?id=${currentExam.id}&score=${score}&total=${currentExam.questions.length}`;
}
