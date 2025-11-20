import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.warn('[tolsovka:bot] BOT_TOKEN is not set. Bot will not start.');
} else {
  const bot = new Telegraf(BOT_TOKEN);

  bot.telegram.setMyCommands([
    { command: 'start', description: 'Запустить бота' }
  ]);

  bot.start(async (ctx) => {
    try {
      const kb = Markup.inlineKeyboard([
        [Markup.button.callback('О нас', 'about')],
        [Markup.button.callback('Доставка', 'delivery')],
        [Markup.button.callback('FAQ', 'faq')],
        [Markup.button.callback('Обратная связь', 'contact')],
      ]);

      await ctx.reply('Привет, это Толстовка!\nДобро пожаловать в наш онлайн-магазин\n\nЗдесь ты можешь посмотреть весь ассортимент одежды, обуви и аксессуаров\n\nПереходи в каталог, выбирай и пиши нам для заказа 💛');

      await ctx.reply('Навигация:', kb);
    } catch (e) {
      console.error(e);
    }
  });

  bot.action('about', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      'Толстовка — это ламповый винтажный магазин в историческом центре Калининграда\nРаботаем с ноября 2021 года\n\nУ нас ты найдешь: винтажную одежду, сумки, обувь, аксессуары и изделия ручной работы от местных мастеров \n\nРаботаем каждый день с 12 до 20\n📍Калининград, ул. Комсомольская 17',
      Markup.inlineKeyboard([[Markup.button.callback('Назад', 'back')]])
    );
  });

  bot.action('delivery', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      'Отправляем заказы по всей стране Почтой России два раза в неделю \n\nДля оформления доставки нам понадобятся твои данные: ФИО, адрес, индекс и контактный номер телефона \n\nОплата заказа производится онлайн по QR-коду \nСтоимость доставки зависит от размеров посылки\n\nБолее подробную информацию мы обязательно тебе вышлем на этапе оформления заказа 💛',
      Markup.inlineKeyboard([[Markup.button.callback('Назад', 'back')]])
    );
  });

  bot.action('faq', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      'Ответы на самые частые вопросы для тех, кто только к нам подключился:\n\n' +
      '• Привозим шмот из Европы, Америки и Канады\n' +
      '• У нас есть винтаж 70-80-90-00х\n' +
      '• Помимо вещей — аксессуары, сумки, украшения ручной работы, обувь, шапки и шляпки\n' +
      '• Отправляем посылки по стране два раза в неделю, по вторникам и пятницам (да, доставка есть)\n' +
      '• Обновляем шмот по категориям (например, белые рубашки, кроссовки, олипмийки) всегда 2 раза в неделю, конкретного дня нет\n' +
      '• К сожалению, мы не принимаем вещи на реализацию и не планируем это делать\n' +
      '• Работаем с сервисом Долями — можешь разделить покупку на 4 равных платежа на 6 недель без комиссии и переплаты\n' +
      '• В продаже есть подарочные сертификаты номиналом 500, 1000, 1500, 2000, 3000, 4000 и 5000 руб.\n' +
      ' \n' +
      'Да, у нас есть скидки:\n' +
      '• -20% в день рождения — неделя до и после, просто покажи любой документ, удостоверяющего личность\n' +
      '• -10% за отзыв на 2Гис или Яндекс.Картах — действует один раз\n' +
      'Раз в сезон — большая распродажа со скидками 40%-60%\n\n' +
      'И немного подробнее о нас:\n' +
      '• Команда Толстовки — это Варя, Кеша, Ника и Леся (мы сами всё придумываем и снимаем)\n' +
      '• Магазин работает с ноября 2021 года\n' +
      '• Мы находимся в перманентном улучшении Толстовки и ремонте\n' +
      '• Очень любим животных — мы вери дог френдли\n' +
      '• Очень любим наряжаться и цацки\n\n' +
      'Приятно познакомиться! Ждём в гости и твой заказ онлайн💛\n\n' +
      'Если остались вопросы — пиши в раздел «Обратная связь»',
      Markup.inlineKeyboard([[Markup.button.callback('Назад', 'back')]])
    );
  });

  bot.action('contact', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      'Есть вопросы — пиши в личные сообщения @tolstovka_second_maneger',
      Markup.inlineKeyboard([[Markup.button.callback('Назад', 'back')]])
    );
  });

  bot.action('back', async (ctx) => {
    await ctx.answerCbQuery();
    const kb = Markup.inlineKeyboard([
      [Markup.button.callback('О нас', 'about')],
      [Markup.button.callback('Доставка', 'delivery')],
      [Markup.button.callback('FAQ', 'faq')],
      [Markup.button.callback('Обратная связь', 'contact')],
    ]);
    await ctx.editMessageText('Навигация:', kb);
  });

  (async () => {
    try {
      // На всякий случай удаляем webhook, чтобы getUpdates заработал
      await bot.telegram.deleteWebhook({ drop_pending_updates: true });
      await bot.launch();
      console.log('[tolsovka:bot] started (long polling). BASE_URL=', process.env.BASE_URL);
    } catch (err) {
      console.error('[tolsovka:bot] launch error:', err);
    }
  })();

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
