import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "@/lib/ai-gateway.server";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured. Missing API key.");
  return createLovableAiGatewayProvider(key)(DEFAULT_MODEL);
}

async function run(system: string, prompt: string) {
  const { text } = await generateText({ model: getModel(), system, prompt });
  return { text };
}

const EmailInput = z.object({
  recipient: z.string().max(200).optional().default(""),
  purpose: z.string().min(1).max(2000),
  keyPoints: z.string().max(4000).optional().default(""),
  tone: z.string().max(40).optional().default("Professional"),
  length: z.string().max(40).optional().default("Medium"),
});

export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const system =
      "You are an expert business communication assistant. Write clear, well-structured workplace emails. Return only the email (subject line + body) in markdown. Do not add commentary.";
    const prompt = [
      `Recipient: ${data.recipient || "(unspecified)"}`,
      `Purpose: ${data.purpose}`,
      `Key points to include: ${data.keyPoints || "(none specified)"}`,
      `Tone: ${data.tone}`,
      `Length: ${data.length}`,
      "",
      "Write the email now. Start with a 'Subject:' line.",
    ].join("\n");
    return run(system, prompt);
  });

const NotesInput = z.object({
  notes: z.string().min(1).max(20000),
  format: z.string().max(40).optional().default("Structured summary"),
});

export const summarizeNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => NotesInput.parse(input))
  .handler(async ({ data }) => {
    const system =
      "You are a meeting notes assistant. Summarize raw meeting notes into clear markdown with sections: ## Summary, ## Key Decisions, ## Action Items (with owners if mentioned), and ## Follow-ups. Be concise and faithful to the source.";
    const prompt = `Preferred format: ${data.format}\n\nRaw meeting notes:\n${data.notes}`;
    return run(system, prompt);
  });

const PlannerInput = z.object({
  goal: z.string().min(1).max(2000),
  timeframe: z.string().max(60).optional().default(""),
  context: z.string().max(4000).optional().default(""),
});

export const planTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }) => {
    const system =
      "You are a productivity planning assistant. Break a goal into an actionable plan in markdown: a short ## Overview, then ## Task Breakdown as a checklist grouped into phases with priorities and time estimates, and a ## Suggested Schedule if a timeframe is given.";
    const prompt = [
      `Goal: ${data.goal}`,
      `Timeframe: ${data.timeframe || "(flexible)"}`,
      `Additional context: ${data.context || "(none)"}`,
    ].join("\n");
    return run(system, prompt);
  });

const ResearchInput = z.object({
  topic: z.string().min(1).max(2000),
  depth: z.string().max(40).optional().default("Overview"),
  audience: z.string().max(200).optional().default(""),
});

export const research = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const system =
      "You are a research assistant for professionals. Produce a structured markdown brief with: ## Overview, ## Key Points, ## Considerations / Trade-offs, and ## Suggested Next Steps. Be objective and note where information is uncertain or requires verification.";
    const prompt = [
      `Topic / Question: ${data.topic}`,
      `Depth: ${data.depth}`,
      `Intended audience: ${data.audience || "(general professional)"}`,
    ].join("\n");
    return run(system, prompt);
  });
