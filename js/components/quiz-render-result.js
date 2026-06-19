import { triggerHapticImpact, submitForm } from '../bridge.js';
import { FORM_SCHEMA } from './quiz-data.js';
import { initIcons, parseMarkdown } from '../utils.js';

export function renderResult(ctx) {
  const answers = ctx.getAnswers();
  const formattedAnswers = [
    { title: "имя", answers: [answers["имя"] || "Не указано"] },
    { title: "Телефон", answers: [answers["Телефон"] || ""] },
    { title: "Ваш доход", answers: [answers["Ваш доход"] || ""] }
  ];

  ctx.containerEl.innerHTML = `
    <div class="fade-in space-y-6">
      <div class="flex items-center">
        <button id="quiz-result-back-btn" class="neo-btn neo-btn-secondary py-2 px-3 text-xs max-w-[100px]">
          <i data-lucide="chevron-left" class="w-3.5 h-3.5 mr-1"></i>
          <span>В меню</span>
        </button>
      </div>
      
      <div class="neo-card space-y-4">
        <h3 class="text-xs font-black uppercase tracking-wider text-slate-900">Проверьте ваши ответы:</h3>
        <div class="space-y-2 text-sm font-semibold text-slate-800">
          <div class="flex justify-between border-b pb-2 border-slate-100">
            <span>Имя:</span>
            <span class="text-slate-950 font-bold">${answers["имя"] || "Не указано"}</span>
          </div>
          <div class="flex justify-between border-b pb-2 border-slate-100">
            <span>Телефон:</span>
            <span class="text-slate-950 font-bold">${answers["Телефон"] || "Не указано"}</span>
          </div>
          <div class="flex justify-between pb-1">
            <span>Ваш доход:</span>
            <span class="text-slate-950 font-bold">${answers["Ваш доход"] || "Не указано"}</span>
          </div>
        </div>
      </div>

      <div id="error-message" class="hidden text-rose-600 bg-rose-50 border-2 border-rose-600 rounded-xl p-3.5 text-xs font-bold leading-relaxed shadow-[2px_2px_0px_0px_#e11d48]"></div>

      <button id="submit-btn" class="neo-btn">
        <span>Отправить ответы</span>
        <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
      </button>
    </div>
  `;

  ctx.containerEl.querySelector('#quiz-result-back-btn').addEventListener('click', ctx.onBack);

  const submitBtn = ctx.containerEl.querySelector('#submit-btn');
  const errorEl = ctx.containerEl.querySelector('#error-message');

  submitBtn.addEventListener('click', async () => {
    triggerHapticImpact('light');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    const btnSpan = submitBtn.querySelector('span');
    btnSpan.textContent = 'Отправка...';
    errorEl.classList.add('hidden');
    errorEl.textContent = '';

    try {
      await submitForm(FORM_SCHEMA.formId, formattedAnswers);
      triggerHapticImpact('heavy');
      renderSuccess(ctx);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      btnSpan.textContent = 'Отправить ответы';

      console.error("Form submit error details:", err);

      if (err instanceof window.NotibotBridgeError || err.name === 'NotibotBridgeError') {
        errorEl.textContent = `Ошибка NotibotBridgeError [${err.code || 'UNKNOWN'}]: ${err.message || 'Ошибка отправки формы'}`;
      } else {
        errorEl.textContent = `Ошибка: ${err.message || err}`;
      }
      errorEl.classList.remove('hidden');
      triggerHapticImpact('medium');
    }
  });
}

function renderSuccess(ctx) {
  ctx.containerEl.innerHTML = `
    <div class="fade-in space-y-6 text-center py-6">
      <div class="w-16 h-16 bg-[#d7f9e6] border-2 border-black rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-[3px_3px_0px_0px_#000] mx-auto">
        <i data-lucide="check" class="w-8 h-8"></i>
      </div>
      <h3 class="text-2xl font-black mb-2 text-slate-900 uppercase">Успешно отправлено!</h3>
      <p class="text-sm text-slate-600 max-w-sm mb-6 font-semibold mx-auto">
        ${FORM_SCHEMA.additionalText ? parseMarkdown(FORM_SCHEMA.additionalText) : 'Форма успешно отправлена.'}
      </p>
      <button id="success-back-btn" class="neo-btn max-w-[200px] mx-auto">Отлично</button>
    </div>
  `;

  ctx.containerEl.querySelector('#success-back-btn').addEventListener('click', ctx.onBack);
  initIcons();
}
