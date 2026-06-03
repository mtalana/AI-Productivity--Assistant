import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { UIMessage } from "ai";
import { getMessages } from "@/lib/conversations.functions";
import { ChatWindow } from "@/components/chat/chat-window";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThreadPage,
});

function ChatThreadPage() {
  const { threadId } = Route.useParams();
  const fn = useServerFn(getMessages);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => fn({ data: { conversationId: threadId } }),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading conversation…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        This conversation could not be found.
      </div>
    );
  }

  return (
    <ChatWindow key={threadId} threadId={threadId} initialMessages={data.messages as UIMessage[]} />
  );
}
