const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3000;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
    console.error("❌ Не найден DEEPSEEK_API_KEY");
    console.error("Добавь API-ключ в переменные окружения.");
    process.exit(1);
}

const deepseek = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: DEEPSEEK_API_KEY
});


/*
   Проверка сервера
*/

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        project: "Рядом AI",
        message: "Сервер работает 💜"
    });
});


/*
   Чат с Рядом AI
*/

app.post("/api/chat", async (req, res) => {

    try {

        const message = req.body.message;

        if (!message || typeof message !== "string") {

            return res.status(400).json({
                error: "Сообщение не найдено."
            });

        }

        const cleanMessage = message.trim();

        if (!cleanMessage) {

            return res.status(400).json({
                error: "Сообщение пустое."
            });

        }

        /*
           Ограничиваем размер сообщения,
           чтобы никто не отправлял огромные запросы.
        */

        const userMessage = cleanMessage.slice(0, 5000);


        const completion =
            await deepseek.chat.completions.create({

                model: "deepseek-v4-flash",

                messages: [

                    {
                        role: "system",

                        content: `
Ты — «Рядом AI».

Ты являешься частью проекта «Рядом» —
спокойного пространства поддержки для подростков.

Твоя задача — разговаривать спокойно,
бережно и без осуждения.

Правила:

1. Не ставь диагнозы.

2. Не выдавай себя за врача или психолога.

3. Не утверждай, что можешь заменить
профессиональную помощь.

4. Не заставляй человека рассказывать
то, чем он не хочет делиться.

5. Отвечай простым русским языком.

6. Не перегружай человека огромными
списками советов.

7. Если человеку тревожно —
можешь предложить простое дыхательное
упражнение или маленький шаг.

8. Если человеку грустно —
сначала выслушай его, а не пытайся
сразу «исправить» его состояние.

9. Не используй фразы вроде
«возьми себя в руки».

10. Не осуждай.

11. Не романтизируй самоповреждение,
суицид или смерть.

12. Никогда не давай инструкции,
способы или советы о том,
как причинить себе вред.

Если пользователь сообщает,
что хочет причинить себе вред,
покончить с собой или находится
в непосредственной опасности:

- спокойно признай, что ситуация серьёзная;
- попроси не оставаться одному;
- предложи обратиться к человеку,
  которому пользователь доверяет;
- предложи перейти туда, где находятся люди;
- при непосредственной опасности
  посоветуй обратиться в местную
  экстренную службу;
- не оставляй пользователя
  с ощущением, что он должен справиться
  с этим самостоятельно.

Не спорь с человеком и не обвиняй его.

Пример хорошего ответа:

«Мне очень жаль, что тебе сейчас настолько
тяжело. Давай не будем пытаться решить
всё сразу. Сейчас главное — чтобы ты
не оставался один. Есть кто-нибудь рядом,
кому ты можешь сказать: "Мне сейчас
нужна помощь, побудь со мной"?»

Пиши тепло, но не притворяйся человеком.
Ты AI-помощник проекта «Рядом».
                        `
                    },

                    {
                        role: "user",
                        content: userMessage
                    }

                ],

                stream: false
            });


        const answer =
            completion?.choices?.[0]?.message?.content;


        if (!answer) {

            return res.status(500).json({
                error: "AI не вернул ответ."
            });

        }


        res.json({
            success: true,
            reply: answer
        });


    } catch (error) {

        console.error("DeepSeek error:", error);

        res.status(500).json({
            success: false,
            error: "Не удалось получить ответ от AI."
        });

    }

});


/*
   Запуск
*/

app.listen(PORT, () => {

    console.log("");
    console.log("🌙 РЯДОМ AI");
    console.log("------------------------");
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🤖 DeepSeek подключён`);
    console.log(`💜 http://localhost:${PORT}`);
    console.log("");

});