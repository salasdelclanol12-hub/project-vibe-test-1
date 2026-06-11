// js/app.js
// Главная точка входа приложения.
// Здесь импортируются и собираются все компоненты.
// Подключенные компоненты: quiz, quiz-data, quiz-drawer, hub, simulator, simulator-data, simulator-drawer

import { initIcons } from './utils.js';
import { initBridge } from './bridge.js';
import { renderHub } from './components/hub.js';
import { renderQuiz } from './components/quiz.js';
import { renderSimulator } from './components/simulator.js';

/**
 * Инициализация и рендер приложения после готовности моста.
 * @param {Object} state - Состояние Notibot { user, app, colors }
 */
function initApp(state) {
  const loadingEl = document.getElementById('loading');
  const appEl = document.getElementById('app');

  if (loadingEl) loadingEl.classList.add('hidden');
  if (appEl) appEl.classList.remove('hidden');

  appEl.innerHTML = `
    <main class="max-w-xl mx-auto px-6 pt-8 pb-8 safe-top safe-bottom">
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-dashed border-black">
        <div class="relative pt-2">
          <div class="absolute top-[-8px] left-0 rotate-[-3deg] bg-[#6366f1] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border border-black shadow-[1.5px_1.5px_0px_0px_#000] rounded-sm">
            Mental Workspace 🧠
          </div>
          <h1 class="text-2xl font-black uppercase tracking-tight text-[var(--color-text)] mt-1.5">
            Кабинет <span class="bg-[var(--color-accent)] px-1.5 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] inline-block rotate-[-1.5deg]">психолога</span>
          </h1>
          <p class="text-xs font-bold text-[var(--color-muted)] mt-1.5 flex items-center gap-1.5">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black"></span>
            Баланс жизненных ресурсов
          </p>
        </div>
        <div class="flex items-center self-start sm:self-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-black text-xs font-black text-slate-800 shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-75">
          <div class="w-5 h-5 rounded-full bg-[#e1ff4b] border border-black flex items-center justify-center">
            <i data-lucide="sparkles" class="w-3 h-3 text-black"></i>
          </div>
          <span>${state.user ? state.user.displayName : 'Пользователь'}</span>
        </div>
      </header>
      
      <!-- Контейнер для активного экрана -->
      <div id="screen-container"></div>
    </main>
  `;

  const screenContainer = document.getElementById('screen-container');

  // Запуск симулятора баланса ресурсов напрямую
  renderSimulator(screenContainer);
  initIcons();
}

// Запуск приложения через Notibot Bridge
initBridge(function(state) {
  initApp(state);
});
