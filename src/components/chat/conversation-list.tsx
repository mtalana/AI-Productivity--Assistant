import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  listConversations,
  createConversation,
  deleteConversation,
} from "@/lib/conversations.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConversationList({ onSelect }: { onSelect?: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const list = useServerFn(listConversations);
  const create = useServerFn(createConversation);
  const remove = useServerFn(deleteConversation);

  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => list(),
  });

  const createMutation = useMutation({
    mutationFn: () => create({ data: {} }),
    onSuccess: (row) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onSelect?.();
      navigate({ to: "/chat/$threadId", params: { threadId: row.id } });
    },
    onError: () => toast.error("Couldn't create a new chat"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: (_r, id) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (id === activeId) navigate({ to: "/chat" });
    },
    onError: () => toast.error("Couldn't delete chat"),
  });

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>
      <div className="flex-1 overflow-auto px-2 pb-3">
        {isLoading ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">Loading…</p>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">No conversations yet.</p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((c) => (
              <li
                key={c.id}
                className={cn(
                  "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                  activeId === c.id && "bg-accent text-accent-foreground",
                )}
              >
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: c.id }}
                  onClick={onSelect}
                  className="flex min-w-0 flex-1 items-center gap-2"
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{c.title}</span>
                </Link>
                <button
                  type="button"
                  aria-label="Delete chat"
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  onClick={() => deleteMutation.mutate(c.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
