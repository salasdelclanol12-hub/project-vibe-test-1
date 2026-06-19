// js/components/quiz-data.js
// Данные вопросов и результатов квиза.

export const FORM_SCHEMA = {
  formId: "1T2IQFttHlhA8t228jdvxU",
  formName: "Для вайб теста ",
  additionalText: "Спасибо за заполнение!"
};

export const QUIZ_QUESTIONS = [
  {
    title: "имя",
    type: "text",
    required: false
  },
  {
    title: "Телефон",
    type: "phone",
    required: true
  },
  {
    title: "Ваш доход",
    type: "one of list",
    required: true,
    options: [
      "50к",
      "100к",
      "300к"
    ]
  }
];
