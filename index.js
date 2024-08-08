require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const token = process.env.TG_TOKEN;
const webAppUrl = process.env.WEB_APP_URL || "https://zenko.online/";
const port = process.env.PORT || 3000;

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
          ],
          [
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

// // TOKEN
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

// // CLEAR
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

// // CALLBACKS

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

app.post("/send-notification", async (req, res) => {
  const { chatId, coverImg, name, titleId, chapterId } = req.body;

  if (!chatId || !coverImg || !name || !titleId || !chapterId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const preview = `https://zenko.b-cdn.net/${coverImg}?optimizer=image&width=360&quality=80`;
  const linkToOpen = `${webAppUrl}titles/${titleId}/${chapterId}`;
  console.log("linkToOpen", linkToOpen);

  try {
    await bot.sendPhoto(chatId, preview, {
      caption: `Новий розділ "${name}" вже доступний!`,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Читати в телеґрамі",
              web_app: { url: linkToOpen },
            },
          ],
          [
            {
              text: "Читати на сайті",
              url: webAppUrl,
            },
          ],
        ],
      },
    });
    res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
