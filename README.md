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
the score. I have attached my commits as you can see below 
https://cloud.langfuse.com/project/cmszoprro01u9ad0ce9hf46rv/traces/e9e01566-5d78-4277-8aaf-a97ccff46dcb?observation=e4bbbf4b-b6d5-4ecd-b5e5-ef892ca6d5a1 which is the gemini draft run 1
https://cloud.langfuse.com/project/cmszoprro01u9ad0ce9hf46rv/traces/58b6a63d-5b81-4bba-93a6-6b10994ced60?observation=4e99cad3-577c-466f-b209-6e3949c519a3 which is gemini draft run 2 with a date.

Below are the initial errors i was facing 
https://cloud.langfuse.com/project/cmszoprro01u9ad0ce9hf46rv/traces/64425a33-a1fb-4420-a488-3000d7b26dfe?observation=cef8bef1-53fd-4075-86fc-5c64d98b59c0
