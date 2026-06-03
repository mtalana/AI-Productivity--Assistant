import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { FileText, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { summarizeNotes } from "@/lib/ai-tools.functions";
import { PageHeader } from "@/components/page-header";
import { OutputPanel } from "@/components/output-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer · Productivity AI" }] }),
  component: NotesPage,
});

function NotesPage() {
  const fn = useServerFn(summarizeNotes);
  const [output, setOutput] = useState("");
  const [notes, setNotes] = useState("");
  const [format, setFormat] = useState("Structured summary");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { notes, format } }),
    onSuccess: (res) => setOutput(res.text),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Generation failed"),
  });

  const run = () => {
    if (!notes.trim()) {
      toast.error("Please paste your meeting notes.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <PageHeader icon={FileText} title="Meeting Notes Summarizer" description="Turn messy notes into clear summaries, decisions, and action items." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Raw notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="notes">Paste meeting notes or transcript *</Label>
              <Textarea id="notes" placeholder="Paste your raw notes, bullet points, or transcript here…" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[280px]" />
            </div>
            <div className="space-y-1.5">
              <Label>Output format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Structured summary", "Bullet highlights", "Action items only", "Executive brief"].map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={run} disabled={mutation.isPending}>
              <Wand2 className="h-4 w-4" />
              {mutation.isPending ? "Summarizing…" : "Summarize notes"}
            </Button>
          </CardContent>
        </Card>
        <OutputPanel value={output} onChange={setOutput} loading={mutation.isPending} hasRun={mutation.isSuccess || output.length > 0} onRegenerate={run} emptyHint="Paste notes and get a clean summary with decisions and action items." />
      </div>
    </div>
  );
}
