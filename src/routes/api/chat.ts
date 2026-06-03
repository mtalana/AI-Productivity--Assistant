import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "@/lib/ai-gateway.server";

type ChatBody = { messages?: unknown; conversationId?: unknown };

const SYSTEM_PROMPT =
  "You are the AI Workplace Productivity Assistant, a helpful, professional assistant for working professionals. " +
  "Help with drafting communication, planning, summarizing, research, and general workplace questions. " +
  "Be concise, well-structured, and use markdown when helpful. " +
  "If a request needs information you cannot verify, say so and suggest how the user can confirm it.";

function textOf(message: UIMessage): string {
  return (message.parts ?? [])
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        const messages = body.messages;
        const conversationId = typeof body.conversationId === "string" ? body.conversationId : null;

        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        if (!conversationId) {
          return new Response("conversationId is required", { status: 400 });
        }

        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
          return new Response("Unauthorized", { status: 401 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const supabase = createClient(
          process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL,
          process.env.SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          {
            global: { headers: { Authorization: authHeader } },
            auth: { persistSession: false, autoRefreshToken: false },
          },
        );

        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData.user) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = userData.user.id;

        const { data: convo } = await supabase
          .from("conversations")
          .select("id, title")
          .eq("id", conversationId)
          .maybeSingle();
        if (!convo) {
          return new Response("Conversation not found", { status: 404 });
        }

        const uiMessages = messages as UIMessage[];
        const lastUser = [...uiMessages].reverse().find((m) => m.role === "user");

        if (lastUser) {
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            user_id: userId,
            role: "user",
            parts: lastUser.parts ?? [],
            ai_message_id: lastUser.id ?? null,
          });

          if (convo.title === "New conversation") {
            const title = textOf(lastUser).slice(0, 60) || "New conversation";
            await supabase.from("conversations").update({ title }).eq("id", conversationId);
          }
        }

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway(DEFAULT_MODEL),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(uiMessages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: uiMessages,
          onFinish: async ({ responseMessage }) => {
            await supabase.from("messages").insert({
              conversation_id: conversationId,
              user_id: userId,
              role: "assistant",
              parts: responseMessage.parts ?? [],
              ai_message_id: responseMessage.id ?? null,
            });
            await supabase
              .from("conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", conversationId);
          },
        });
      },
    },
  },
});
