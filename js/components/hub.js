// js/components/hub.js
// Главное меню кабинета психолога (Экран-хаб).

import { initIcons, escapeHtml } from '../utils.js';
import { triggerHapticImpact } from '../bridge.js';

/**
 * Рендерит экран выбора тестов.
 * @param {HTMLElement} containerEl - Контейнер для рендера
 * @param {Function} onSelectQuiz - Переход к квизу выгорания
 * @param {Function} onSelectSimulator - Переход к симулятору баланса
 */
export function renderHub(containerEl, onSelectQuiz, onSelectSimulator) {
  containerEl.innerHTML = `
    <div class="fade-in space-y-6">
      <div class="card p-6 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent border-[var(--color-border)]">
        <h2 class="text-lg font-bold mb-1.5 text-[var(--color-text)]">Позаботьтесь о себе</h2>
        <p class="text-xs text-[var(--color-muted)] leading-relaxed">
          Выберите один из интерактивных инструментов ниже, чтобы определить текущий уровень стресса или найти баланс жизненных ресурсов.
        </p>
      </div>

      <div class="grid gap-4">
        <!-- Карточка Квиза -->
        <div id="hub-quiz-card" class="card p-5 hover:border-[var(--color-accent)] transition-all cursor-pointer flex items-start gap-4 btn-press">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <i data-lucide="clipboard-list" class="w-5 h-5"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold text-[var(--color-text)] mb-0.5">Тест на выгорание</h3>
            <p class="text-xs text-[var(--color-muted)] leading-normal">5 быстрых вопросов, которые помогут узнать ваш текущий уровень стресса.</p>
          </div>
        </div>

        <!-- Карточка Симулятора -->
        <div id="hub-sim-card" class="card p-5 hover:border-[var(--color-accent)] transition-all cursor-pointer flex items-start gap-4 btn-press">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <i data-lucide="sliders" class="w-5 h-5"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold text-[var(--color-text)] mb-0.5">Симулятор баланса</h3>
            <p class="text-xs text-[var(--color-muted)] leading-normal">Интерактивное распределение 100% энергии по главным жизненным сферам.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  initIcons();

  containerEl.querySelector('#hub-quiz-card').addEventListener('click', () => {
    triggerHapticImpact('medium');
    onSelectQuiz();
  });

  containerEl.querySelector('#hub-sim-card').addEventListener('click', () => {
    triggerHapticImpact('medium');
    onSelectSimulator();
  });
}
