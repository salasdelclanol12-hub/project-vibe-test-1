// js/app.js
// Главная точка входа приложения.
// Здесь импортируются и собираются все компоненты.
// Подключенные компоненты: quiz, quiz-data, quiz-drawer


import { initIcons } from './utils.js';
import { initBridge } from './bridge.js';
import { renderQuiz } from './components/quiz.js';

/**
 * Инициализация и рендер приложения после готовности моста.
 * @param {Object} state - Состояние Notibot { user, app, colors }
 */
function initApp(state) {
  const loadingEl = document.getElementById('loading');
  const appEl = document.getElementById('app');

  // Скрываем экран загрузки и показываем основной контейнер
  if (loadingEl) loadingEl.classList.add('hidden');
  if (appEl) appEl.classList.remove('hidden');

  appEl.innerHTML = `
    <main class="max-w-xl mx-auto px-6 pt-8 pb-8 safe-top safe-bottom">
      <header class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-[var(--color-text)]">Психологический Квиз</h1>
          <p class="text-xs text-[var(--color-muted)]">Тест на эмоциональное выгорание</p>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-muted)]">
          <i data-lucide="user" class="w-3.5 h-3.5 text-[var(--color-accent)]"></i>
          <span>${state.user?.displayName || 'Пользователь'}</span>
        </div>
      </header>
      
      <!-- Контейнер квиза -->
      <div id="quiz-container"></div>
    </main>
  `;

  // Рендерим квиз в контейнере
  const quizContainer = document.getElementById('quiz-container');
  renderQuiz(quizContainer);

  initIcons();
}

// Запуск приложения через Notibot Bridge
initBridge(function(state) {
  initApp(state);
});
