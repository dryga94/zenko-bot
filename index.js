const TelegramBot = require("node-telegram-bot-api");

const token = "7497564513:AAGsCBU9FqyEt7V2wmKFIAwctLqva99jaSE";
const webAppUrl = "https://zenko.online/";
const API_URL = "https://zenko-api.onrender.com/";

// COMMANDS
// /start - Відкрити сайт
// /token - Отримати токен
// /clear - Очистити чат

const bot = new TelegramBot(token, { polling: true });


// START
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const param = match[1];

  if (param.includes("webapp")) {
    const second = param.split("-").slice(1).join("/");
    const linkToOpen = second ? `${webAppUrl}${second}` : webAppUrl;
    const data = await fetch(`${API_URL}${second}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { name, coverImg } = await data.json();
    const preview = `https://zenko.b-cdn.net/${coverImg}?optimizer=image&width=360&quality=80`;
    bot.sendPhoto(chatId, preview, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `До тайтлу ${name}`,
              web_app: { url: linkToOpen },
            },
          ],
        ],
      },
    });
  } else {
    // Handle other parameters or default start message
    bot.sendMessage(chatId, "Welcome! Use /webapp to launch the web app.");
  }
});

bot.onText(/\/start$/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `Вас вітає Зенко Онлайн у телеґрамі... Тицьніть кнопку нижче, або скористайтесь однією з команд`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Перейти до сайту`,
              web_app: { url: `${webAppUrl}` },
            },
            {
              text: `Отримувати сповіщення про нові розділи`,
              callback_data: "show_pre_token",
            },
          ],
        ],
      },
    }
  );
});

// TOKEN
bot.onText(/\/token/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `Токен необхідний для того, щоб ви могли отримувати сповіщення про вихід нових розділів прямо у телеґрамі. Скопіюйте його та вставте у налаштуваннях профілю!`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Отримати токен`,
              callback_data: "show_token",
            },
          ],
        ],
      },
    }
  );
});

// CLEAR
bot.onText(/\/clear/, (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  async function clearChat(chatId, messageId) {
    try {
      for (let i = messageId; i >= 1; i--) {
        await bot.deleteMessage(chatId, i);
      }
      console.log("Chat cleared successfully");
    } catch (error) {
      console.error("Error clearing chat:", error.message);
    }
  }
  clearChat(chatId, messageId);
});


// CALLBACKS

bot.on("callback_query", async (query) => {
  if (query.data === "show_pre_token") {
    await bot.answerCallbackQuery(query.id);
    await bot.sendMessage(
      query.message.chat.id,
      `Токен необхідний для того, щоб ви могли отримувати сповіщення про вихід нових розділів прямо у телеґрамі. Скопіюйте його та вставте у налаштуваннях профілю!`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `Отримати токен`,
                callback_data: "show_token",
              },
            ],
          ],
        },
      }
    );
  }
  if (query.data === "show_token") {
    await bot.answerCallbackQuery(query.id);
    await bot.sendMessage(
      query.message.chat.id,
      `Ваш токен: ${query.message.chat.id}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `Перейти до профілю`,
                web_app: { url: `${webAppUrl}user?activeTab=SETTINGS` },
              },
            ],
          ],
        },
      }
    );
  }
});
