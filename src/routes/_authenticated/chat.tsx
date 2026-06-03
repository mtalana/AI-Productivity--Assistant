import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { ConversationList } from "@/components/chat/conversation-list";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "AI Chatbot · Productivity AI" }] }),
  component: ChatLayout,
});

function ChatLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-[calc(100dvh-3.5rem)]">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:block">
        <ConversationList />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b p-2 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
                Conversations
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <ConversationList onSelect={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
        <div className="min-h-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
