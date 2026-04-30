import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend running with Groq AI");
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI travel assistant for Maharashtra tourism. Give clear, friendly, simple answers. Suggest itineraries, places, travel tips, and cultural facts related to Maharashtra only.",
        },
        { role: "user", content: userMessage },
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.json({ reply: "AI response failed." });
  }
});

app.post("/api/season-explanation", async (req, res) => {
  const { season } = req.body;

  try {
    const prompt = `
You are a travel expert for Maharashtra, India.
Explain why the following travel types are recommended or avoided in ${season}.
Keep it simple, friendly, and helpful for tourists.
Include safety and weather reasoning.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6
    });

    res.json({
      explanation: completion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      explanation: "AI service is currently unavailable. Please try again later."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
