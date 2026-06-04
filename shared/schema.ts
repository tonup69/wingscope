import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Analyses table - stores each wing image analysis
export const analyses = sqliteTable("analyses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  filename: text("filename").notNull(),
  imageDataUrl: text("image_data_url").notNull(), // base64 data URL
  status: text("status").notNull().default("pending"), // pending | processing | complete | error
  errorMessage: text("error_message"),
  // Results stored as JSON text
  predictionsJson: text("predictions_json"), // JSON array of pathway predictions with scores
  morphologyJson: text("morphology_json"),   // JSON object with observed morphological features
  summaryText: text("summary_text"),         // human-readable summary
  createdAt: integer("created_at").notNull().default(0),
  batchId: text("batch_id"),                 // groups analyses from a batch upload
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

// Types for predictions
export type GeneCandidate = {
  gene: string;
  full_name: string;
  allele_type: string;
  likelihood: "High" | "Medium" | "Low";
  rationale: string;
};

export type PathwayPrediction = {
  pathway: string;
  confidence: number; // 0-100
  rank: number;
  key_features: string[];
  description: string;
  severity_score: number;   // 1-5
  severity_label: string;   // e.g. "Mild"
  severity_rationale: string;
  gene_candidates: GeneCandidate[];
};

export type MorphologyFeatures = {
  vein_pattern: string;
  margin_condition: string;
  wing_size: string;
  wing_shape: string;
  other_observations: string[];
};
