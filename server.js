const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

app.get("/", (req, res) => {
  res.send("Сервер Рядом AI работает 💜");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Сообщение пустое"
      });
    }

    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({
        error: "DEEPSEEK_API_KEY не настроен на сервере"
      });
    }

    const messages = [
      {
        role: "system",
        content:
          "Ты — Рядом AI, доброжелательный виртуальный помощник для подросткового проекта «Рядом». Отвечай спокойно, дружелюбно и понятно. Поддерживай пользователя, не осуждай его и не выдавай себя за человека. Если пользователь сообщает о непосредственной опасности для себя или другого человека, советуй обратиться к взрослому, которому он доверяет, или в местные экстренные службы."
      },
      ...history.slice(-10),
      {
        role: "user",
        content: message.trim()
      }
    ];

    const response = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          temperature: 0.7,
          max_tokens: 800
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("DeepSeek error:", data);

      return res.status(response.status).json({
        error: "DeepSeek временно не отвечает"
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content ||
      "Я пока не смог придумать ответ 😔";

    res.json({
      answer
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Ошибка сервера"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Рядом AI запущен на порту ${PORT}`);
});