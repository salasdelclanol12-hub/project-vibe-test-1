// js/components/simulator-data.js
// Данные сфер баланса ресурсов и рекомендации психолога.

export const SIMULATOR_SPHERES = [
  { id: 'work', name: 'Работа', color: 'var(--color-accent)', icon: 'briefcase' },
  { id: 'partner', name: 'Партнер', color: '#ec4899', icon: 'heart' },
  { id: 'kids', name: 'Дети', color: '#3b82f6', icon: 'smile' },
  { id: 'personal', name: 'Личное время (Я)', color: '#10b981', icon: 'user' },
  { id: 'household', name: 'Быт', color: '#f59e0b', icon: 'home' }
];

/**
 * Проверяет текущее распределение ресурсов и возвращает предупреждения от "внутреннего психолога".
 * @param {Object} values - Значения по каждой сфере
 * @returns {Array<string>} - Список замечаний/предупреждений
 */
export function getPsychologistWarnings(values) {
  const warnings = [];
  
  if (values.personal === 0) {
    warnings.push("⚠️ Внутренний психолог: Личное время на нуле! Риск выгорания 99%. Начните заботиться о себе.");
  }
  if (values.work > 50) {
    warnings.push("💼 Внутренний психолог: Работа занимает больше 50% ресурсов. Это прямая дорога к переутомлению.");
  }
  if (values.household > 40) {
    warnings.push("🧹 Внутренний психолог: Быт забирает слишком много энергии. Попробуйте делегировать часть рутины.");
  }
  if (values.personal > 30 && values.work < 15) {
    warnings.push("🏖️ Внутренний психолог: Много заботы о себе — это здорово, но не забывайте про важные дела.");
  }
  
  return warnings;
}
