// js/components/simulator.js
// Компонент симулятора "Баланс семейных ресурсов".

import { initIcons, escapeHtml } from '../utils.js';
import { triggerHapticImpact } from '../bridge.js';
import { SIMULATOR_SPHERES, getPsychologistWarnings } from './simulator-data.js';
import { initSimulatorDrawer } from './simulator-drawer.js';

const FORM_SCHEMA = {
  formId: "simulator_resource_form",
  formName: "Получить чек-лист по балансу ресурсов"
};

export function renderSimulator(containerEl, onBack) {
  const values = { work: 20, partner: 20, kids: 20, personal: 20, household: 20 };

  function getSumOfOthers(currentId) {
    return SIMULATOR_SPHERES
      .filter(s => s.id !== currentId)
      .reduce((sum, s) => sum + values[s.id], 0);
  }

  // Рендерим начальную разметку
  const sphereFillsHtml = SIMULATOR_SPHERES.map(s => `
    <div class="space-y-1">
      <div class="flex justify-between items-center text-xs font-semibold text-[var(--color-text)]">
        <span class="flex items-center gap-1.5">
          <i data-lucide="${s.icon}" class="w-3.5 h-3.5" style="color: ${s.color}"></i>
          ${s.name}
        </span>
        <span id="label-${s.id}">${values[s.id]}%</span>
      </div>
      <div class="w-full h-2 bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--color-border)]">
        <div id="fill-${s.id}" class="h-full rounded-full transition-all duration-150" style="background-color: ${s.color}; width: ${values[s.id]}%"></div>
      </div>
    </div>
  `).join('');

  const slidersHtml = SIMULATOR_SPHERES.map(s => `
    <div class="space-y-1">
      <label class="text-xs font-medium text-[var(--color-muted)]">${s.name}</label>
      <input type="range" id="slider-${s.id}" min="0" max="100" value="${values[s.id]}" class="w-full h-1.5 bg-[var(--color-surface)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] border border-[var(--color-border)]" />
    </div>
  `).join('');

  containerEl.innerHTML = `
    <div class="fade-in space-y-6">
      <div class="flex items-center justify-between">
        <button id="sim-back-btn" class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] btn-press">
          <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
          <span>В меню</span>
        </button>
        <span id="energy-counter" class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500">Свободная энергия: 0%</span>
      </div>

      <div class="card p-5 space-y-4 bg-[var(--color-surface)] border-[var(--color-border)]">
        <h3 class="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">Распределение ресурсов</h3>
        <div class="space-y-3.5">${sphereFillsHtml}</div>
      </div>

      <div class="card p-5 space-y-4">
        <h3 class="text-sm font-bold uppercase text-[var(--color-text)]">Управляйте балансом</h3>
        <div class="space-y-3">${slidersHtml}</div>
      </div>

      <div id="warning-card" class="card p-4 bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5 min-h-[50px] transition-all duration-200">
        <i data-lucide="alert-triangle" class="w-4 h-4 shrink-0 mt-0.5"></i>
        <div id="warning-text" class="leading-relaxed">Все ресурсы распределены сбалансированно!</div>
      </div>

      <button id="sim-cta-btn" class="btn-primary py-4 flex items-center justify-center gap-2">
        <span>Проверить баланс</span>
        <i data-lucide="arrow-right" class="w-4 h-4"></i>
      </button>
    </div>
  `;

  initIcons();

  // Привязываем события
  containerEl.querySelector('#sim-back-btn').addEventListener('click', onBack);

  const ctaBtn = containerEl.querySelector('#sim-cta-btn');
  const energyCounter = containerEl.querySelector('#energy-counter');
  const warningText = containerEl.querySelector('#warning-text');
  const warningCard = containerEl.querySelector('#warning-card');

  function updateSimulatorUI() {
    const sum = SIMULATOR_SPHERES.reduce((acc, s) => acc + values[s.id], 0);
    const remaining = 100 - sum;

    if (remaining === 0) {
      energyCounter.className = "text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500";
      energyCounter.textContent = "Свободная энергия: 0%";
      ctaBtn.disabled = false;
      ctaBtn.style.opacity = "1";
    } else {
      energyCounter.className = "text-xs font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-500";
      energyCounter.textContent = remaining > 0 ? `Осталось распределить: ${remaining}%` : `Перерасход: ${Math.abs(remaining)}%`;
      ctaBtn.disabled = true;
      ctaBtn.style.opacity = "0.5";
    }

    // Реактивные предупреждения
    const warnings = getPsychologistWarnings(values);
    if (warnings.length > 0) {
      warningCard.className = "card p-4 bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5 transition-all duration-200";
      warningText.textContent = warnings[0];
    } else {
      warningCard.className = "card p-4 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5 transition-all duration-200";
      warningText.textContent = "Баланс ресурсов распределен гармонично.";
    }
  }

  SIMULATOR_SPHERES.forEach(s => {
    const slider = containerEl.querySelector(`#slider-${s.id}`);
    const label = containerEl.querySelector(`#label-${s.id}`);
    const fill = containerEl.querySelector(`#fill-${s.id}`);

    slider.addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10);
      const otherSum = getSumOfOthers(s.id);
      const allowed = 100 - otherSum;

      if (val > allowed) {
        val = allowed;
        slider.value = allowed;
      }

      values[s.id] = val;
      label.textContent = `${val}%`;
      fill.style.width = `${val}%`;

      triggerHapticImpact('light');
      updateSimulatorUI();
    });
  });

  ctaBtn.addEventListener('click', () => {
    const summary = SIMULATOR_SPHERES.map(s => `${s.name}: ${values[s.id]}%`).join(', ');
    const drawer = initSimulatorDrawer(FORM_SCHEMA, summary, () => {
      onBack();
    });
    drawer.open();
  });

  updateSimulatorUI();
}
