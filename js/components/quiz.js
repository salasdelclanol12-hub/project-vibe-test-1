// js/components/quiz.js
// Основной компонент квиза.

import { renderIntro, renderQuestion } from './quiz-render-steps.js';
import { renderResult } from './quiz-render-result.js';
import { QUIZ_QUESTIONS } from './quiz-data.js';
import { initIcons } from '../utils.js';

export function renderQuiz(containerEl, onBack) {
  let step = 0; // 0 - старт, 1..3 - вопросы, 4 - результаты/отправка
  const answers = {};

  const ctx = {
    getStep: () => step,
    setStep: (val) => { step = val; },
    getAnswers: () => answers,
    containerEl,
    onBack,
    render: () => render(),
    totalQuestions: QUIZ_QUESTIONS.length,
    getQuestion: (idx) => QUIZ_QUESTIONS[idx]
  };

  function render() {
    if (step === 0) {
      renderIntro(ctx);
    } else if (step <= QUIZ_QUESTIONS.length) {
      renderQuestion(ctx);
    } else {
      renderResult(ctx);
    }
    initIcons();
  }

  render();
}
