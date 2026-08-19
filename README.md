# Elchai Assessment — Client Brief → Proposal Draft (AI Monitoring Layer)

Pre-interview assessment for the **AI Agent & OpenClaw Research Intern** role at Elchai Group.

This is a small, real, working pipeline — not a mockup. A Node.js script drafts a business
proposal from a client brief using **Google Gemini (`gemini-3.6-flash`)**, traces every run
through **Langfuse**, scores the output against an automated checklist, and gates it behind a
`Pending Human Review` status before it could ever reach a client.

The goal wasn't just to call an LLM once and call it done — it was to actually run it, find
what breaks, fix it, and prove the fix with a second trace. Both real bugs found along the way
are documented below.

---

## How it works

1. A structured client brief (industry, scope, timeline, contact) is sent to Gemini with a
   drafting prompt.
2. The output is scored against an automated checklist: does it have a problem statement,
   defined scope, a timeline, a budget/pricing section, and a plausible (non-hallucinated) date?
3. Every run — input, output, and checklist result — is logged as a Langfuse trace with a
   pass/fail score.
4. Nothing auto-sends. Every run sits at `Pending Human Review` until a human approves it.



## What I actually found while testing

**Bug 1 — the AI hallucinated a date.**
Run 1 used a basic prompt with no date instruction. Across identical runs, Gemini was
inconsistent: one run confidently wrote `"Date: October 24, 2023"` — three years in the past —
while another used a safe `[Date]` placeholder. The wrong date is a classic, well-documented
LLM failure mode, and it's exactly the kind of thing a monitoring layer needs to catch before a
proposal reaches a client.
*Fix:* the prompt was updated to explicitly require the real current date (2026) and reject
placeholders or past years. A hard automated check (`hasCurrentDate`) was added to the
checklist so this is caught automatically, not just by a human skimming the text.

**Bug 2 — my own evaluation logic was wrong, not the AI.**
The first version of the checklist only matched the literal words "problem", "challenge", or
"need" to detect a problem statement — so it flagged a perfectly good proposal as *failing*
just because Gemini had written an "Executive Summary" section instead. This is worth calling
out on its own: a badly written evaluation rule can produce false failures that look like the
AI is at fault when it actually isn't. The regex was broadened to also match "executive
summary", "background", "current state", and "overview".

## Evidence — live Langfuse traces

| Run | What changed | Result | Trace |
|---|---|---|---|
| `run-1-initial` | Basic prompt, no date instruction | ❌ Hallucinated date (2023) | [View trace](https://cloud.langfuse.com/project/cmszoprro01u9ad0ce9hf46rv/traces/64425a33-a1fb-4420-a488-3000d7b26dfe?observation=cef8bef1-53fd-4075-86fc-5c64d98b59c0) |
| `run-1-initial` (rerun) | Same prompt, different sample | ⚠️ Safe placeholder, not hallucinated | [View trace](https://cloud.langfuse.com/project/cmszoprro01u9ad0ce9hf46rv/traces/e9e01566-5d78-4277-8aaf-a97ccff46dcb?observation=e4bbbf4b-b6d5-4ecd-b5e5-ef892ca6d5a1) |
| `run-2-fixed` | Prompt fixed + `hasCurrentDate` check added | ✅ Correct date (2026), passed all 5 checks | [View trace](https://cloud.langfuse.com/project/cmszoprro01u9ad0ce9hf46rv/traces/58b6a63d-5b81-4bba-93a6-6b10994ced60?observation=4e99cad3-577c-466f-b209-6e3949c519a3) |

Full assessment write-up (tool comparison, risks, safety controls, final recommendation) is in
the PDF submitted alongside this repo.

## Tech used

- **Google Gemini** (`gemini-3.6-flash`) — drafting model
- **Langfuse** — self-hostable LLM observability/tracing, used here on the free cloud tier
- **Node.js** — orchestration script + automated checklist evaluator

## Known limitations

- No access to Elchai's actual OpenClaw system or internal proposal templates — the brief,
  template, and checklist criteria here are my own, built to demonstrate the method.
- Langfuse observes and scores; it does not itself block a bad output from being sent. The
  human-review gate has to be enforced outside the tool, not by the tool itself.

---

## Running it yourself

### 1. Install Node.js
Need version 18+. Check with `node -v`. If missing: https://nodejs.org

### 2. Clone and configure
```bash
git clone https://github.com/abdullashahbaz/elchai-assessment.git
cd elchai-assessment
cp .env.example .env
```
Open `.env` and add your own keys (never commit this file):
- `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` — from Langfuse → Settings → API Keys
- `GEMINI_API_KEY` — from Google AI Studio

### 3. Install dependencies
```bash
npm install
```

### 4. Run
```bash
node run.mjs
```
This runs both the basic and fixed prompts back-to-back and logs both as traces in your own
Langfuse project.
