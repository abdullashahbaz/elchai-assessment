import "dotenv/config";
import { Langfuse } from "langfuse";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ---- setup ----
const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_HOST || "https://cloud.langfuse.com",
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

const BRIEF = `Client: regional logistics firm.
Needs a route-optimization dashboard.
Timeline: 3 months.
Contact: operations director.`;

// Checklist: what a valid proposal MUST contain
function runChecklist(output) {
  const text = output.toLowerCase();
    const checks = {
    hasProblemStatement: /problem|challenge|need|executive summary|background|current state|overview/.test(text),
    hasScope: /scope|deliverable/.test(text),
    hasTimeline: /timeline|month|week|phase/.test(text),
    hasBudget: /budget|pricing|cost|\$|aed/.test(text),
    hasCurrentDate: !/202[0-5]\b/.test(text),
  };
  const passed = Object.values(checks).every(Boolean);
  return { checks, passed };
}

async function draftProposal(promptText, runLabel) {
  const trace = langfuse.trace({
    name: "client-brief-to-proposal",
    metadata: { run: runLabel },
    input: promptText,
  });

  const generation = trace.generation({
    name: "gemini-draft",
    model: "gemini-3.6-flash",
    input: promptText,
  });

  const result = await model.generateContent(promptText);
  const output = result.response.text();

  generation.end({ output });

  const { checks, passed } = runChecklist(output);

  trace.update({
    output,
    metadata: { run: runLabel, checklist: checks, checklistPassed: passed },
  });

  // This is the "Pending Human Review" gate - nothing auto-sends
  const score = trace.score({
    name: "checklist-passed",
    value: passed ? 1 : 0,
    comment: passed
      ? "All required fields present - Pending Human Review -> ready for reviewer sign-off"
      : "Missing required field(s) - Pending Human Review -> rejected, returned for revision",
  });

  console.log(`\n=== Run: ${runLabel} ===`);
  console.log("Checklist:", checks);
  console.log("Passed:", passed);
  console.log("Status: Pending Human Review ->", passed ? "Approved" : "Rejected");
  console.log("Output preview:", output.slice(0, 300), "...\n");

  return { output, checks, passed };
}

async function main() {
  // Run 1: basic prompt, likely to fail the budget check
  const promptV1 = `Draft a professional business proposal based on this client brief:\n\n${BRIEF}`;
  await draftProposal(promptV1, "run-1-initial");

  // Run 2: fixed prompt, explicitly requires a budget/pricing section
  const promptV2 = `Draft a professional business proposal based on this client brief:\n\n${BRIEF}\n\nThe proposal MUST include a clearly labeled Pricing / Budget section with an estimated cost range. Use today's actual date (2026), not a placeholder or past year — do not write an incorrect or outdated date.`;
  await draftProposal(promptV2, "run-2-fixed");

  await langfuse.flushAsync();
  console.log("Done. Check your Langfuse dashboard -> Traces to see both runs.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
