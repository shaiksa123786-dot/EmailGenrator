# Dispatch — AI Email Generator

Dispatch is a lightweight, self-contained web app that generates ready-to-send emails from a short description of what you want to say. Enter the purpose, pick a tone and length, and Dispatch drafts a full subject line and email body for you.

Built with a single Node.js file — no separate frontend build, no database, no framework overhead.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- **Purpose-driven generation** — describe what the email is for in plain language
- **Tone control** — Professional, Friendly, Formal, Direct, Persuasive, Apologetic
- **Adjustable length** — short, medium, or fully detailed
- **Optional context fields** — recipient name, sender name, extra details to weave in
- **One-click copy** — copy the finished subject + body straight to your clipboard
- **Regenerate** — don't like the draft? Generate a new one instantly
- **Single-file app** — the whole frontend (HTML/CSS/JS) is served directly from `server.js`, so there's nothing else to build or deploy
- **API key stays server-side** — the browser never talks to the AI provider directly, so your key is never exposed

---

## 🖥️ Tech Stack

| Layer      | Tech                                  |
|------------|----------------------------------------|
| Backend    | Node.js + Express                      |
| Frontend   | Vanilla HTML/CSS/JS (served inline)    |
| AI Provider| [Groq](https://console.groq.com) (Llama 3.3 70B) — free, no credit card required |
| Fonts      | Special Elite, IBM Plex Mono, Inter (Google Fonts) |

---

## 📦 Prerequisites

- [Node.js](https://nodejs.org) v18 or later installed
- A free [Groq API key](https://console.groq.com) (sign up → API Keys → Create API Key — no card needed)

---

## 🚀 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/dispatch-email-generator.git
   cd dispatch-email-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment variables**

   Create a `.env` file in the project root:
   ```
   GROQ_API_KEY=your-groq-key-here
   PORT=3000
   ```

4. **Run the app**
   ```bash
   node server.js
   ```
   You should see:
   ```
   Dispatch is running -> open http://localhost:3000 in your browser
   ```

5. **Open it in your browser**

   Go to [http://localhost:3000](http://localhost:3000) and start generating emails.

---

DEMO :


https://github.com/user-attachments/assets/3c5ae92c-2445-4167-a973-1d075676bc93




## 📁 Project Structure

```
dispatch-email-generator/
├── server.js         # Express server + embedded frontend (HTML/CSS/JS)
├── .env              # Your API key and port (not committed — see .gitignore)
├── package.json
├── package-lock.json
└── README.md
```

---

## 🔑 Environment Variables

| Variable        | Required | Description                                  |
|------------------|----------|-----------------------------------------------|
| `GROQ_API_KEY`   | Yes      | Your free Groq API key                        |
| `PORT`           | No       | Port to run the server on (defaults to `3000`)|

⚠️ Never commit your `.env` file. Make sure it's listed in `.gitignore`.

---

## 🛠️ How It Works

1. The frontend sends your purpose, tone, length, and any extra context to `/api/generate-email` on your own server.
2. The server forwards that as a prompt to Groq's chat completions API, using your `GROQ_API_KEY` (kept server-side only).
3. The model returns a JSON object with a `subject` and `body`.
4. The frontend renders it as a styled letter, with a copy button for the final text.

```
Browser (Dispatch UI)  →  Your Express server  →  Groq API
     (no key here)           (key lives here)
```

---

## 🧩 Switching AI Providers

Dispatch's backend calls an OpenAI-compatible chat completions endpoint, so it's easy to swap providers:

- **Groq** (default, free): `https://api.groq.com/openai/v1/chat/completions`
- **OpenAI** (paid, requires billing): `https://api.openai.com/v1/chat/completions`
- **Google Gemini**, **Cerebras**, **OpenRouter**, and other OpenAI-compatible free tiers also work with minor changes to the request body

Just update the `fetch` URL, `Authorization` header, and `model` name in `server.js`.

---

## 📄 License

MIT — free to use, modify, and share.

---

## 🙋 Troubleshooting

**`Error: Cannot find module 'express'`**
Run `npm install` in the same folder as `server.js`.

**Server starts but generation fails**
Double-check your `GROQ_API_KEY` in `.env` — no quotes, no extra spaces around the `=`.

**Port already in use**
Change `PORT=3000` to another number (e.g. `PORT=3001`) in `.env`, then restart the server.
