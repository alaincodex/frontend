const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const cors = require("cors")({ origin: true });
const { Configuration, OpenAIApi } = require("openai");

// 🔐 Securely store your API key here (do NOT expose in frontend)
const configuration = new Configuration({
  apiKey: "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", // <--- paste new key here
});
const openai = new OpenAIApi(configuration);

exports.generateFlashcards = onRequest((req, res) => {
  cors(req, res, async () => {
    const { text } = req.body;

    if (!text) {
      return res.status(400).send("No input text provided");
    }

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates educational flashcards.",
          },
          {
            role: "user",
            content: `Generate 5 flashcards (question and answer pairs) from this text:\n\n${text}`,
          },
        ],
      });

      const output = completion.data.choices[0].message.content;
      res.status(200).send({ flashcards: output });
    } catch (err) {
      logger.error("OpenAI error:", err);
      res.status(500).send("Failed to generate flashcards");
    }
  });
});
