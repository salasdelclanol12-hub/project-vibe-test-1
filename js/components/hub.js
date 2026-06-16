// js/components/hub.js
// Главное меню кабинета психолога (Экран-хаб).

import { initIcons } from '../utils.js';
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
      <div class="neo-card bg-[#fff5d6] text-slate-900">
        <h2 class="text-lg font-black mb-1.5 uppercase tracking-wide">🧠 Кабинет самопомощи и развития</h2>
        <p class="text-xs text-slate-700 leading-relaxed font-medium">
          Выберите нужный инструмент ниже, чтобы оценить баланс сил или настроить воронку развития.
        </p>
      </div>

      <div class="space-y-5">
        <!-- Карточка Квиза -->
        <div id="hub-quiz-card" class="neo-card bg-[#e0dbff] cursor-pointer flex items-start gap-4 hover:translate-y-[-2px] transition-transform btn-press">
          <div class="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
            <i data-lucide="clipboard-list" class="w-6 h-6 text-[#6366f1]"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-black text-slate-900 mb-1 uppercase tracking-tight">Квиз перед воронкой</h3>
            <p class="text-xs text-slate-700 leading-normal font-medium">Ответьте на 2 вопроса, чтобы получить персональные рекомендации для вашего канала.</p>
          </div>
        </div>

        <!-- Карточка Симулятора -->
        <div id="hub-sim-card" class="neo-card bg-[#d7f9e6] cursor-pointer flex items-start gap-4 hover:translate-y-[-2px] transition-transform btn-press">
          <div class="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
            <i data-lucide="sliders" class="w-6 h-6 text-[#10b981]"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-black text-slate-900 mb-1 uppercase tracking-tight">Баланс ресурсов</h3>
            <p class="text-xs text-slate-700 leading-normal font-medium">Слайдер-симулятор распределения энергии по 5 ключевым сферам жизни.</p>
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
