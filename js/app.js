// js/app.js
// Главная точка входа приложения.
// Здесь импортируются и собираются все компоненты.
// Подключенные компоненты: quiz, quiz-data, quiz-drawer, hub, simulator, simulator-data, simulator-drawer, quiz-render-steps, quiz-render-result

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
      <header class="flex flex-col gap-4 mb-8 pb-6 border-b-2 border-black">
        <div class="flex items-center justify-between gap-4">
          <!-- Левая часть: Категория и Статус -->
          <div class="flex items-center gap-2">
            <span class="bg-[#6366f1] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] rounded-md">
              Mental Workspace 🧠
            </span>
            <span class="text-[10px] font-bold text-slate-700 bg-white px-2 py-1 border-2 border-black rounded-md flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black"></span>
              Активен
            </span>
          </div>
          
          <!-- Правая часть: Профиль пользователя -->
          <div class="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-xl text-xs font-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-75">
            <div class="w-6 h-6 rounded-full bg-[var(--color-accent)] border-2 border-black flex items-center justify-center text-[10px] overflow-hidden">
              ${state.user && state.user.photoURL ? `<img src="${state.user.photoURL}" alt="avatar" class="w-full h-full object-cover">` : '👤'}
            </div>
            <span class="text-slate-800">${state.user ? state.user.displayName : 'Пользователь'}</span>
          </div>
        </div>

        <!-- Заголовок -->
        <div class="mt-2">
          <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[var(--color-text)] leading-tight">
            Кабинет <span class="bg-[var(--color-accent)] text-black px-3 py-1 border-2 border-black shadow-[3px_3px_0px_0px_#000] inline-block rotate-[-1deg] rounded-md">психолога</span>
          </h1>
          <p class="text-sm font-medium text-[var(--color-muted)] mt-2">
            Баланс жизненных ресурсов и психологическая поддержка
          </p>
        </div>
      </header>
      
      <!-- Контейнер для активного экрана -->
      <div id="screen-container"></div>
    </main>
  `;

  const screenContainer = document.getElementById('screen-container');

  const showHub = () => {
    renderHub(
      screenContainer,
      () => renderQuiz(screenContainer, showHub),
      () => renderSimulator(screenContainer, showHub)
    );
  };
  showHub();
  initIcons();
}

// Запуск приложения через Notibot Bridge
initBridge(function(state) {
  initApp(state);
});
