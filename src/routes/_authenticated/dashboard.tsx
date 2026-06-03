import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, Search, MessageSquare, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · AI Workplace Productivity Assistant" }] }),
  component: DashboardPage,
});

const tools = [
  { title: "Smart Email Generator", description: "Draft professional emails from a quick brief.", icon: Mail, url: "/email" },
  { title: "Meeting Notes Summarizer", description: "Turn raw notes into summaries and action items.", icon: FileText, url: "/notes" },
  { title: "AI Task Planner", description: "Break goals into a prioritized, actionable plan.", icon: ListChecks, url: "/planner" },
  { title: "AI Research Assistant", description: "Get structured briefs on any workplace topic.", icon: Search, url: "/research" },
  { title: "AI Chatbot", description: "Chat through any task with a productivity assistant.", icon: MessageSquare, url: "/chat" },
] as const;

function DashboardPage() {
  const { user } = useAuth();
  const name = user?.email?.split("@")[0] ?? "there";

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-6">
      <section className="overflow-hidden rounded-2xl bg-[image:var(--gradient-primary)] p-6 text-primary-foreground shadow-[var(--shadow-elegant)] md:p-8">
        <div className="flex items-center gap-4">
          <img src={logo} alt="" width={48} height={48} className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {name}</h1>
            <p className="text-sm text-primary-foreground/80">
              Automate your workplace tasks with AI — pick a tool to get started.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.url} to={tool.url} className="group">
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-3 flex items-center justify-between text-base">
                    {tool.title}
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <AiDisclaimer />
    </div>
  );
}
