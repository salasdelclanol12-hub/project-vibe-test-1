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
      <!-- Бэкдроп -->
      <div id="drawer-backdrop" class="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 transition-opacity duration-300"></div>
      
      <!-- Панель шторки -->
      <div id="drawer-panel" class="absolute bottom-0 left-0 right-0 max-w-xl mx-auto bg-[var(--color-bg)] rounded-t-3xl border-t border-[var(--color-border)] p-6 shadow-2xl translate-y-full transition-transform duration-300 flex flex-col max-h-[90vh]">
        
        <!-- Ручка перетаскивания -->
        <div class="w-12 h-1 bg-[var(--color-border)] rounded-full mx-auto mb-4 cursor-pointer"></div>
        
        <!-- Кнопка закрытия -->
        <button id="drawer-close" class="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-surface)] text-[var(--color-muted)] transition-colors">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <!-- Контент -->
        <div class="overflow-y-auto pr-1 flex-1">
          <h3 class="text-xl font-bold mb-1 text-[var(--color-text)]">${escapeHtml(formSchema.formName)}</h3>
          <p class="text-xs text-[var(--color-muted)] mb-5">
            Укажите ваши данные, чтобы получить чек-лист «Как найти 30 минут для себя, не вызывая чувства вины».
          </p>
          
          <form id="simulator-lead-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-[var(--color-text)] mb-1.5">Как вас зовут? *</label>
              <input type="text" id="form-name" required placeholder="Введите ваше имя" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors text-[var(--color-text)]" />
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-[var(--color-text)] mb-1.5">Ваш Email *</label>
              <input type="email" id="form-email" required placeholder="example@mail.com" class="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors text-[var(--color-text)]" />
            </div>

            <!-- Скрытое поле с результатами баланса -->
            <input type="hidden" id="form-balance" value="${escapeHtml(balanceSummary)}" />
            
            <div class="pt-4 border-t border-[var(--color-border)]">
              <button type="submit" id="drawer-submit-btn" class="btn-primary w-full py-3.5 bg-[var(--color-accent)] text-white font-semibold rounded-xl btn-press flex justify-center items-center gap-2">
                <span>Получить чек-лист</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = html.trim(); // safe: template contains only escaped dynamic values and static HTML
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
        <div class="w-12 h-1 bg-[var(--color-border)] rounded-full mx-auto mb-6"></div>
        <div class="flex flex-col items-center justify-center text-center py-8">
          <div class="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
            <i data-lucide="check" class="w-8 h-8"></i>
          </div>
          <h3 class="text-xl font-bold mb-2 text-[var(--color-text)]">Готово!</h3>
          <p class="text-xs text-[var(--color-muted)] max-w-sm mb-6">
            Чек-лист успешно отправлен на ваш Email: <b>${escapeHtml(email)}</b>. Проверьте ваш почтовый ящик.
          </p>
          <button id="success-close-btn" class="btn-primary py-3 max-w-[200px]">Отлично</button>
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
      alert("Ошибка при отправке: " + err.message);
    }
  });

  initIcons();

  return { open: openDrawer, close: closeDrawer };
}
