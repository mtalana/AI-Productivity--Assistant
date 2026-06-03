import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ListChecks, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { planTasks } from "@/lib/ai-tools.functions";
import { PageHeader } from "@/components/page-header";
import { OutputPanel } from "@/components/output-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({ meta: [{ title: "AI Task Planner · Productivity AI" }] }),
  component: PlannerPage,
});

function PlannerPage() {
  const fn = useServerFn(planTasks);
  const [output, setOutput] = useState("");
  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [context, setContext] = useState("");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { goal, timeframe, context } }),
    onSuccess: (res) => setOutput(res.text),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Generation failed"),
  });

  const run = () => {
    if (!goal.trim()) {
      toast.error("Please describe your goal or project.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <PageHeader icon={ListChecks} title="AI Task Planner" description="Break goals into an actionable, prioritized plan with time estimates." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Plan details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="goal">Goal or project *</Label>
              <Textarea id="goal" placeholder="e.g. Launch a company newsletter" value={goal} onChange={(e) => setGoal(e.target.value)} className="min-h-[80px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timeframe">Timeframe (optional)</Label>
              <Input id="timeframe" placeholder="e.g. Next 2 weeks" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="context">Context & constraints (optional)</Label>
              <Textarea id="context" placeholder="e.g. Team of 3, limited budget, must reuse existing tools" value={context} onChange={(e) => setContext(e.target.value)} className="min-h-[100px]" />
            </div>
            <Button className="w-full" onClick={run} disabled={mutation.isPending}>
              <Wand2 className="h-4 w-4" />
              {mutation.isPending ? "Planning…" : "Generate plan"}
            </Button>
          </CardContent>
        </Card>
        <OutputPanel value={output} onChange={setOutput} loading={mutation.isPending} hasRun={mutation.isSuccess || output.length > 0} onRegenerate={run} emptyHint="Describe a goal to get a phased, prioritized task plan." />
      </div>
    </div>
  );
}
