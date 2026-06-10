// js/components/quiz.js
// Основной компонент квиза.

import { initIcons } from '../utils.js';
import { triggerHapticImpact } from '../bridge.js';
import { QUIZ_QUESTIONS, getResultByScore, FORM_SCHEMA, BENEFITS } from './quiz-data.js';
import { initQuizDrawer } from './quiz-drawer.js';

export function renderQuiz(containerEl, onBack) {
  let step = 0; // 0 - старт, 1..5 - вопросы, 6 - результаты
  let totalScore = 0;

  function render() {
    if (step === 0) {
      renderIntro();
    } else if (step <= QUIZ_QUESTIONS.length) {
      renderQuestion();
    } else {
      renderResult();
    }
    initIcons();
  }

  function renderIntro() {
    containerEl.innerHTML = `
      <div class="fade-in space-y-4">
        <div class="flex items-center">
          <button id="quiz-back-btn" class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] btn-press">
            <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
            <span>В меню</span>
          </button>
        </div>
        <div class="card p-6 flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-accent)] mb-4">
            <i data-lucide="smile" class="w-8 h-8"></i>
          </div>
          <h2 class="text-xl font-bold mb-2 text-[var(--color-text)]">Узнайте ваш уровень выгорания</h2>
          <p class="text-xs text-[var(--color-muted)] leading-relaxed mb-6">
            Быстрый тест из 5 вопросов разработан профессиональным психологом, чтобы оценить ваше текущее состояние.
          </p>
          <button id="start-btn" class="btn-primary flex items-center justify-center gap-2">
            <span>Начать тест</span>
            <i data-lucide="play" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
    containerEl.querySelector('#quiz-back-btn').addEventListener('click', onBack);
    containerEl.querySelector('#start-btn').addEventListener('click', () => {
      triggerHapticImpact('medium');
      step = 1;
      render();
    });
  }

  function renderQuestion() {
    const qIndex = step - 1;
    const qData = QUIZ_QUESTIONS[qIndex];
    const progress = Math.round((step / QUIZ_QUESTIONS.length) * 100);

    const optionsHtml = qData.options.map(opt => `
      <button data-score="${opt.score}" class="option-btn w-full p-4 text-left rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm hover:border-[var(--color-accent)] transition-colors text-[var(--color-text)] btn-press">
        ${opt.text}
      </button>
    `).join('');

    containerEl.innerHTML = `
      <div class="fade-in space-y-5">
        <div class="flex justify-between items-center text-xs text-[var(--color-muted)] font-medium">
          <span>Вопрос ${step} из ${QUIZ_QUESTIONS.length}</span>
          <span>${progress}%</span>
        </div>
        <div class="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
          <div class="h-full bg-[var(--color-accent)] transition-all duration-300" style="width: ${progress}%"></div>
        </div>
        <div class="card p-6">
          <h3 class="text-base font-semibold mb-5 text-[var(--color-text)] leading-snug">${qData.question}</h3>
          <div class="space-y-2.5">${optionsHtml}</div>
        </div>
      </div>
    `;

    containerEl.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHapticImpact('light');
        totalScore += parseInt(btn.dataset.score, 10);
        step++;
        render();
      });
    });
  }

  function renderResult() {
    const result = getResultByScore(totalScore);
    const benefitsHtml = BENEFITS.map((b, idx) => `
      <div class="flex items-start gap-3.5">
        <div class="w-8 h-8 rounded-lg bg-[var(--color-surface)] flex items-center justify-center shrink-0 text-[var(--color-accent)]">
          <i data-lucide="${b.icon}" class="w-4.5 h-4.5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-[var(--color-text)] mb-0.5">${b.title}</h4>
          <p class="text-xs text-[var(--color-muted)] leading-relaxed">${b.desc}</p>
        </div>
      </div>
      ${idx < BENEFITS.length - 1 ? '<div class="h-px bg-[var(--color-border)] my-4 border-dashed"></div>' : ''}
    `).join('');

    containerEl.innerHTML = `
      <div class="fade-in space-y-6">
        <div class="flex items-center">
          <button id="quiz-result-back-btn" class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] btn-press">
            <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
            <span>В меню</span>
          </button>
        </div>
        <div class="card p-6 flex flex-col items-center text-center">
          <div class="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-accent)]/10 text-[var(--color-accent)] mb-3">Ваш результат: ${totalScore} баллов</div>
          <h3 class="text-lg font-bold mb-2 text-[var(--color-text)]">${result.title}</h3>
          <p class="text-xs text-[var(--color-muted)] leading-relaxed">${result.description}</p>
        </div>
        <div class="card p-5 space-y-1 bg-[var(--color-surface)] border-[var(--color-border)]">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] mb-3.5">Что вы получите на консультации:</h4>
          ${benefitsHtml}
        </div>
        <button id="cta-btn" class="btn-primary py-4 flex items-center justify-center gap-2">
          <span>Бесплатный разбор у психолога</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
    `;

    containerEl.querySelector('#quiz-result-back-btn').addEventListener('click', onBack);

    const drawer = initQuizDrawer(FORM_SCHEMA, () => {
      step = 0;
      totalScore = 0;
      render();
    });

    containerEl.querySelector('#cta-btn').addEventListener('click', () => {
      drawer.open();
    });
  }

  render();
}
