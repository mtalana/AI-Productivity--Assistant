import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { AiDisclaimer } from "@/components/ai-disclaimer";

const transport = new DefaultChatTransport({
  api: "/api/chat",
  prepareSendMessagesRequest: async ({ api, messages, body }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return {
      api,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { ...body, messages },
    };
  },
});

function textOf(message: UIMessage): string {
  return (message.parts ?? []).map((p) => (p.type === "text" ? p.text : "")).join("");
}

export function ChatWindow({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages: UIMessage[];
}) {
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "The assistant could not respond."),
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const isBusy = status === "submitted" || status === "streaming";

  const focusInput = () => {
    containerRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus();
  };

  useEffect(() => {
    focusInput();
  }, [threadId]);

  useEffect(() => {
    if (!isBusy) focusInput();
  }, [isBusy]);

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text || isBusy) return;
    sendMessage({ text }, { body: { conversationId: threadId } });
  };

  return (
    <div ref={containerRef} className="flex h-full min-h-0 flex-col">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="h-6 w-6" />}
              title="Start the conversation"
              description="Ask anything — drafting, planning, summarizing, or quick questions."
            />
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.role === "assistant" ? (
                    <MessageResponse>{textOf(message)}</MessageResponse>
                  ) : (
                    <span className="whitespace-pre-wrap">{textOf(message)}</span>
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="space-y-2 border-t bg-background p-3">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea placeholder="Message the assistant…" disabled={isBusy} />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={isBusy} />
          </PromptInputFooter>
        </PromptInput>
        <AiDisclaimer />
      </div>
    </div>
  );
}
