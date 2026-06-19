// js/components/quiz-data.js
// Данные вопросов и результатов квиза.

export const FORM_SCHEMA = {
  formId: "1T2IQFttHlhA8t228jdvxU",
  formName: "Для вайб теста ",
  additionalText: "Спасибо за заполнение!\n\nТеперь перейди сюда\n[&b2001;&c#14B860;&variantcontained;&sizeM;Перейти](https://t.me/bot/post#3TjgLMj8Rt54EndOPXLXr1)\n"
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
