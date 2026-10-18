function initTheme() {
    const savedTheme = localStorage.getItem('it_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeButtonText(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const current = document.body.getAttribute('data-theme');
            const next = current === 'light' ? 'dark' : 'light';
            document.body.setAttribute('data-theme', next);
            localStorage.setItem('it_theme', next);
            updateThemeButtonText(next);
        });
    }
}

function updateThemeButtonText(theme) {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
        toggleBtn.textContent = theme === 'light' ? '🌙 الوضع الداكن' : '☀️ الوضع الفاتح';
    }
}

function initDashboard() {
    const container = document.getElementById('exams-container');
    if (!container) return;

    const data = JSON.parse(localStorage.getItem('it_exams_data') || '{"attempts": [], "completed": {}}');
    const attempts = data.attempts || [];
    const completedExamsMap = data.completed || {};

    let totalExams = IT_EXAMS.length;
    let completedCount = Object.keys(completedExamsMap).length;
    let pendingCount = totalExams - completedCount;

    let totalScorePercent = 0;
    if (attempts.length > 0) {
        const sum = attempts.reduce((acc, curr) => acc + (curr.score / curr.total), 0);
        totalScorePercent = Math.round((sum / attempts.length) * 100);
    }

    document.getElementById('total-exams').textContent = totalExams;
    document.getElementById('completed-exams').textContent = completedCount;
    document.getElementById('pending-exams').textContent = pendingCount;
    document.getElementById('avg-score').textContent = totalScorePercent + '%';

    let userLevel = "مبتدئ (Beginner)";
    if (totalScorePercent >= 80 && completedCount >= 2) {
        userLevel = "متقدم (Advanced)";
    } else if (totalScorePercent >= 50) {
        userLevel = "متوسط (Intermediate)";
    }
    const levelBadge = document.getElementById('user-level-badge');
    if (levelBadge) levelBadge.textContent = userLevel;

    container.innerHTML = '';
    IT_EXAMS.forEach(exam => {
        const isCompleted = completedExamsMap[exam.id];
        let diffText = exam.difficulty;
        if (diffText === 'Easy') diffText = 'سهل';
        else if (diffText === 'Medium') diffText = 'متوسط';
        else if (diffText === 'Hard') diffText = 'متقدم';

        const card = document.createElement('div');
        card.className = 'exam-card';
        card.innerHTML = `
            <div>
                <div class="exam-card-top">
                    <span class="exam-card-icon">▤</span>
                    <div><h4>${exam.title}</h4><span class="badge ${exam.difficulty.toLowerCase()}">${diffText}</span></div>
                </div>
                <p>${exam.description}</p>
                <div class="exam-meta">
                    <div class="exam-meta-info"><span>◉ ${exam.questions.length} سؤال</span><span>◷ ${exam.durationMinutes} دقيقة</span></div>
                    <span class="badge ${isCompleted ? 'completed' : 'pending'}">${isCompleted ? 'مكتمل' : 'لم يبدأ'}</span>
                </div>
            </div>
            <div class="exam-card-actions">
                <a href="exam.html?id=${encodeURIComponent(exam.id)}" class="btn">${isCompleted ? 'إعادة الامتحان ←' : 'ابدأ الامتحان ←'}</a>
                ${isCompleted ? `<a href="result.html?id=${encodeURIComponent(exam.id)}" class="btn btn-secondary">النتيجة السابقة</a>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initDashboard();
});
