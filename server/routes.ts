import type { Express } from "express";
import { Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { PATHWAY_KNOWLEDGE, REFERENCE_IMAGES } from "./pathway-knowledge";
import { GENE_KNOWLEDGE_PROMPT } from "./gene-knowledge";
import Anthropic from "@anthropic-ai/sdk";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

async function analyzeWingImage(imageBase64: string, mimeType: string): Promise<{
  morphology: any;
  predictions: any[];
  summary: string;
}> {
  const client = new Anthropic();

  // Step 1: Crop the anterior margin region (top 40% of image, left 85% width) at 2x zoom
  // This forces the model to inspect the margin closely in a dedicated pass
  const imageBuffer = Buffer.from(imageBase64, "base64");
  const metadata = await sharp(imageBuffer).metadata();
  const w = metadata.width || 800;
  const h = metadata.height || 600;

  const marginCropBuffer = await sharp(imageBuffer)
    .extract({
      left: Math.floor(w * 0.1),
      top: 0,
      width: Math.floor(w * 0.75),
      height: Math.floor(h * 0.45),
    })
    .resize({ width: Math.floor(w * 0.75 * 2) }) // 2x zoom
    .jpeg({ quality: 95 })
    .toBuffer();
  const marginCropB64 = marginCropBuffer.toString("base64");

  // Step 1: Focused margin inspection
  const describeResponse = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are examining a Drosophila melanogaster wing image for research purposes. Ignore ALL text, labels, gene names visible in the image — do not let them influence your visual assessment.

I will show you TWO images:
1. The full wing
2. A 2x magnified crop of the anterior (top/leading) margin region

Your job is to produce a PRECISE, QUANTITATIVE morphological description. Do NOT soften, minimize, or hedge your findings. Report what you see.

For EACH image, carefully trace the ENTIRE margin edge and report:
- Is the margin a perfectly smooth curve? (If yes, you must double-check before confirming)
- COUNT every notch, V-cut, U-cut, indentation, fraying, or break in the contour
- For each notch: what position (proximal/mid/distal), how deep (estimate as % of wing width), what shape (V vs U vs irregular)
- Is the anterior margin affected? The posterior margin? Both?
- Are there missing bristles along the margin?

Then describe:
- Overall wing shape: is it a normal smooth elongated oval? Or distorted, crumpled, twisted, asymmetric, or folded?
- Wing posture: flat, curled, drooping?
- Wing size: normal, enlarged, or reduced?
- Vein pattern: are all 5 longitudinal veins (L1-L5) present? Are cross veins present? Any ectopic veins, vein thickening, or vein gaps?

SEVERITY ASSESSMENT OBLIGATION: At the end of your description, you MUST explicitly state:
"SEVERITY ASSESSMENT: This wing shows [mild/moderate/severe/very severe] defects because [list the specific features]. Multiple notches, obvious shape distortion, or widespread margin damage = moderate or higher. Do NOT understate severity."

Be precise and quantitative. Do not dismiss visible irregularities. A wing with obvious notches or gross distortion must be reported as such.`,
          },
          {
            type: "text",
            text: "Image 1: Full wing:",
          },
          {
            type: "image",
            source: { type: "base64", media_type: mimeType as any, data: imageBase64 },
          },
          {
            type: "text",
            text: "Image 2: 2x magnified anterior margin crop:",
          },
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: marginCropB64 },
          },
        ],
      },
    ],
  });

  const morphDescription = describeResponse.content[0].type === "text" ? describeResponse.content[0].text : "";

  // Step 2: Classify using the description + both images
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: PATHWAY_KNOWLEDGE + GENE_KNOWLEDGE_PROMPT + `\n\nA careful morphological inspection of this wing produced the following description — treat it as GROUND TRUTH. You must not contradict it or soften its findings:\n\n${morphDescription}\n\nIMPORTANT: The morphological description above includes an explicit SEVERITY ASSESSMENT. You MUST honor it when assigning severity scores. If the description reports multiple notches, shape distortion, crumpling, or widespread defects, the severity score MUST be 3 or higher. If the description says severe, assign 4 or 5. Do NOT downgrade the severity score below what the morphological evidence supports.\n\nNow classify the pathway(s) disrupted, assign severity scores, and identify gene candidates. Return ONLY the JSON object as specified above.`,
          },
          {
            type: "image",
            source: { type: "base64", media_type: mimeType as any, data: imageBase64 },
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  // Parse the JSON response — with truncation recovery
  let parsed;
  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    const raw = jsonMatch ? jsonMatch[0] : content.text;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // Response was truncated — repair by closing all open brackets
      let repaired = raw;
      // Count unclosed braces and brackets
      let braces = 0, brackets = 0;
      let inString = false, escape = false;
      for (const ch of repaired) {
        if (escape) { escape = false; continue; }
        if (ch === '\\' && inString) { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') braces++;
        else if (ch === '}') braces--;
        else if (ch === '[') brackets++;
        else if (ch === ']') brackets--;
      }
      // Trim trailing incomplete key/value (cut at last complete comma or colon-less value)
      repaired = repaired.replace(/,?\s*"[^"]*"?\s*:?\s*[^,\}\]]*$/, '');
      // Close any open string
      if (inString) repaired += '"';
      // Close open arrays and objects
      repaired += ']'.repeat(Math.max(0, brackets));
      repaired += '}'.repeat(Math.max(0, braces));
      try {
        parsed = JSON.parse(repaired);
      } catch (e2) {
        // Last resort: return a minimal valid response
        parsed = {
          predictions: [{ pathway: "Unknown", confidence: 0, reasoning: "Response truncated — please retry" }],
          severity_score: 1,
          severity_label: "Unknown",
          severity_rationale: "Response truncated — please retry the analysis",
          gene_candidates: [],
          morphology: { vein_pattern: "Parse error", margin: "Parse error", size_shape: "Parse error", surface: "Parse error", overall_impression: "Response was truncated. Please retry." }
        };
      }
    }
  } catch (e) {
    parsed = {
      predictions: [{ pathway: "Unknown", confidence: 0, reasoning: "Response error — please retry" }],
      severity_score: 1,
      severity_label: "Unknown",
      severity_rationale: "Please retry the analysis",
      gene_candidates: [],
      morphology: { vein_pattern: "Error", margin: "Error", size_shape: "Error", surface: "Error", overall_impression: "Please retry." }
    };
  }

  return parsed;
}

export async function registerRoutes(httpServer: Server, app: Express) {
  // Debug endpoint: describe margin of an uploaded image
  app.post("/api/describe-margin", upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image" });
    const client = new Anthropic();
    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 3000,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Examine this Drosophila wing image carefully. Focus on the anterior (top/leading) edge of the wing. Describe in precise detail: Is the margin a smooth continuous curve, or are there any notches, cuts, indentations, or breaks in the contour? Report the exact location (proximal, mid, distal) and shape (V-cut, U-cut, irregular) of any margin irregularities you can see. Do not dismiss any irregularities as artifacts." },
          { type: "image", source: { type: "base64", media_type: mimeType as any, data: imageBase64 } },
        ]
      }]
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    res.json({ description: text });
  });

  // Upload and analyze a single wing image
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image file provided" });

    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    const batchId = (req.body.batchId as string) || undefined;

    // Create the analysis record
    const analysis = storage.createAnalysis({
      filename: req.file.originalname,
      imageDataUrl: dataUrl,
      status: "processing",
      batchId,
    });

    // Run analysis asynchronously
    analyzeWingImage(imageBase64, mimeType)
      .then((result) => {
        storage.updateAnalysis(analysis.id, {
          status: "complete",
          predictionsJson: JSON.stringify(result.predictions),
          morphologyJson: JSON.stringify(result.morphology),
          summaryText: result.summary,
        });
      })
      .catch((err) => {
        storage.updateAnalysis(analysis.id, {
          status: "error",
          errorMessage: err.message,
        });
      });

    res.json({ id: analysis.id, status: "processing" });
  });

  // Batch upload - multiple images
  app.post("/api/analyze/batch", upload.array("images", 20), async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ error: "No images provided" });

    const batchId = uuidv4();
    const results: { id: number; filename: string }[] = [];

    for (const file of files) {
      const imageBase64 = file.buffer.toString("base64");
      const mimeType = file.mimetype;
      const dataUrl = `data:${mimeType};base64,${imageBase64}`;

      const analysis = storage.createAnalysis({
        filename: file.originalname,
        imageDataUrl: dataUrl,
        status: "processing",
        batchId,
      });

      results.push({ id: analysis.id, filename: file.originalname });

      // Run each analysis
      analyzeWingImage(imageBase64, mimeType)
        .then((result) => {
          storage.updateAnalysis(analysis.id, {
            status: "complete",
            predictionsJson: JSON.stringify(result.predictions),
            morphologyJson: JSON.stringify(result.morphology),
            summaryText: result.summary,
          });
        })
        .catch((err) => {
          storage.updateAnalysis(analysis.id, {
            status: "error",
            errorMessage: err.message,
          });
        });
    }

    res.json({ batchId, analyses: results });
  });

  // Get analysis status/result
  app.get("/api/analyze/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const analysis = storage.getAnalysis(id);
    if (!analysis) return res.status(404).json({ error: "Analysis not found" });

    const result: any = { ...analysis };
    if (analysis.predictionsJson) result.predictions = JSON.parse(analysis.predictionsJson);
    if (analysis.morphologyJson) result.morphology = JSON.parse(analysis.morphologyJson);

    res.json(result);
  });

  // Get all analyses
  app.get("/api/analyses", (_req, res) => {
    const all = storage.getAllAnalyses().map((a) => {
      const result: any = { ...a };
      if (a.predictionsJson) result.predictions = JSON.parse(a.predictionsJson);
      if (a.morphologyJson) result.morphology = JSON.parse(a.morphologyJson);
      return result;
    });
    res.json(all);
  });

  // Get reference images for pathways
  app.get("/api/references", (_req, res) => {
    res.json(REFERENCE_IMAGES);
  });

  // Export single analysis as CSV data
  app.get("/api/analyze/:id/export", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const analysis = storage.getAnalysis(id);
    if (!analysis || analysis.status !== "complete") {
      return res.status(404).json({ error: "Analysis not found or not complete" });
    }

    const predictions = JSON.parse(analysis.predictionsJson || "[]");

    const rows = [
      ["Filename", "Pathway", "Confidence (%)", "Rank", "Severity Score", "Severity Label", "Severity Rationale", "Candidate Genes (High)", "Candidate Genes (Medium)", "Key Features", "Description"],
      ...predictions.map((p: any) => [
        analysis.filename,
        p.pathway,
        p.confidence,
        p.rank,
        p.severity_score || "",
        p.severity_label || "",
        p.severity_rationale || "",
        (p.gene_candidates || []).filter((g: any) => g.likelihood === "High").map((g: any) => g.gene).join("; "),
        (p.gene_candidates || []).filter((g: any) => g.likelihood === "Medium").map((g: any) => g.gene).join("; "),
        (p.key_features || []).join("; "),
        p.description,
      ]),
    ];

    const csv = rows.map((r) => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="wing-analysis-${id}.csv"`);
    res.send(csv);
  });

  // Export all analyses as CSV
  app.get("/api/analyses/export/csv", (_req, res) => {
    const all = storage.getAllAnalyses().filter((a) => a.status === "complete");

    const rows = [["ID", "Filename", "Date", "Top Pathway", "Confidence (%)", "Summary"]];
    for (const a of all) {
      const predictions = JSON.parse(a.predictionsJson || "[]");
      const top = predictions[0] || {};
      rows.push([
        String(a.id),
        a.filename,
        new Date(a.createdAt * 1000).toISOString(),
        top.pathway || "Unknown",
        String(top.confidence || 0),
        (a.summaryText || "").replace(/\n/g, " "),
      ]);
    }

    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="all-wing-analyses.csv"');
    res.send(csv);
  });
}
