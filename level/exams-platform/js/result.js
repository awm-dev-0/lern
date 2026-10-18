document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('id');
    const exam = IT_EXAMS.find(e => e.id === examId);

    if (!exam) {
        window.location.href = 'index.html';
        return;
    }

    const data = JSON.parse(localStorage.getItem('it_exams_data') || '{"attempts": []}');
    const examAttempts = data.attempts.filter(a => a.examId === examId);
    const latestAttempt = examAttempts[examAttempts.length - 1];

    if (!latestAttempt) {
        window.location.href = 'index.html';
        return;
    }

    const score = latestAttempt.score;
    const total = latestAttempt.total;
    const percentage = Math.round((score / total) * 100);

    document.getElementById('final-score-display').textContent = `${score} / ${total} (${percentage}%)`;
    
    let message = "";
    if (percentage >= 85) message = "ممتاز! أداء استثنائي وفهم عميق للمفاهيم التقنية.";
    else if (percentage >= 70) message = "جيد جداً! لديك أساسيات قوية مع حاجة لمراجعة بعض التفاصيل.";
    else if (percentage >= 50) message = "مقبول، ولكن يلزمك إعادة دراسة الموضوعات وتحسين الأداء.";
    else message = "تحتاج إلى مراجعة شاملة للمفاهيم وإعادة المحاولة.";
    
    document.getElementById('performance-message').textContent = message;

    document.getElementById('retake-btn').addEventListener('click', () => {
        window.location.href = `exam.html?id=${examId}`;
    });

    const reviewContainer = document.getElementById('detailed-review-container');
    let reviewHtml = '';

    exam.questions.forEach((q, idx) => {
        const userAns = latestAttempt.answers[idx];
        const isCorrect = userAns === q.correct;
        const userAnsText = userAns !== undefined ? q.options[userAns] : 'لم تقم بالإجابة';
        const correctAnsText = q.options[q.correct];

        reviewHtml += `
            <div class="review-card">
                <p><strong>السؤال ${idx + 1}:</strong> ${q.question}</p>
                <p>إجابتك: <span class="${isCorrect ? 'correct' : 'incorrect'}">${userAnsText}</span></p>
                <p>الإجابة الصحيحة: <span class="correct">${correctAnsText}</span></p>
                <p class="explanation"><strong>التفسير التقني:</strong> ${q.explanation}</p>
            </div>
        `;
    });

    reviewContainer.innerHTML = reviewHtml;
});
