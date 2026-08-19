# Elchai Assessment — Setup & Run

## 1. Install Node.js (if you don't have it)
Check first: `node -v` in your terminal. Need version 18+.
If missing: download from https://nodejs.org

## 2. Get these files onto your computer
Download the whole `elchai-assessment` folder I've shared, or copy the 3 files
(`package.json`, `run.mjs`, `.env.example`) into a new folder on your machine.

## 3. Set up your keys (never share this file or paste it in chat)
In the folder, run:
```
cp .env.example .env
```
Open `.env` in any text editor and paste in your real values:
- `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` — from Langfuse Settings → API Keys
- `GEMINI_API_KEY` — from Google AI Studio / console

## 4. Install dependencies
In the folder, run:
```
npm install
```

## 5. Run it
```
node run.mjs
```
This will:
- Send the client brief to Gemini using a basic prompt (Run 1) — this will likely
  fail the budget checklist, simulating a real failure.
- Automatically fix the prompt to require a pricing section, and run again (Run 2) —
  this should pass the checklist.
- Log both runs as traces in Langfuse, with a pass/fail score on each.

## 6. Capture your evidence
Go to your Langfuse dashboard → Traces. You should see two traces:
`run-1-initial` and `run-2-fixed`. Open each one, screenshot the input/output and
the score, and send them to me. I'll drop the real screenshots into the assessment
PDF in place of the simulated example.

## If something errors
Copy the exact error message here (not your key values) and I'll help you fix it.
