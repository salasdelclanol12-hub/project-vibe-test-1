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
          <button id="quiz-back-btn" class="neo-btn neo-btn-secondary py-2 px-3 text-xs max-w-[100px]">
            <i data-lucide="chevron-left" class="w-3.5 h-3.5 mr-1"></i>
            <span>В меню</span>
          </button>
        </div>
        <div class="neo-card text-center">
          <div class="w-16 h-16 rounded-full bg-[#e0dbff] border-2 border-black flex items-center justify-center text-[#6366f1] mx-auto mb-4 shadow-[2px_2px_0px_0px_#000]">
            <i data-lucide="smile" class="w-8 h-8"></i>
          </div>
          <h2 class="text-xl font-black mb-2 text-slate-900 uppercase">Уровень выгорания</h2>
          <p class="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
            Быстрый тест из 5 вопросов разработан профессиональным психологом, чтобы оценить ваше текущее состояние.
          </p>
          <button id="start-btn" class="neo-btn">
            <span>Начать тест</span>
            <i data-lucide="play" class="w-4 h-4 ml-2"></i>
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
      <button data-score="${opt.score}" class="option-btn neo-btn neo-btn-secondary text-left font-semibold text-sm">
        ${opt.text}
      </button>
    `).join('');

    containerEl.innerHTML = `
      <div class="fade-in space-y-5">
        <div class="flex justify-between items-center text-xs text-slate-800 font-bold uppercase tracking-wider">
          <span>Вопрос ${step} из ${QUIZ_QUESTIONS.length}</span>
          <span>${progress}%</span>
        </div>
        <div class="w-full h-4 bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_0px_#000]">
          <div class="h-full bg-[var(--color-accent)] border-r-2 border-black transition-all duration-300" style="width: ${progress}%"></div>
        </div>
        <div class="neo-card">
          <h3 class="text-base font-black mb-5 text-slate-900 leading-snug">${qData.question}</h3>
          <div class="flex flex-col gap-3">${optionsHtml}</div>
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
        <div class="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 text-[#6366f1] shadow-[2px_2px_0px_0px_#000]">
          <i data-lucide="${b.icon}" class="w-5 h-5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-black text-slate-900 mb-0.5">${b.title}</h4>
          <p class="text-xs text-slate-600 leading-relaxed font-medium">${b.desc}</p>
        </div>
      </div>
      ${idx < BENEFITS.length - 1 ? '<div class="h-px bg-black my-4 border-dashed"></div>' : ''}
    `).join('');

    containerEl.innerHTML = `
      <div class="fade-in space-y-6">
        <div class="flex items-center">
          <button id="quiz-result-back-btn" class="neo-btn neo-btn-secondary py-2 px-3 text-xs max-w-[100px]">
            <i data-lucide="chevron-left" class="w-3.5 h-3.5 mr-1"></i>
            <span>В меню</span>
          </button>
        </div>
        <div class="neo-card text-center bg-[#e0dbff]">
          <div class="inline-flex px-3 py-1 rounded-full text-xs font-black bg-white border-2 border-black mb-3 shadow-[1px_1px_0px_0px_#000]">РЕЗУЛЬТАТ: ${totalScore} БАЛЛОВ</div>
          <h3 class="text-lg font-black mb-2 text-slate-900 uppercase">${result.title}</h3>
          <p class="text-xs text-slate-700 leading-relaxed font-medium">${result.description}</p>
        </div>
        <div class="neo-card space-y-4">
          <h4 class="text-xs font-black uppercase tracking-wider text-slate-900">Что вы получите на консультации:</h4>
          <div class="space-y-1">${benefitsHtml}</div>
        </div>
        <button id="cta-btn" class="neo-btn">
          <span>Разбор результатов с психологом</span>
          <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
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
