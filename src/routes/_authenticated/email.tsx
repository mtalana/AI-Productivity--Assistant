import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Mail, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { generateEmail } from "@/lib/ai-tools.functions";
import { PageHeader } from "@/components/page-header";
import { OutputPanel } from "@/components/output-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator · Productivity AI" }] }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [output, setOutput] = useState("");
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { recipient, purpose, keyPoints, tone, length } }),
    onSuccess: (res) => setOutput(res.text),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Generation failed"),
  });

  const run = () => {
    if (!purpose.trim()) {
      toast.error("Please describe the purpose of the email.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <PageHeader icon={Mail} title="Smart Email Generator" description="Draft clear, well-structured workplace emails in seconds." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Email details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="recipient">Recipient (optional)</Label>
              <Input id="recipient" placeholder="e.g. My manager, the client team" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purpose">Purpose *</Label>
              <Textarea id="purpose" placeholder="e.g. Request a deadline extension for the Q3 report" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="min-h-[80px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="points">Key points to include (optional)</Label>
              <Textarea id="points" placeholder="One per line: current progress, reason for delay, new proposed date" value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} className="min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Professional", "Friendly", "Formal", "Concise", "Persuasive", "Apologetic"].map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Short", "Medium", "Detailed"].map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" onClick={run} disabled={mutation.isPending}>
              <Wand2 className="h-4 w-4" />
              {mutation.isPending ? "Generating…" : "Generate email"}
            </Button>
          </CardContent>
        </Card>
        <OutputPanel value={output} onChange={setOutput} loading={mutation.isPending} hasRun={mutation.isSuccess || output.length > 0} onRegenerate={run} emptyHint="Describe your email and generate a polished draft you can edit." />
      </div>
    </div>
  );
}
