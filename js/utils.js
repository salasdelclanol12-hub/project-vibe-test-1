// js/utils.js
// Переиспользуемые вспомогательные функции.
// Перед созданием новой функции — проверь, нет ли похожей здесь.

/**
 * Создать DOM-элемент из HTML-строки.
 * @param {string} html
 * @returns {HTMLElement}
 */
export function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim(); // safe: html аргумент — шаблон из компонента, не данные пользователя
  return template.content.firstChild;
}

/**
 * Безопасно экранировать HTML (защита от XSS).
 * Используй при вставке пользовательских данных в разметку.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

/**
 * Показать элемент (убрать класс hidden).
 * @param {string|HTMLElement} selectorOrEl
 */
export function show(selectorOrEl) {
  const el = typeof selectorOrEl === 'string'
    ? document.querySelector(selectorOrEl)
    : selectorOrEl;
  if (el) el.classList.remove('hidden');
}

/**
 * Скрыть элемент (добавить класс hidden).
 * @param {string|HTMLElement} selectorOrEl
 */
export function hide(selectorOrEl) {
  const el = typeof selectorOrEl === 'string'
    ? document.querySelector(selectorOrEl)
    : selectorOrEl;
  if (el) el.classList.add('hidden');
}

/**
 * Форматировать число как цену (например: 1500 → "1 500 ₽").
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export function formatPrice(amount, currency = '₽') {
  return `${Number(amount).toLocaleString('ru-RU')} ${currency}`;
}

/**
 * Debounce — отложить выполнение функции.
 * Полезно для предотвращения двойных нажатий.
 * @param {Function} fn
 * @param {number} delay — мс
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Инициализировать Lucide иконки после рендера компонентов.
 * Вызывать один раз после добавления HTML в DOM.
 */
export function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Парсить markdown ссылки и кастомные кнопки для Notibot.
 * @param {string} text
 * @returns {string} HTML
 */
export function parseMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text).replace(/\n/g, '<br>');
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  html = html.replace(linkRegex, (match, anchorText, url) => {
    if (anchorText.startsWith('&amp;b') || anchorText.startsWith('&amp;c') || anchorText.includes('&amp;')) {
      const parts = anchorText.split(';');
      let buttonText = '';
      let color = '';
      
      parts.forEach(part => {
        if (part.startsWith('&amp;c')) {
          color = part.replace('&amp;c', '').trim();
        } else if (!part.startsWith('&amp;b') && !part.startsWith('&amp;variant') && !part.startsWith('&amp;size')) {
          buttonText = part;
        }
      });
      
      if (!buttonText) {
        buttonText = parts[parts.length - 1];
      }
      
      const bgStyle = color ? `background-color: ${color};` : '';
      return `<a href="${url}" onclick="event.preventDefault(); window.openLink('${url}')" class="inline-flex items-center justify-center px-6 py-2.5 my-2 border-2 border-black rounded-xl text-sm font-black shadow-[3px_3px_0px_0px_#000] text-black hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] transition-all" style="${bgStyle}">${buttonText}</a>`;
    }
    
    return `<a href="${url}" onclick="event.preventDefault(); window.openLink('${url}')" class="text-[#6366f1] underline font-bold">${anchorText}</a>`;
  });
  
  return html;
}
