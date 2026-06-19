// js/components/quiz-render-steps.js
import { triggerHapticImpact } from '../bridge.js';
import { FORM_SCHEMA } from './quiz-data.js';

export function renderIntro(ctx) {
  ctx.containerEl.innerHTML = `
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
        <h2 class="text-xl font-black mb-2 text-slate-900 uppercase">${FORM_SCHEMA.formName}</h2>
        <p class="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
          Пожалуйста, ответьте на несколько вопросов, чтобы заполнить форму.
        </p>
        <button id="start-btn" class="neo-btn">
          <span>Начать</span>
          <i data-lucide="play" class="w-4 h-4 ml-2"></i>
        </button>
      </div>
    </div>
  `;
  ctx.containerEl.querySelector('#quiz-back-btn').addEventListener('click', ctx.onBack);
  ctx.containerEl.querySelector('#start-btn').addEventListener('click', () => {
    triggerHapticImpact('medium');
    ctx.setStep(1);
    ctx.render();
  });
}

export function renderQuestion(ctx) {
  const step = ctx.getStep();
  const qIndex = step - 1;
  const qData = ctx.getQuestion(qIndex);
  const progress = Math.round((step / ctx.totalQuestions) * 100);
  const answers = ctx.getAnswers();

  if (qData.type === 'text' || qData.type === 'phone') {
    const placeholder = qData.type === 'text' ? 'Введите ваше имя' : '+7...';
    const inputId = qData.type === 'text' ? 'quiz-input-text' : 'quiz-input-phone';
    const inputType = qData.type === 'text' ? 'text' : 'tel';
    const previousValue = answers[qData.title] || '';

    ctx.containerEl.innerHTML = `
      <div class="fade-in space-y-5">
        <div class="flex justify-between items-center text-xs text-slate-800 font-bold uppercase tracking-wider">
          <span>Вопрос ${step} из ${ctx.totalQuestions}</span>
          <span>${progress}%</span>
        </div>
        <div class="w-full h-4 bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_0px_#000]">
          <div class="h-full bg-[var(--color-accent)] border-r-2 border-black transition-all duration-300" style="width: ${progress}%"></div>
        </div>
        <div class="neo-card">
          <h3 class="text-base font-black mb-5 text-slate-900 leading-snug">${qData.title}${qData.required ? ' *' : ''}</h3>
          <div class="flex flex-col">
            <input type="${inputType}" id="${inputId}" placeholder="${placeholder}" value="${previousValue}" class="w-full px-4 py-3 rounded-xl border-2 border-black bg-white text-sm font-semibold focus:outline-none shadow-[2px_2px_0px_0px_#000] text-slate-900 animate-none" />
            <button id="next-btn" class="neo-btn mt-6">
              <span>Далее</span>
              <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    const inputEl = ctx.containerEl.querySelector(`#${inputId}`);
    const nextBtn = ctx.containerEl.querySelector('#next-btn');

    const checkValidity = () => {
      const val = inputEl.value.trim();
      if (qData.required && !val) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
      } else {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
      }
    };

    inputEl.addEventListener('input', checkValidity);
    checkValidity();

    nextBtn.addEventListener('click', () => {
      triggerHapticImpact('light');
      answers[qData.title] = inputEl.value.trim();
      ctx.setStep(step + 1);
      ctx.render();
    });

  } else if (qData.type === 'one of list') {
    const optionsHtml = qData.options.map(opt => `
      <button data-option="${opt}" class="option-btn neo-btn neo-btn-secondary text-left font-semibold text-sm mb-3">
        ${opt}
      </button>
    `).join('');

    ctx.containerEl.innerHTML = `
      <div class="fade-in space-y-5">
        <div class="flex justify-between items-center text-xs text-slate-800 font-bold uppercase tracking-wider">
          <span>Вопрос ${step} из ${ctx.totalQuestions}</span>
          <span>${progress}%</span>
        </div>
        <div class="w-full h-4 bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_0px_#000]">
          <div class="h-full bg-[var(--color-accent)] border-r-2 border-black transition-all duration-300" style="width: ${progress}%"></div>
        </div>
        <div class="neo-card">
          <h3 class="text-base font-black mb-5 text-slate-900 leading-snug">${qData.title}</h3>
          <div class="flex flex-col gap-1">${optionsHtml}</div>
        </div>
      </div>
    `;

    ctx.containerEl.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHapticImpact('light');
        answers[qData.title] = btn.dataset.option;
        ctx.setStep(step + 1);
        ctx.render();
      });
    });
  }
}
