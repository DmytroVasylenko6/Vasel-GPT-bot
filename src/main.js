const { code } = require('telegraf/format');
const { message } = require('telegraf/filters');
const { Telegraf, session } = require('telegraf');
const openai = require('./openai');
const ogg = require('./ogg');

const INITIAL_SESSION = {
  messages: [],
};

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.use(session());

bot.command('new', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply('I am waiting for your voice or text message');
});

bot.command('start', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply('I am waiting for your voice or text message');
});

bot.on(message('voice'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  try {
    await ctx.reply(code('Message processing...'));
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMP3(oggPath, userId);
    const text = await openai.transcription(mp3Path);
    await ctx.reply(code(`Your request: ${text}`));
    const messages = [{ role: openai.roles.USER, content: text }];
    ctx.session.messages.push({ role: openai.roles.USER, content: text });
    const response = await openai.chat(ctx.session.messages);
    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });
    await ctx.reply(response.content);
  } catch (e) {
    console.log('Error while vioce message', e.message);
  }
});

bot.on(message('text'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  try {
    await ctx.reply(code('Message processing...'));

    ctx.session.messages.push({
      role: openai.roles.USER,
      content: ctx.message.text,
    });

    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });
    await ctx.reply(response.content);
  } catch (e) {
    console.log('Error while vioce message', e.message);
  }
});

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
