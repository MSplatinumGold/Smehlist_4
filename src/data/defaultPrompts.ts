import { PromptItem } from '../types/game.ts';

export const DEFAULT_PROMPTS: PromptItem[] = [
  // --- 15 Original items from mehlist_b03b2d30.txt ---
  { id: 'meh-1', text: 'Худшая вещь, которую можно услышать от хирурга перед наркозом', type: 'STANDARD', tag: 'STANDARD' },
  { id: 'meh-2', text: 'Название фильма для взрослых с участием сантехника и мамы твоего друга', type: 'STANDARD', tag: '18+' },
  { id: 'meh-3', text: 'Что на самом деле скрывают коты, когда смотрят в пустую стену?', type: 'STANDARD', tag: 'FAMILY' },
  { id: 'meh-4', text: 'Худший подарок на первом свидании', type: 'STANDARD', tag: 'STANDARD' },
  { id: 'meh-5', text: 'Причина, по которой вас выгнали из библиотеки', type: 'STANDARD', tag: 'STANDARD' },
  { id: 'meh-6', text: 'Фраза, способная моментально разрушить свадьбу', type: 'STANDARD', tag: '18+' },
  { id: 'meh-7', text: 'Секретный ингредиент школьных котлет', type: 'STANDARD', tag: 'FAMILY' },
  { id: 'meh-8', text: 'Как бы называлась автобиография самого ленивого человека в мире?', type: 'STANDARD', tag: 'STANDARD' },
  { id: 'meh-9', text: 'Самое странное, что можно найти под подушкой в отеле', type: 'STANDARD', tag: 'STANDARD' },
  { id: 'meh-10', text: 'Худший девиз для авиакомпании', type: 'STANDARD', tag: 'STANDARD' },
  { id: 'meh-11', text: 'Что бабушка прячет в серванте от посторонних глаз?', type: 'STANDARD', tag: 'FAMILY' },
  { id: 'meh-12', text: 'Неожиданный ответ на вопрос «Кем вы видите себя через 5 лет?»', type: 'STANDARD', tag: 'STANDARD' },
  { id: 'meh-13', text: '3 вещи, которые точно нельзя делать в бане', type: 'THRIP', tag: 'STANDARD' },
  { id: 'meh-14', text: '3 признака того, что ваш сосед — суперзлодей', type: 'THRIP', tag: 'FAMILY' },
  { id: 'meh-15', text: '3 вещи, за которые вас арестуют в раю', type: 'THRIP', tag: '18+' },

  // --- Extended high-quality bank for rich replayability ---
  { id: 'meh-16', text: 'Худшая татуировка, сделанная по пьяни на спор', type: 'STANDARD', tag: '18+' },
  { id: 'meh-17', text: 'Что кричит попугай, который слишком долго жил в коммуналке?', type: 'STANDARD', tag: 'FAMILY' },
  { id: 'meh-18', text: 'Главное правило бойцовского клуба бухгалтеров', type: 'STANDARD', tag: 'STANDARD' },
  { id: 'meh-19', text: 'Худшее оправдание перед инспектором ГАИ', type: 'STANDARD', tag: 'STANDARD' },
  { id: 'meh-20', text: 'Что на самом деле написано мелким шрифтом в брачном договоре?', type: 'STANDARD', tag: '18+' },
  { id: 'meh-21', text: 'Самый сомнительный лайфхак из TikTok, который кто-то реально проверил', type: 'STANDARD', tag: 'FAMILY' },
  { id: 'meh-22', text: 'Честное название для энергетического напитка за 39 рублей', type: 'STANDARD', tag: 'STANDARD' },
  { id: 'meh-23', text: 'Причина, почему инопланетяне пролетают мимо Земли не останавливаясь', type: 'STANDARD', tag: 'STANDARD' },
  { id: 'meh-24', text: 'Худшая фраза во время интимного момента', type: 'STANDARD', tag: '18+' },
  { id: 'meh-25', text: 'Что думает собака, когда хозяин надевает штаны?', type: 'STANDARD', tag: 'FAMILY' },
  { id: 'meh-26', text: 'Самый нелепый способ потратить миллион долларов за 10 минут', type: 'STANDARD', tag: 'STANDARD' },
  { id: 'meh-27', text: '3 причины не выходить замуж за программиста', type: 'THRIP', tag: 'STANDARD' },
  { id: 'meh-28', text: '3 вещи, которые находят в рюкзаке пятиклассника в конце мая', type: 'THRIP', tag: 'FAMILY' },
  { id: 'meh-29', text: '3 худших места для предложения руки и сердца', type: 'THRIP', tag: 'STANDARD' },
  { id: 'meh-30', text: '3 причины, почему вечеринка закончилась приездом МЧС', type: 'THRIP', tag: '18+' },
  { id: 'meh-31', text: '3 мысли кота в 4 часа утра', type: 'THRIP', tag: 'FAMILY' },
  { id: 'meh-32', text: '3 запрещённых приема на родительском собрании', type: 'THRIP', tag: 'FAMILY' },
  { id: 'meh-33', text: '3 тайных ингредиента шаурмы на вокзале', type: 'THRIP', tag: 'STANDARD' }
];

export const BOT_NAMES = ['Умник-ИИ', 'Бабушкин Любимчик', 'Шутник Валера', 'Тётя Зина', 'Случайный Гость', 'Капитан Очевидность'];

export const BOT_AVATARS = ['🤖', '🦊', '🐱', '🐼', '🦁', '🐸', '🦄', '🐙', '👾', '🚀'];

export const BOT_ANSWERS_SAMPLE: Record<string, string[]> = {
  default: [
    'Сказать «Ой, а куда это делось?» и включить фонарик на телефоне',
    'Молча смотреть в глаза и не моргать 10 секунд',
    'Зарядку от айфона и прошлогодний чек из Пятерочки',
    '«Мы падаем, но со скидкой 20% на следующий рейс!»',
    'Диплом по астрологии и банку маринованных огурцов'
  ],
  thrip: [
    'Чай с мятой',
    'Веник из кактуса',
    'Караоке группы Король и Шут'
  ]
};
