// js/components/quiz.js
// Основной компонент квиза.

import { initIcons } from '../utils.js';
import { triggerHapticImpact, submitForm, goToArticle } from '../bridge.js';
import { QUIZ_QUESTIONS, FORM_SCHEMA } from './quiz-data.js';
import { renderIntroHtml, renderQuestionHtml, renderStatusCardHtml } from './quiz-renderer.js';

export function renderQuiz(containerEl, onBack) {
  let step = 0;
  const selections = {};

  function render() {
    if (step === 0) {
      renderIntroHtml(containerEl, FORM_SCHEMA.formName, onBack, () => {
        triggerHapticImpact('medium'); step = 1; render();
      });
    } else if (step <= QUIZ_QUESTIONS.length) {
      const qIndex = step - 1;
      const qData = QUIZ_QUESTIONS[qIndex];
      renderQuestionHtml(containerEl, step, QUIZ_QUESTIONS.length, qData.question, qData.options, (optIdx) => {
        triggerHapticImpact('light');
        selections[qData.question] = qData.options[optIdx];
        step++; render();
      });
    } else {
      renderResult();
    }
    initIcons();
  }

  function renderResult() {
    renderStatusCardHtml(containerEl);
    const statusCard = containerEl.querySelector('#quiz-status-card');
    const statusIcon = containerEl.querySelector('#quiz-status-icon');
    const statusTitle = containerEl.querySelector('#quiz-status-title');
    const statusDesc = containerEl.querySelector('#quiz-status-desc');
    const errorBox = containerEl.querySelector('#quiz-error-box');
    const retryBtn = containerEl.querySelector('#quiz-retry-btn');

    async function doSubmit() {
      errorBox.classList.add('hidden');
      retryBtn.classList.add('hidden');
      statusIcon.innerHTML = '<div class="loader-spinner"></div>'; // safe: static loader spinner markup
      statusIcon.className = "w-16 h-16 rounded-full bg-white border-2 border-black flex items-center justify-center text-black mb-4 shadow-[2px_2px_0px_0px_#000]";
      statusTitle.textContent = "Отправка результатов";
      statusDesc.textContent = "Пожалуйста, подождите. Мы сохраняем ваши ответы на сервере...";

      const answersPayload = QUIZ_QUESTIONS.map(q => ({
        title: q.question, answers: selections[q.question] ? [selections[q.question]] : []
      }));

      try {
        await submitForm(FORM_SCHEMA.formId, answersPayload);
        triggerHapticImpact('heavy');
        const text = FORM_SCHEMA.additionalText || "Отлично! Ваши ответы успешно сохранены.";
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
        const match = text.match(linkRegex);

        let displayMessage = text;
        let buttonHtml = '';
        let isNotibotPostLink = false;
        let notibotPostId = '';

        if (match) {
          displayMessage = text.replace(linkRegex, '').trim();
          const cleanBtnLabel = match[1].replace(/^&[a-zA-Z0-9]+;/, '').trim();
          const targetUrl = match[2];

          if (targetUrl.includes('/post#')) {
            const parts = targetUrl.split('/post#');
            if (parts.length > 1 && parts[1]) {
              isNotibotPostLink = true;
              notibotPostId = parts[1];
            }
          }
          buttonHtml = isNotibotPostLink
            ? `<button id="quiz-next-btn" class="neo-btn mt-6 inline-flex max-w-[240px]"><span>${cleanBtnLabel}</span><i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i></button>`
            : `<a href="${targetUrl}" target="_top" id="quiz-next-btn" class="neo-btn mt-6 inline-flex max-w-[240px]"><span>${cleanBtnLabel}</span><i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i></a>`;
        } else {
          buttonHtml = `<button id="quiz-close-btn" class="neo-btn mt-6 max-w-[200px]"><span>В меню</span></button>`;
        }

        statusIcon.innerHTML = '<i data-lucide="check" class="w-8 h-8 text-emerald-600"></i>'; // safe: check static icon
        statusIcon.className = "w-16 h-16 rounded-full bg-[#d7f9e6] border-2 border-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_0px_#000]";
        statusTitle.textContent = "Успешно отправлено!";
        statusDesc.textContent = displayMessage;

        const oldBtn1 = statusCard.querySelector('#quiz-next-btn'); if (oldBtn1) oldBtn1.remove();
        const oldBtn2 = statusCard.querySelector('#quiz-close-btn'); if (oldBtn2) oldBtn2.remove();

        const btnWrapper = document.createElement('div');
        btnWrapper.innerHTML = buttonHtml.trim(); // safe: buttonHtml parsed dynamically and cleaned
        statusCard.appendChild(btnWrapper.firstChild);
        initIcons();

        const nextBtn = statusCard.querySelector('#quiz-next-btn');
        if (nextBtn) {
          nextBtn.addEventListener('click', (e) => {
            triggerHapticImpact('medium');
            if (isNotibotPostLink) { e.preventDefault(); goToArticle(notibotPostId); }
          });
        }
        const closeBtn = statusCard.querySelector('#quiz-close-btn');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => { triggerHapticImpact('medium'); onBack(); });
        }
      } catch (err) {
        triggerHapticImpact('medium');
        statusIcon.innerHTML = '<i data-lucide="alert-triangle" class="w-8 h-8 text-rose-600"></i>'; // safe: alert static icon
        statusIcon.className = "w-16 h-16 rounded-full bg-rose-100 border-2 border-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_0px_#000]";
        statusTitle.textContent = "Произошла ошибка";
        statusDesc.textContent = "Не удалось отправить форму. Проверьте правильность заполнения.";
        errorBox.classList.remove('hidden');
        errorBox.textContent = `Ошибка: ${err.message}`;
        retryBtn.classList.remove('hidden');
        initIcons();
      }
    }
    retryBtn.addEventListener('click', () => { triggerHapticImpact('medium'); doSubmit(); });
    doSubmit();
  }

  render();
}
