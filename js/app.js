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
      <header class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-[var(--color-text)]">Кабинет психолога</h1>
          <p class="text-xs text-[var(--color-muted)]">Интерактивная самодиагностика</p>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-muted)]">
          <i data-lucide="user" class="w-3.5 h-3.5 text-[var(--color-accent)]"></i>
          <span>${state.user?.displayName || 'Пользователь'}</span>
        </div>
      </header>
      
      <!-- Контейнер для активного экрана -->
      <div id="screen-container"></div>
    </main>
  `;

  const screenContainer = document.getElementById('screen-container');

  const showHub = () => {
    renderHub(screenContainer, showQuiz, showSimulator);
  };

  const showQuiz = () => {
    renderQuiz(screenContainer, showHub);
  };

  const showSimulator = () => {
    renderSimulator(screenContainer, showHub);
  };

  // Запуск с главного экрана
  showHub();
  initIcons();
}

// Запуск приложения через Notibot Bridge
initBridge(function(state) {
  initApp(state);
});
