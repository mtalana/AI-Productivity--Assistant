import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { AiDisclaimer } from "@/components/ai-disclaimer";

type OutputPanelProps = {
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  hasRun: boolean;
  onRegenerate?: () => void;
  emptyHint?: string;
};

export function OutputPanel({
  value,
  onChange,
  loading,
  hasRun,
  onRegenerate,
  emptyHint = "Fill in the form and generate to see results here.",
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Result</CardTitle>
        <div className="flex items-center gap-2">
          {onRegenerate && hasRun && !loading && (
            <Button variant="ghost" size="sm" onClick={onRegenerate}>
              <RotateCcw className="h-4 w-4" />
              Regenerate
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={copy} disabled={!value}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {loading ? (
          <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-lg border border-dashed">
            <Shimmer className="text-sm">Generating with AI…</Shimmer>
          </div>
        ) : !hasRun ? (
          <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
            <Sparkles className="h-6 w-6 opacity-50" />
            <p className="max-w-xs">{emptyHint}</p>
          </div>
        ) : (
          <Tabs defaultValue="edit" className="flex flex-1 flex-col">
            <TabsList className="self-start">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-3 flex-1">
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-full min-h-[320px] resize-none font-mono text-sm"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-3 flex-1">
              <div className="markdown-body min-h-[320px] max-w-none space-y-2 rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
                <ReactMarkdown>{value || "_Nothing to preview._"}</ReactMarkdown>
              </div>
            </TabsContent>
          </Tabs>
        )}
        <AiDisclaimer />
      </CardContent>
    </Card>
  );
}
