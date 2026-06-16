// js/components/quiz-renderer.js
// Функции рендеринга интерфейса для квиза.

import { escapeHtml } from '../utils.js';

export function renderIntroHtml(containerEl, formName, onBack, onStart) {
  containerEl.innerHTML = `
    <div class="fade-in space-y-4">
      <div class="flex items-center">
        <button id="quiz-back-btn" class="neo-btn neo-btn-secondary py-2 px-3 text-xs max-w-[100px]">
          <i data-lucide="chevron-left" class="w-3.5 h-3.5 mr-1"></i>
          <span>В меню</span>
        </button>
      </div>
      <div class="neo-card text-center bg-[#e0dbff]/30">
        <div class="w-16 h-16 rounded-full bg-[#e0dbff] border-2 border-black flex items-center justify-center text-[#6366f1] mx-auto mb-4 shadow-[2px_2px_0px_0px_#000]">
          <i data-lucide="sparkles" class="w-8 h-8"></i>
        </div>
        <h2 class="text-xl font-black mb-2 text-slate-900 uppercase">${escapeHtml(formName)}</h2>
        <p class="text-xs text-slate-600 leading-relaxed mb-6 font-semibold">
          Ответьте на 2 простых вопроса, чтобы определить оптимальные пути развития вашего канала и получить доступ к материалам.
        </p>
        <button id="start-btn" class="neo-btn">
          <span>Начать квиз</span>
          <i data-lucide="play" class="w-4 h-4 ml-2"></i>
        </button>
      </div>
    </div>
  `; // safe: template contains only pre-escaped values and static HTML

  containerEl.querySelector('#quiz-back-btn').addEventListener('click', onBack);
  containerEl.querySelector('#start-btn').addEventListener('click', onStart);
}

export function renderQuestionHtml(containerEl, step, totalSteps, questionText, options, onAnswer) {
  const progress = Math.round((step / totalSteps) * 100);
  const optionsHtml = options.map((opt, idx) => `
    <button data-index="${idx}" class="option-btn neo-btn neo-btn-secondary text-left font-semibold text-sm hover:bg-[#f3f0ff]/50 transition-colors">
      ${escapeHtml(opt)}
    </button>
  `).join('');

  containerEl.innerHTML = `
    <div class="fade-in space-y-5">
      <div class="flex justify-between items-center text-xs text-slate-800 font-bold uppercase tracking-wider">
        <span>Вопрос ${step} из ${totalSteps}</span>
        <span>${progress}%</span>
      </div>
      <div class="w-full h-4 bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_0px_#000]">
        <div class="h-full bg-[var(--color-accent)] border-r-2 border-black transition-all duration-300" style="width: ${progress}%"></div>
      </div>
      <div class="neo-card">
        <h3 class="text-base font-black mb-5 text-slate-900 leading-snug">${escapeHtml(questionText)}</h3>
        <div class="flex flex-col gap-3">${optionsHtml}</div>
      </div>
    </div>
  `; // safe: template contains only pre-escaped values and static HTML

  containerEl.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      onAnswer(parseInt(btn.dataset.index, 10));
    });
  });
}

export function renderStatusCardHtml(containerEl) {
  containerEl.innerHTML = `
    <div class="fade-in space-y-6 text-center py-12">
      <div id="quiz-status-card" class="neo-card flex flex-col items-center justify-center min-h-[220px]">
        <div id="quiz-status-icon" class="w-16 h-16 rounded-full bg-white border-2 border-black flex items-center justify-center text-black mb-4 shadow-[2px_2px_0px_0px_#000]">
          <div class="loader-spinner"></div>
        </div>
        <h3 id="quiz-status-title" class="text-lg font-black mb-2 text-slate-900 uppercase">Отправка результатов</h3>
        <p id="quiz-status-desc" class="text-xs text-slate-600 leading-relaxed font-semibold max-w-xs">
          Пожалуйста, подождите. Мы сохраняем ваши ответы на сервере...
        </p>
        <div id="quiz-error-box" class="hidden mt-4 p-3 bg-rose-500/10 border-2 border-black text-rose-700 rounded-xl text-xs font-semibold shadow-[2px_2px_0px_0px_#000] w-full text-left"></div>
        <button id="quiz-retry-btn" class="hidden neo-btn mt-6 max-w-[200px]">
          <span>Повторить отправку</span>
          <i data-lucide="rotate-ccw" class="w-4 h-4 ml-2"></i>
        </button>
      </div>
    </div>
  `; // safe: template contains static HTML loader skeleton
}
