import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, Loader2, CheckCircle2, AlertCircle, Download, Plus, FlaskConical, ChevronDown, ChevronUp, Dna } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SeverityBadge } from "@/components/SeverityBadge";
import type { Analysis, PathwayPrediction, MorphologyFeatures } from "@shared/schema";

const PATHWAY_COLORS: Record<string, string> = {
  "Notch":          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "Dpp":            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Wnt":            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "Wingless":       "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "Hedgehog":       "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "EGFR":           "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  "Hippo":          "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  "JAK":            "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  "Insulin":        "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  "JNK":            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "FGF":            "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  "PCP":            "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  "Integrin":       "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  "Myc":            "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  "TNF":            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "Eiger":          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "Fat":            "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
};

function getPathwayColor(pathway: string) {
  for (const [key, val] of Object.entries(PATHWAY_COLORS)) {
    if (pathway.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
}

const LIKELIHOOD_COLORS = {
  High:   "text-emerald-600 dark:text-emerald-400 font-semibold",
  Medium: "text-amber-600 dark:text-amber-400",
  Low:    "text-muted-foreground",
};

const ALLELE_LABELS: Record<string, string> = {
  LOF:              "loss-of-function",
  GOF:              "gain-of-function",
  dominant:         "dominant",
  hypomorph:        "hypomorph",
  haploinsufficient:"haploinsufficient",
};

function ConfidenceBar({ confidence }: { confidence: number }) {
  const color = confidence >= 70 ? "bg-primary" : confidence >= 40 ? "bg-amber-500" : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${color}`} style={{ width: `${confidence}%` }} />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-10 text-right">{confidence}%</span>
    </div>
  );
}

function GeneCandidatesList({ candidates }: { candidates: PathwayPrediction["gene_candidates"] }) {
  if (!candidates?.length) return null;
  return (
    <div className="space-y-1.5">
      {candidates.map((g, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <Dna size={11} className="mt-0.5 shrink-0 text-primary/60" />
          <div className="flex-1 min-w-0">
            <span className={`font-mono italic ${LIKELIHOOD_COLORS[g.likelihood] || ""}`}>{g.gene}</span>
            <span className="text-muted-foreground"> ({ALLELE_LABELS[g.allele_type] || g.allele_type})</span>
            <span className={`ml-1.5 text-xs px-1 py-0 rounded border ${
              g.likelihood === "High"   ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400" :
              g.likelihood === "Medium" ? "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400" :
                                          "border-border text-muted-foreground"
            }`}>{g.likelihood}</span>
            <p className="text-muted-foreground mt-0.5 leading-relaxed">{g.rationale}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalysisResult({ analysisId }: { analysisId: number }) {
  const [expanded, setExpanded] = useState(false);

  const { data: analysis } = useQuery<Analysis & { predictions?: PathwayPrediction[]; morphology?: MorphologyFeatures }>({
    queryKey: ["/api/analyze", analysisId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/analyze/${analysisId}`);
      return res.json();
    },
    refetchInterval: (query) => {
      const d = query.state.data as any;
      return d?.status === "processing" || d?.status === "pending" ? 1500 : false;
    },
  });

  if (!analysis) return (
    <Card className="w-full">
      <CardContent className="p-6 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary mr-2" size={16} />
        <span className="text-sm text-muted-foreground">Loading…</span>
      </CardContent>
    </Card>
  );

  const top = analysis.predictions?.[0];

  return (
    <Card className="w-full" data-testid={`result-card-${analysisId}`}>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base font-semibold">{analysis.filename}</CardTitle>
            {analysis.status === "processing" || analysis.status === "pending" ? (
              <Badge variant="secondary" className="gap-1"><Loader2 size={10} className="animate-spin" /> Analyzing…</Badge>
            ) : analysis.status === "complete" ? (
              <Badge className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle2 size={10} /> Complete
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1"><AlertCircle size={10} /> Error</Badge>
            )}
          </div>
          {analysis.status === "complete" && (
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/analyze/${analysisId}/export`, "_blank")}
              className="shrink-0 h-7 text-xs gap-1" data-testid={`export-btn-${analysisId}`}>
              <Download size={11} /> CSV
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Processing */}
      {(analysis.status === "processing" || analysis.status === "pending") && (
        <CardContent className="pb-4">
          <AnalysisProgress />
        </CardContent>
      )}

      {/* Error */}
      {analysis.status === "error" && (
        <CardContent className="pb-4">
          <p className="text-sm text-destructive">{analysis.errorMessage || "Analysis failed"}</p>
        </CardContent>
      )}

      {/* Complete */}
      {analysis.status === "complete" && analysis.predictions && (
        <CardContent className="pb-4 space-y-4">

          {/* Image + top result summary */}
          <div className="flex gap-4">
            <div className="wing-image-container w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
              <img src={analysis.imageDataUrl} alt={analysis.filename}
                className="w-full h-full object-contain" data-testid={`wing-image-${analysisId}`} />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              {top && (
                <>
                  <p className="text-xs text-muted-foreground">Top prediction</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-sm font-semibold px-3 py-1 ${getPathwayColor(top.pathway)}`}>
                      {top.pathway}
                    </Badge>
                    <span className="text-sm font-mono font-medium text-primary">{top.confidence}%</span>
                    {top.severity_score && (
                      <SeverityBadge score={top.severity_score} label={top.severity_label} />
                    )}
                  </div>
                  {/* Top gene candidates inline */}
                  {top.gene_candidates?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-xs text-muted-foreground">Candidate genes:</span>
                      {top.gene_candidates.slice(0, 3).map((g, i) => (
                        <span key={i} className={`text-xs font-mono italic px-1.5 py-0.5 rounded bg-muted ${LIKELIHOOD_COLORS[g.likelihood] || ""}`}>
                          {g.gene}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2">{top.description}</p>
                </>
              )}
            </div>
          </div>

          {/* All predictions ranked list */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">All predictions</p>
            {analysis.predictions.map((p, i) => (
              <div key={i} className="border border-border rounded-lg p-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4 shrink-0">{p.rank}.</span>
                    <Badge variant="outline" className={`text-xs ${getPathwayColor(p.pathway)}`}>{p.pathway}</Badge>
                    {p.severity_score && <SeverityBadge score={p.severity_score} label={p.severity_label} />}
                  </div>
                  {/* Gene chips */}
                  <div className="flex flex-wrap gap-1">
                    {p.gene_candidates?.slice(0, 2).map((g, j) => (
                      <span key={j} className={`text-xs font-mono italic px-1.5 py-0 rounded bg-muted/70 ${LIKELIHOOD_COLORS[g.likelihood] || ""}`}>
                        {g.gene}
                      </span>
                    ))}
                  </div>
                </div>
                <ConfidenceBar confidence={p.confidence} />
              </div>
            ))}
          </div>

          {/* Expand toggle */}
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            data-testid={`expand-details-${analysisId}`}>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Hide" : "Show"} full gene details & morphology
          </button>

          {expanded && (
            <div className="space-y-4 pt-1">

              {/* Per-pathway expanded gene detail */}
              {analysis.predictions.map((p, i) => (
                <div key={i} className="rounded-lg border border-border overflow-hidden">
                  <div className={`flex items-center gap-2 px-3 py-2 ${getPathwayColor(p.pathway)} border-b border-border/50`}>
                    <Badge className={`text-xs ${getPathwayColor(p.pathway)}`}>{p.pathway}</Badge>
                    <span className="text-xs font-mono">{p.confidence}% confidence</span>
                    {p.severity_score && <SeverityBadge score={p.severity_score} label={p.severity_label} />}
                  </div>
                  <div className="p-3 space-y-3 bg-background">
                    {/* Severity rationale */}
                    {p.severity_rationale && (
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-0.5">Severity rationale</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{p.severity_rationale}</p>
                      </div>
                    )}
                    {/* Key features */}
                    {p.key_features?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.key_features.map((f, j) => (
                          <span key={j} className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">{f}</span>
                        ))}
                      </div>
                    )}
                    {/* Gene candidates */}
                    {p.gene_candidates?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1.5">Candidate genes</p>
                        <GeneCandidatesList candidates={p.gene_candidates} />
                      </div>
                    )}
                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">{p.description}</p>
                  </div>
                </div>
              ))}

              {/* Morphology */}
              {analysis.morphology && (
                <div className="bg-muted/40 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-foreground">Observed Morphology</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {[
                      ["Vein pattern", analysis.morphology.vein_pattern],
                      ["Margin", analysis.morphology.margin_condition],
                      ["Wing size", analysis.morphology.wing_size?.replace(/_/g, " ")],
                      ["Shape", analysis.morphology.wing_shape?.replace(/_/g, " ")],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <span className="text-muted-foreground">{label}: </span>
                        <span className="capitalize">{val}</span>
                      </div>
                    ))}
                  </div>
                  {analysis.morphology.other_observations?.length > 0 && (
                    <p className="text-xs mt-1">
                      <span className="text-muted-foreground">Notes: </span>
                      {analysis.morphology.other_observations.join("; ")}
                    </p>
                  )}
                </div>
              )}

              {/* Summary */}
              {analysis.summaryText && (
                <div className="bg-accent/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">Analysis Summary</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{analysis.summaryText}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

const STAGES = [
  { label: "Loading image…",                 pct: 8,  duration: 800  },
  { label: "Inspecting wing margin…",         pct: 25, duration: 3000 },
  { label: "Mapping vein architecture…",      pct: 45, duration: 3000 },
  { label: "Assessing severity…",             pct: 62, duration: 2500 },
  { label: "Classifying signaling pathway…",  pct: 78, duration: 3000 },
  { label: "Ranking gene candidates…",        pct: 90, duration: 2000 },
  { label: "Finalizing results…",             pct: 97, duration: 1500 },
];

function AnalysisProgress() {
  const [stageIdx, setStageIdx] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    // Animate to first stage immediately
    const timer = setTimeout(() => setPct(STAGES[0].pct), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (stageIdx >= STAGES.length - 1) return;
    const t = setTimeout(() => {
      const next = stageIdx + 1;
      setStageIdx(next);
      setPct(STAGES[next].pct);
    }, STAGES[stageIdx].duration);
    return () => clearTimeout(t);
  }, [stageIdx]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={14} className="animate-spin text-primary shrink-0" />
        <span className="transition-all duration-500">{STAGES[stageIdx].label}</span>
      </div>
      <Progress value={pct} className="h-1.5 transition-all duration-700" />
      <div className="flex justify-between text-xs text-muted-foreground/60">
        <span>Step {Math.min(stageIdx + 1, STAGES.length)} of {STAGES.length}</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const [dragOver, setDragOver] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [analysisIds, setAnalysisIds] = useState<number[]>([]);
  const [tab, setTab] = useState<"single" | "batch">("single");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (files.length > 1) {
        const formData = new FormData();
        files.forEach((f) => formData.append("images", f));
        const res = await apiRequest("POST", "/api/analyze/batch", formData);
        const data = await res.json();
        return data.analyses.map((a: any) => a.id) as number[];
      } else {
        const formData = new FormData();
        formData.append("image", files[0]);
        const res = await apiRequest("POST", "/api/analyze", formData);
        const data = await res.json();
        return [data.id as number];
      }
    },
    onSuccess: (ids) => {
      setAnalysisIds((prev) => [...ids, ...prev]);
      setPendingFiles([]);
      qc.invalidateQueries({ queryKey: ["/api/analyses"] });
      toast({ title: `Analysis started for ${ids.length} image${ids.length > 1 ? "s" : ""}` });
    },
    onError: (err: any) => {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    },
  });

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) { toast({ title: "Please upload image files only", variant: "destructive" }); return; }
    setPendingFiles((prev) => [...prev, ...valid]);
    if (valid.length > 1) setTab("batch");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground mb-1">Wing Pathway Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Upload Drosophila wing images to identify disrupted pathways, severity (1–5), and candidate genes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Upload */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="single" className="flex-1 text-xs" data-testid="tab-single">Single Image</TabsTrigger>
              <TabsTrigger value="batch" className="flex-1 text-xs" data-testid="tab-batch">Batch Upload</TabsTrigger>
            </TabsList>
            {["single", "batch"].map((t) => (
              <TabsContent key={t} value={t} className="mt-3">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    dragOver ? "border-primary bg-accent/30" : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid={`upload-zone-${t}`}
                >
                  {t === "single" ? <Upload className="mx-auto mb-3 text-muted-foreground" size={28} /> : <Plus className="mx-auto mb-3 text-muted-foreground" size={28} />}
                  <p className="text-sm font-medium text-foreground mb-1">
                    {t === "single" ? "Drop wing image here" : "Drop multiple wing images"}
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, TIFF — up to 20MB{t === "batch" ? " · up to 20 images" : ""}</p>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <input ref={fileInputRef} type="file" accept="image/*" multiple={tab === "batch"}
            className="hidden" onChange={(e) => handleFiles(e.target.files)} data-testid="file-input" />

          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{pendingFiles.length} image{pendingFiles.length > 1 ? "s" : ""} queued</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {pendingFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <div className="w-8 h-8 rounded overflow-hidden shrink-0 bg-muted">
                      <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-foreground flex-1 truncate">{f.name}</span>
                    <button onClick={() => setPendingFiles((p) => p.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive transition-colors" data-testid={`remove-file-${i}`}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <Button onClick={() => analyzeMutation.mutate(pendingFiles)} disabled={analyzeMutation.isPending}
                className="w-full gap-2" data-testid="analyze-btn">
                {analyzeMutation.isPending
                  ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                  : <><FlaskConical size={14} /> Analyze {pendingFiles.length > 1 ? `${pendingFiles.length} Images` : "Image"}</>}
              </Button>
            </div>
          )}

          {analysisIds.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => window.open("/api/analyses/export/csv", "_blank")}
              className="w-full gap-2 text-xs" data-testid="export-all-btn">
              <Download size={12} /> Export All Results (CSV)
            </Button>
          )}

          <Card className="bg-accent/20 border-accent/40">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-foreground mb-2">What you get</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Pathway prediction with confidence %</li>
                <li>Severity score (1–5 scale)</li>
                <li>Candidate genes ranked by likelihood</li>
                <li>Full morphology description</li>
                <li>CSV export</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-3 space-y-4">
          {analysisIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FlaskConical size={36} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Upload a wing image to begin analysis</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Returns pathway, severity (1–5), and candidate genes</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">{analysisIds.length} Result{analysisIds.length > 1 ? "s" : ""}</h2>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1"
                  onClick={() => window.open("/api/analyses/export/csv", "_blank")}>
                  <Download size={11} /> Export all
                </Button>
              </div>
              {analysisIds.map((id) => <AnalysisResult key={id} analysisId={id} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
