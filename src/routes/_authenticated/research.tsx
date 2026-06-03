import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Search, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { research } from "@/lib/ai-tools.functions";
import { PageHeader } from "@/components/page-header";
import { OutputPanel } from "@/components/output-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({ meta: [{ title: "AI Research Assistant · Productivity AI" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(research);
  const [output, setOutput] = useState("");
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("Overview");
  const [audience, setAudience] = useState("");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { topic, depth, audience } }),
    onSuccess: (res) => setOutput(res.text),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Generation failed"),
  });

  const run = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or question.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <PageHeader icon={Search} title="AI Research Assistant" description="Get structured briefs on any topic, with key points and next steps." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Research request</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic or question *</Label>
              <Textarea id="topic" placeholder="e.g. Pros and cons of a 4-day work week for a software team" value={topic} onChange={(e) => setTopic(e.target.value)} className="min-h-[100px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Depth</Label>
                <Select value={depth} onValueChange={setDepth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Quick answer", "Overview", "In-depth"].map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="audience">Audience (optional)</Label>
                <Input id="audience" placeholder="e.g. Executives" value={audience} onChange={(e) => setAudience(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" onClick={run} disabled={mutation.isPending}>
              <Wand2 className="h-4 w-4" />
              {mutation.isPending ? "Researching…" : "Generate brief"}
            </Button>
          </CardContent>
        </Card>
        <OutputPanel value={output} onChange={setOutput} loading={mutation.isPending} hasRun={mutation.isSuccess || output.length > 0} onRegenerate={run} emptyHint="Ask a question to get an objective, structured research brief." />
      </div>
    </div>
  );
}
