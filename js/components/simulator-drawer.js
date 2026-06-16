// js/components/simulator-drawer.js
// Выдвижная шторка для сбора контактов и отправки результатов симулятора.

import { initIcons, escapeHtml } from '../utils.js';
import { triggerHapticImpact, triggerHapticSelection, submitForm } from '../bridge.js';

let activeDrawer = null;

/**
 * Инициализирует и возвращает контроллер шторки с формой для симулятора.
 * @param {Object} formSchema - Схема формы из Notibot
 * @param {string} balanceSummary - Текстовая сводка распределения ресурсов
 * @param {Function} onComplete - Коллбэк после успешной отправки
 */
export function initSimulatorDrawer(formSchema, balanceSummary, onComplete) {
  const existing = document.getElementById('drawer-container');
  if (existing) existing.remove();

  const html = `
    <div id="drawer-container" class="fixed inset-0 z-50 invisible transition-all duration-300">
      <div id="drawer-backdrop" class="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 transition-opacity duration-300"></div>
      <div id="drawer-panel" class="absolute bottom-0 left-0 right-0 max-w-xl mx-auto bg-[var(--color-bg)] rounded-t-[2.5rem] border-t-4 border-l-2 border-r-2 border-black p-6 shadow-[-4px_-4px_0px_0px_#000] translate-y-full transition-transform duration-300 flex flex-col max-h-[90vh]">
        <div class="w-12 h-1 bg-black rounded-full mx-auto mb-4 cursor-pointer"></div>
        <button id="drawer-close" class="absolute top-5 right-5 p-2 rounded-full border-2 border-black bg-white hover:bg-slate-100 text-black shadow-[2px_2px_0px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] transition-all">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="overflow-y-auto pr-1 flex-1">
          <h3 class="text-xl font-black mb-1 text-slate-900 uppercase tracking-tight">${escapeHtml(formSchema.formName)}</h3>
          <p class="text-xs text-slate-700 mb-5 font-semibold">Укажите ваши данные, чтобы получить чек-лист «Как найти 30 минут для себя, не вызывая чувства вины».</p>
          <form id="simulator-lead-form" class="space-y-4">
            <div>
              <label class="block text-xs font-black uppercase text-slate-800 mb-1.5">Как вас зовут? *</label>
              <input type="text" id="form-name" required placeholder="Введите ваше имя" class="w-full px-4 py-3 rounded-xl border-2 border-black bg-white text-sm font-semibold focus:outline-none shadow-[2px_2px_0px_0px_#000] transition-all text-slate-900" />
            </div>
            <div>
              <label class="block text-xs font-black uppercase text-slate-800 mb-1.5">Ваш Email *</label>
              <input type="email" id="form-email" required placeholder="example@mail.com" class="w-full px-4 py-3 rounded-xl border-2 border-black bg-white text-sm font-semibold focus:outline-none shadow-[2px_2px_0px_0px_#000] transition-all text-slate-900" />
            </div>
            <input type="hidden" id="form-balance" value="${escapeHtml(balanceSummary)}" />
            <div class="pt-4 border-t-2 border-black">
              <button type="submit" id="drawer-submit-btn" class="neo-btn">
                <span>Получить чек-лист</span>
                <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = html.trim(); // safe: template contains only pre-escaped values and static HTML
  activeDrawer = container.firstChild;
  document.body.appendChild(activeDrawer);

  const backdrop = activeDrawer.querySelector('#drawer-backdrop');
  const closeBtn = activeDrawer.querySelector('#drawer-close');
  const form = activeDrawer.querySelector('#simulator-lead-form');
  const submitBtn = activeDrawer.querySelector('#drawer-submit-btn');

  const openDrawer = () => {
    activeDrawer.classList.add('drawer-visible');
    document.body.style.overflow = 'hidden';
    triggerHapticImpact('medium');
  };

  const closeDrawer = () => {
    activeDrawer.classList.remove('drawer-visible');
    document.body.style.overflow = '';
    triggerHapticSelection();
  };

  backdrop.addEventListener('click', closeDrawer);
  closeBtn.addEventListener('click', closeDrawer);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    triggerHapticImpact('light');
    const existingError = activeDrawer.querySelector('#form-error-msg');
    if (existingError) existingError.remove();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const balance = document.getElementById('form-balance').value;
    if (!name || !email) return;

    submitBtn.disabled = true;
    const btnSpan = submitBtn.querySelector('span');
    btnSpan.textContent = 'Отправка...';

    const answers = [
      { title: "Как вас зовут?", answers: [name] },
      { title: "Ваш Email", answers: [email] },
      { title: "Распределение ресурсов", answers: [balance] }
    ];

    try {
      await submitForm(formSchema.formId, answers);
      triggerHapticImpact('heavy');
      const panel = activeDrawer.querySelector('#drawer-panel');
      panel.innerHTML = `
        <div class="w-12 h-1 bg-black rounded-full mx-auto mb-6"></div>
        <div class="flex flex-col items-center justify-center text-center py-8">
          <div class="w-16 h-16 bg-[#d7f9e6] border-2 border-black rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-[3px_3px_0px_0px_#000]"><i data-lucide="check" class="w-8 h-8"></i></div>
          <h3 class="text-xl font-black mb-2 text-slate-900 uppercase">Готово!</h3>
          <p class="text-xs text-slate-600 max-w-sm mb-6 font-semibold">Чек-лист успешно отправлен на ваш Email: <b>${escapeHtml(email)}</b>. Проверьте ваш почтовый ящик.</p>
          <button id="success-close-btn" class="neo-btn max-w-[200px]">Отлично</button>
        </div>
      `;
      initIcons();
      panel.querySelector('#success-close-btn').addEventListener('click', () => {
        closeDrawer();
        if (onComplete) onComplete();
      });
    } catch (err) {
      submitBtn.disabled = false;
      btnSpan.textContent = 'Получить чек-лист';
      let errorEl = activeDrawer.querySelector('#form-error-msg');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'form-error-msg';
        errorEl.className = 'mt-3 p-3 bg-rose-500/10 border-2 border-black text-rose-700 rounded-xl text-xs font-semibold shadow-[2px_2px_0px_0px_#000]';
        const submitContainer = activeDrawer.querySelector('.pt-4');
        submitContainer.parentNode.insertBefore(errorEl, submitContainer);
      }
      errorEl.textContent = `Ошибка при отправке: ${err.message}`;
    }
  });

  initIcons();
  return { open: openDrawer, close: closeDrawer };
}
