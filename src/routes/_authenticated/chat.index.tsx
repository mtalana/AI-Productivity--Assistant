import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listConversations, createConversation } from "@/lib/conversations.functions";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const list = useServerFn(listConversations);
  const create = useServerFn(createConversation);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => list(),
  });

  const createMutation = useMutation({
    mutationFn: () => create({ data: {} }),
    onSuccess: (row) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      navigate({ to: "/chat/$threadId", params: { threadId: row.id }, replace: true });
    },
  });

  useEffect(() => {
    if (isLoading || !conversations) return;
    if (conversations.length > 0) {
      navigate({
        to: "/chat/$threadId",
        params: { threadId: conversations[0].id },
        replace: true,
      });
    } else if (!createMutation.isPending && !createMutation.isSuccess) {
      createMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, conversations]);

  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading your conversations…
    </div>
  );
}
