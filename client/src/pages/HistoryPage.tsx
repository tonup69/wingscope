import { useQuery } from "@tanstack/react-query";
import { Download, Clock, CheckCircle2, AlertCircle, Loader2, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { Analysis, PathwayPrediction } from "@shared/schema";

const PATHWAY_COLORS: Record<string, string> = {
  "Notch": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "Dpp": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Wnt": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "Hedgehog": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "EGFR": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  "Hippo": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  "JAK": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  "Insulin": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  "JNK": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "FGF": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
};

function getPathwayColor(pathway: string) {
  for (const [key, val] of Object.entries(PATHWAY_COLORS)) {
    if (pathway.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function HistoryPage() {
  const { data: analyses, isLoading } = useQuery<(Analysis & { predictions?: PathwayPrediction[] })[]>({
    queryKey: ["/api/analyses"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analyses");
      return res.json();
    },
    refetchInterval: (query) => {
      const data = query.state.data as any[];
      const hasProcessing = data?.some((a) => a.status === "processing" || a.status === "pending");
      return hasProcessing ? 2000 : false;
    },
  });

  const exportAll = () => window.open("/api/analyses/export/csv", "_blank");

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary mr-2" size={18} />
        <span className="text-sm text-muted-foreground">Loading history...</span>
      </div>
    );
  }

  const complete = analyses?.filter((a) => a.status === "complete") || [];
  const processing = analyses?.filter((a) => a.status === "processing" || a.status === "pending") || [];
  const errors = analyses?.filter((a) => a.status === "error") || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">Analysis History</h1>
          <p className="text-sm text-muted-foreground">
            {analyses?.length || 0} total analyses
          </p>
        </div>
        {complete.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={exportAll}
            className="gap-2 text-xs"
            data-testid="export-history-btn"
          >
            <Download size={12} /> Export All CSV
          </Button>
        )}
      </div>

      {analyses?.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FlaskConical size={36} className="text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No analyses yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Upload wing images on the Analyze page to get started</p>
        </div>
      )}

      {/* Stats row */}
      {(analyses?.length || 0) > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{complete.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{processing.length}</p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-red-700 dark:text-red-400">{errors.length}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table-like list */}
      <div className="space-y-2">
        {analyses?.map((analysis) => {
          const topPrediction = analysis.predictions?.[0];
          return (
            <Card key={analysis.id} className="hover:border-primary/30 transition-colors" data-testid={`history-item-${analysis.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-12 h-10 rounded overflow-hidden bg-muted shrink-0">
                    <img
                      src={analysis.imageDataUrl}
                      alt={analysis.filename}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">{analysis.filename}</p>
                      {analysis.status === "processing" || analysis.status === "pending" ? (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Loader2 size={9} className="animate-spin" /> Processing
                        </Badge>
                      ) : analysis.status === "complete" ? (
                        <Badge className="gap-1 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <CheckCircle2 size={9} /> Done
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <AlertCircle size={9} /> Error
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={9} /> {formatDate(analysis.createdAt)}
                      </span>
                      {analysis.batchId && (
                        <span className="text-xs text-muted-foreground">
                          Batch: {analysis.batchId.slice(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Top prediction */}
                  {topPrediction && (
                    <div className="text-right shrink-0">
                      <Badge className={`text-xs mb-1 ${getPathwayColor(topPrediction.pathway)}`}>
                        {topPrediction.pathway}
                      </Badge>
                      <p className="text-xs font-mono text-muted-foreground">{topPrediction.confidence}%</p>
                    </div>
                  )}

                  {/* Export */}
                  {analysis.status === "complete" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                      onClick={() => window.open(`/api/analyze/${analysis.id}/export`, "_blank")}
                      data-testid={`history-export-${analysis.id}`}
                    >
                      <Download size={12} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
