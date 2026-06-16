// js/components/simulator.js
// Компонент симулятора "Баланс семейных ресурсов".

import { initIcons } from '../utils.js';
import { triggerHapticImpact } from '../bridge.js';
import { SIMULATOR_SPHERES, getPsychologistWarnings } from './simulator-data.js';
import { initSimulatorDrawer } from './simulator-drawer.js';

const FORM_SCHEMA = {
  formId: "2aitGGUUazggGzsMWDd2XY",
  formName: "Получить чек-лист по балансу ресурсов"
};

export function renderSimulator(containerEl, onBack) {
  const values = { work: 20, partner: 20, kids: 20, personal: 20, household: 20 };

  function getSumOfOthers(currentId) {
    return SIMULATOR_SPHERES
      .filter(s => s.id !== currentId)
      .reduce((sum, s) => sum + values[s.id], 0);
  }

  const sphereFillsHtml = SIMULATOR_SPHERES.map(s => `
    <div class="space-y-1">
      <div class="flex justify-between items-center text-xs font-black text-slate-900 uppercase">
        <span class="flex items-center gap-1.5">
          <i data-lucide="${s.icon}" class="w-4 h-4" style="color: ${s.color === 'var(--color-accent)' ? '#000000' : s.color}"></i>
          ${s.name}
        </span>
        <span id="label-${s.id}">${values[s.id]}%</span>
      </div>
      <div class="w-full h-4 bg-white rounded-full overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_#000]">
        <div id="fill-${s.id}" class="h-full border-r-2 border-black transition-all duration-150" style="background-color: ${s.color}; width: ${values[s.id]}%"></div>
      </div>
    </div>
  `).join('');

  const slidersHtml = SIMULATOR_SPHERES.map(s => `
    <div class="space-y-1">
      <label class="text-xs font-black uppercase text-slate-800">${s.name}</label>
      <input type="range" id="slider-${s.id}" min="0" max="100" value="${values[s.id]}" />
    </div>
  `).join('');

  containerEl.innerHTML = `
    <div class="fade-in space-y-6">
      <div class="flex items-center justify-between">
        ${onBack ? `
          <button id="sim-back-btn" class="neo-btn neo-btn-secondary py-2 px-3 text-xs max-w-[100px]">
            <i data-lucide="chevron-left" class="w-3.5 h-3.5 mr-1"></i>
            <span>В меню</span>
          </button>
        ` : '<div></div>'}
        <span id="energy-counter" class="text-xs font-black px-3 py-1.5 rounded-full border-2 border-black bg-emerald-500/10 text-emerald-600 shadow-[2px_2px_0px_0px_#000]">Свободная энергия: 0%</span>
      </div>

      <div class="neo-card space-y-4">
        <h3 class="text-xs font-black uppercase tracking-wider text-slate-900">Распределение ресурсов</h3>
        <div class="space-y-3.5">${sphereFillsHtml}</div>
      </div>

      <div class="neo-card space-y-4 bg-[#e0dbff]">
        <h3 class="text-xs font-black uppercase text-slate-900 tracking-wider">Управляйте балансом</h3>
        <div class="space-y-3">${slidersHtml}</div>
      </div>

      <div id="warning-card" class="neo-card bg-[#fff5d6] text-xs flex items-start gap-2.5 min-h-[50px] transition-all duration-200">
        <i data-lucide="alert-triangle" class="w-4 h-4 shrink-0 mt-0.5 text-[#d97706]"></i>
        <div id="warning-text" class="leading-relaxed font-semibold text-slate-800">Все ресурсы распределены сбалансированно!</div>
      </div>

      <button id="sim-cta-btn" class="neo-btn">
        <span>Проверить баланс</span>
        <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
      </button>
    </div>
  `;

  initIcons();

  if (onBack) {
    containerEl.querySelector('#sim-back-btn').addEventListener('click', onBack);
  }

  const ctaBtn = containerEl.querySelector('#sim-cta-btn');
  const energyCounter = containerEl.querySelector('#energy-counter');
  const warningText = containerEl.querySelector('#warning-text');
  const warningCard = containerEl.querySelector('#warning-card');

  function updateSimulatorUI() {
    const sum = SIMULATOR_SPHERES.reduce((acc, s) => acc + values[s.id], 0);
    const remaining = 100 - sum;

    if (remaining === 0) {
      energyCounter.className = "text-xs font-black px-3 py-1.5 rounded-full border-2 border-black bg-emerald-500/10 text-emerald-700 shadow-[2px_2px_0px_0px_#000]";
      energyCounter.textContent = "Свободная энергия: 0%";
      ctaBtn.disabled = false;
      ctaBtn.style.opacity = "1";
    } else {
      energyCounter.className = "text-xs font-black px-3 py-1.5 rounded-full border-2 border-black bg-rose-500/10 text-rose-700 shadow-[2px_2px_0px_0px_#000]";
      energyCounter.textContent = remaining > 0 ? `Осталось распределить: ${remaining}%` : `Перерасход: ${Math.abs(remaining)}%`;
      ctaBtn.disabled = true;
      ctaBtn.style.opacity = "0.5";
    }

    const warnings = getPsychologistWarnings(values);
    if (warnings.length > 0) {
      warningCard.className = "neo-card bg-[#fff5d6] text-xs flex items-start gap-2.5 transition-all duration-200";
      warningText.textContent = warnings[0];
    } else {
      warningCard.className = "neo-card bg-[#d7f9e6] text-xs flex items-start gap-2.5 transition-all duration-200";
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
      if (onBack) onBack();
    });
    drawer.open();
  });

  updateSimulatorUI();
}
