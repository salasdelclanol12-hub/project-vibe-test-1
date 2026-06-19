// js/components/hub.js
// Главное меню кабинета психолога (Экран-хаб).

import { initIcons } from '../utils.js';
import { triggerHapticImpact, goToArticle, goToProduct } from '../bridge.js';

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
        <h2 class="text-lg font-black mb-1.5 uppercase tracking-wide">🧠 Меню самопомощи</h2>
        <p class="text-xs text-slate-700 leading-relaxed font-medium">
          Пройдите тесты ниже, чтобы оценить свое эмоциональное состояние и получить рекомендации психолога.
        </p>
      </div>

      <div class="space-y-5">
        <!-- Карточка Квиза -->
        <div id="hub-quiz-card" class="neo-card bg-[#e0dbff] cursor-pointer flex items-start gap-4 hover:translate-y-[-2px] transition-transform btn-press">
          <div class="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
            <i data-lucide="clipboard-list" class="w-6 h-6 text-[#6366f1]"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-black text-slate-900 mb-1 uppercase tracking-tight">Тест на выгорание</h3>
            <p class="text-xs text-slate-700 leading-normal font-medium">5 вопросов для точной оценки вашего уровня эмоционального истощения.</p>
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

        <!-- Секция дополнительных ресурсов -->
        <div class="neo-card bg-white space-y-4">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-900">Полезные материалы</h3>
          <div class="space-y-3">
            <button id="hub-article-btn" class="neo-btn neo-btn-secondary text-left font-bold text-xs flex justify-between items-center py-3.5 px-4 shadow-[2px_2px_0px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]">
              <span class="flex items-center gap-2">
                <i data-lucide="book-open" class="w-4 h-4 text-[#6366f1]"></i>
                Читать статью
              </span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </button>
            
            <button id="hub-product-btn" class="neo-btn neo-btn-secondary text-left font-bold text-xs flex justify-between items-center py-3.5 px-4 shadow-[2px_2px_0px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]">
              <span class="flex items-center gap-2">
                <i data-lucide="shopping-bag" class="w-4 h-4 text-[#10b981]"></i>
                Посмотреть товар
              </span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </button>
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

  containerEl.querySelector('#hub-article-btn').addEventListener('click', () => {
    triggerHapticImpact('light');
    goToArticle('1DxmLSEyBQwUh594rak84o');
  });

  containerEl.querySelector('#hub-product-btn').addEventListener('click', () => {
    triggerHapticImpact('light');
    goToProduct('07Au8KzNogbmGRvM28jIEl');
  });
}
