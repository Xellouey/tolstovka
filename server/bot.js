import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.warn('[tolsovka:bot] BOT_TOKEN is not set. Bot will not start.');
} else {
  const bot = new Telegraf(BOT_TOKEN);

  bot.start(async (ctx) => {
    try {
      const kb = Markup.inlineKeyboard([
        [Markup.button.callback('О нас', 'about')],
        [Markup.button.callback('Все о доставке', 'delivery')],
        [Markup.button.callback('Обратная связь', 'contact')],
      ]);

      const webAppUrl = process.env.BASE_URL || 'https://tolsovka.vercel.app';
      const isHttps = /^https:\/\//i.test(webAppUrl);

      let replyKbd;
      if (isHttps) {
        // WebApp доступен только по HTTPS — делаем кнопку снизу
        replyKbd = {
          keyboard: [[{ text: 'Каталог', web_app: { url: webAppUrl } }]],
          resize_keyboard: true,
          is_persistent: true,
        };
      } else {
        // Локальная разработка без HTTPS: показываем обычную клавиатуру и отдельную inline‑кнопку со ссылкой
        replyKbd = {
          keyboard: [[{ text: 'Каталог' }]],
          resize_keyboard: true,
          is_persistent: true,
        };
      }

      await ctx.reply('Добро пожаловать в TOLSOVKA! Выберите раздел или откройте Каталог снизу.', { reply_markup: replyKbd });

      if (!isHttps) {
        await ctx.reply('Для локального запуска без HTTPS используйте кнопку ниже (откроется во внешнем браузере):',
          Markup.inlineKeyboard([[Markup.button.url('Открыть каталог (локально)', webAppUrl)]])
        );
      }

      await ctx.reply('Навигация:', kb);
    } catch (e) {
      console.error(e);
    }
  });

  bot.action('about', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      'Толстовка — селективный штучный мерч. Следите за дропами в каталоге Mini App.',
      Markup.inlineKeyboard([[Markup.button.callback('Назад', 'back')]])
    );
  });

  bot.action('delivery', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      'Доставка по РФ. Условия уточняйте у менеджера в личных сообщениях перед покупкой.',
      Markup.inlineKeyboard([[Markup.button.callback('Назад', 'back')]])
    );
  });

  bot.action('contact', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      'По вопросам и заказам — пишите @dmitriy_mityuk. Ответим оперативно.',
      Markup.inlineKeyboard([[Markup.button.callback('Назад', 'back')]])
    );
  });

  bot.action('back', async (ctx) => {
    await ctx.answerCbQuery();
    const kb = Markup.inlineKeyboard([
      [Markup.button.callback('О нас', 'about')],
      [Markup.button.callback('Все о доставке', 'delivery')],
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
