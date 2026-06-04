import { useState } from "react";
import { Microscope, ZoomIn, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import wingNotch from "@assets/wings/wing_notch.png";
import wingDpp from "@assets/wings/wing_dpp.png";
import wingWnt from "@assets/wings/wing_wnt.png";
import wingHh from "@assets/wings/wing_hh.png";
import wingEgfr from "@assets/wings/wing_egfr.png";
import wingHippo from "@assets/wings/wing_hippo.png";
import wingJnk from "@assets/wings/wing_jnk.png";
import wingIntegrin from "@assets/wings/wing_integrin.png";
import wingFgf from "@assets/wings/wing_fgf.png";
import wingPcp from "@assets/wings/wing_pcp.png";
import wingInsulin from "@assets/wings/wing_insulin.png";
import wingJakstat from "@assets/wings/wing_jakstat.png";
import wingMyc from "@assets/wings/wing_myc.png";
import wingTnf from "@assets/wings/wing_tnf.png";
import wingFatds from "@assets/wings/wing_fatds.png";

const PATHWAYS = [
  {
    name: "Notch",
    abbrev: null,
    color: "border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-900/10",
    headerColor: "bg-purple-600",
    image: wingNotch,
    genotype: "N[55e11] / + (haploinsufficient)",
    phenotype: "Discrete V-shaped notches cut into anterior wing margin; local bristle loss; veins otherwise normal",
    genes: ["Notch", "Delta", "Serrate", "Su(H)", "neuralized", "Numb"],
    description: "Controls cell fate at the wing margin via Notch receptor and Delta/Serrate ligands. Loss causes classic wing notching at the anterior margin tip.",
  },
  {
    name: "Dpp/BMP",
    abbrev: "Decapentaplegic / BMP",
    color: "border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10",
    headerColor: "bg-blue-600",
    image: wingDpp,
    genotype: "dpp[d6] / dpp[d14] (hypomorphic trans-het)",
    phenotype: "Posterior wing compartment reduced; L3–L4 interval compressed; cross-veins lost",
    genes: ["dpp", "tkv", "put", "Mad", "Medea", "sax"],
    description: "Drosophila BMP/TGF-β homolog acting as an A-P morphogen to specify vein positions and control wing size.",
  },
  {
    name: "Wnt/Wingless",
    abbrev: "Wingless / Wnt",
    color: "border-green-200 dark:border-green-900/40 bg-green-50/50 dark:bg-green-900/10",
    headerColor: "bg-green-600",
    image: wingWnt,
    genotype: "nub-Gal4 > UAS-wg-RNAi or wg[CX3] / +",
    phenotype: "Entire margin scalloped with shallow U-shaped indentations; sensory bristles absent along margin",
    genes: ["wg", "fz", "dsh", "arm", "TCF", "arr"],
    description: "Wingless (Wg) is the Drosophila Wnt homolog, required for wing margin identity. Loss causes a distinctive all-margin scalloping phenotype.",
  },
  {
    name: "Hedgehog",
    abbrev: null,
    color: "border-yellow-200 dark:border-yellow-900/40 bg-yellow-50/50 dark:bg-yellow-900/10",
    headerColor: "bg-amber-500",
    image: wingHh,
    genotype: "ptc-Gal4 / UAS-Ras[V12] (Hh pathway GOF in anterior cells)",
    phenotype: "Ectopic vein segment between L3 and L4; L3–L4 interval broadened; anterior crossvein shifted",
    genes: ["hh", "ptc", "smo", "ci", "cos2", "fu"],
    description: "Produced by posterior cells, Hh diffuses anteriorly to specify L3–L4 vein identity at the A/P boundary via Cubitus interruptus.",
  },
  {
    name: "EGFR/Ras",
    abbrev: "EGFR / Ras / MAPK",
    color: "border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-900/10",
    headerColor: "bg-red-600",
    image: wingEgfr,
    genotype: "765-Gal4 > UAS-Ras[V12] (constitutively active Ras throughout wing)",
    phenotype: "Extensive ectopic veins throughout wing blade; thickened longitudinal veins; intervein regions invaded by vein material",
    genes: ["Egfr", "ras85D", "raf", "rolled", "pnt", "aos"],
    description: "EGFR/RAS/MAPK signaling promotes vein cell fate. Overactivation causes extensive extra veins filling the intervein regions.",
  },
  {
    name: "Hippo/Yorkie",
    abbrev: "Hippo / Warts / Yorkie",
    color: "border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-900/10",
    headerColor: "bg-pink-600",
    image: wingHippo,
    genotype: "nub-Gal4 > UAS-fat-RNAi (upstream Hippo tumor suppressor KD)",
    phenotype: "Wing blade enlarged ~30% with tissue folds; rounder shape; veins present but slightly disorganized",
    genes: ["hpo", "wts", "yki", "sd", "fat", "ex", "mer"],
    description: "Tumor suppressor pathway controlling organ size via Yorkie. Loss causes dramatic wing overgrowth with tissue folding.",
  },
  {
    name: "JNK",
    abbrev: "JNK / Basket",
    color: "border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10",
    headerColor: "bg-orange-600",
    image: wingJnk,
    genotype: "en-Gal4 > UAS-hep[CA] (constitutively active JNKK in posterior compartment)",
    phenotype: "Posterior wing tissue loss; L5 truncated; ragged posterior margin; anterior compartment intact",
    genes: ["bsk", "hep", "puc", "kay", "jra", "Tak1"],
    description: "JNK (Basket) mediates apoptosis and stress responses. Hyperactivation in the posterior compartment causes tissue ablation and margin defects.",
  },
  {
    name: "Integrin",
    abbrev: null,
    color: "border-lime-200 dark:border-lime-900/40 bg-lime-50/50 dark:bg-lime-900/10",
    headerColor: "bg-green-700",
    image: wingIntegrin,
    genotype: "MS1096-Gal4 > UAS-mys-RNAi (βPS-integrin / myospheroid KD)",
    phenotype: "Large fluid-filled blister in wing blade from dorsal–ventral epithelial delamination; venation outside blister normal",
    genes: ["mys", "if", "rhea", "stck", "ILK", "zormin"],
    description: "Integrin-mediated D-V adhesion holds the two wing epithelia together. Loss causes the two layers to separate, forming a characteristic fluid-filled blister.",
  },
  {
    name: "FGF",
    abbrev: "FGF / Fibroblast Growth Factor",
    color: "border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-900/10",
    headerColor: "bg-fuchsia-600",
    image: wingFgf,
    genotype: "btl-Gal4 > UAS-btl[DN] (dominant-negative Breathless FGFR)",
    phenotype: "Mild proportional size reduction; vein pattern and margin intact; primary role is tracheal/air-sac development in wing disc",
    genes: ["btl", "htl", "ths", "pyr", "dof", "stumps"],
    description: "FGF signaling (Breathless/Heartless receptors) is required primarily for tracheal and air-sac migration in the wing disc, with mild adult wing size effects.",
  },
  {
    name: "PCP/Frizzled",
    abbrev: "Planar Cell Polarity",
    color: "border-violet-200 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-900/10",
    headerColor: "bg-indigo-600",
    image: wingPcp,
    genotype: "pk[pk30] (prickle LOF homozygous)",
    phenotype: "Wing hairs (trichomes) misoriented in swirling domains; some cells with multiple hairs; vein pattern and size normal",
    genes: ["fz", "pk", "stan", "ds", "fat", "Vang", "dsh"],
    description: "Planar Cell Polarity pathway coordinates the orientation of wing trichomes. Loss causes diagnostic swirling whorl patterns across the wing surface.",
  },
  {
    name: "Insulin/PI3K/TOR",
    abbrev: "Insulin / PI3K / TOR",
    color: "border-teal-200 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-900/10",
    headerColor: "bg-teal-600",
    image: wingInsulin,
    genotype: "chico[1] homozygous (IRS/insulin receptor substrate LOF)",
    phenotype: "Wing ~60% of wild-type size (left: wt, right: mutant); proportionally smaller — fewer and smaller cells; shape intact",
    genes: ["chico", "InR", "Dp110", "Akt1", "PTEN", "TOR", "S6K"],
    description: "Systemic growth control via the insulin/IGF pathway. Loss of Chico (IRS homolog) reduces cell and organ size proportionally without disrupting patterning.",
  },
  {
    name: "JAK/STAT",
    abbrev: null,
    color: "border-cyan-200 dark:border-cyan-900/40 bg-cyan-50/50 dark:bg-cyan-900/10",
    headerColor: "bg-rose-600",
    image: wingJakstat,
    genotype: "Stat92E MARCM clones or upd misexpression in wing pouch",
    phenotype: "Reduced wing size with shortened proximal hinge; blade truncated near articulation; veins compressed",
    genes: ["hop", "Stat92E", "upd", "upd2", "upd3", "ken"],
    description: "JAK/STAT signaling through Hopscotch and Stat92E controls growth. Loss causes size reduction particularly affecting the hinge region.",
  },
  {
    name: "Myc/Cell Competition",
    abbrev: "Myc / dMyc",
    color: "border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-900/10",
    headerColor: "bg-purple-700",
    image: wingMyc,
    genotype: "dm[4]; VgM; Tub-Gal4/+ (dmyc absent from wing)",
    phenotype: "Wing blade 55% smaller than wild-type (left: wt, right: mutant); proportional reduction; loser cells eliminated by competition",
    genes: ["dm", "Myc", "l(2)gl", "scrib", "dlg", "baz"],
    description: "dMyc drives cell competition — cells with less Myc than neighbors are eliminated as 'losers'. Wing-specific loss causes severe size reduction.",
  },
  {
    name: "TNF/Eiger",
    abbrev: "TNF / Eiger / JNK-apoptosis",
    color: "border-gray-200 dark:border-gray-700/40 bg-gray-50/50 dark:bg-gray-900/10",
    headerColor: "bg-gray-600",
    image: wingTnf,
    genotype: "vg-Gal4 > UAS-eiger (TNF ligand overexpressed in wing blade)",
    phenotype: "Near-complete wing ablation — only a tiny crumpled remnant remains (right); JNK-mediated apoptosis eliminates wing blade",
    genes: ["egr", "grnd", "wgn", "bsk", "hep", "Dcp-1"],
    description: "Eiger (Drosophila TNF) activates JNK-dependent apoptosis. Overexpression in the wing pouch causes near-complete ablation of the wing blade.",
  },
  {
    name: "Fat-Dachsous",
    abbrev: "Fat / Ds / Hippo-PCP",
    color: "border-sky-200 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-900/10",
    headerColor: "bg-sky-600",
    image: wingFatds,
    genotype: "nub-Gal4 > UAS-fat-RNAi (Fat cadherin KD in wing pouch)",
    phenotype: "Enlarged, rounder wing with disturbed trichome polarity in swirling domains; size increase via Hippo/Yorkie derepression",
    genes: ["ft", "ds", "fj", "dachs", "app", "Zyx"],
    description: "Fat-Dachsous signaling acts upstream of both Hippo (size) and PCP (trichome polarity). Loss combines overgrowth with trichome disorientation.",
  },
];

export default function ReferencePage() {
  const [lightbox, setLightbox] = useState<{ name: string; image: string; phenotype: string } | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground mb-1">Pathway Reference Gallery</h1>
        <p className="text-sm text-muted-foreground">
          AI-generated illustrations of canonical adult <em>Drosophila</em> wing phenotypes, based on published genetics literature.
          Click any image to enlarge.
        </p>
      </div>

      {/* Wild-type anatomy */}
      <Card className="mb-8 bg-accent/20 border-accent/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Microscope size={14} />
            Wild-Type Wing Anatomy Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-2">Normal Vein Pattern</p>
              <ul className="space-y-1">
                <li><span className="font-medium text-foreground">L1:</span> Anterior margin vein (costa)</li>
                <li><span className="font-medium text-foreground">L2:</span> Anterior longitudinal vein (subcosta)</li>
                <li><span className="font-medium text-foreground">L3:</span> Defines anterior-posterior boundary</li>
                <li><span className="font-medium text-foreground">L4:</span> Major posterior longitudinal vein</li>
                <li><span className="font-medium text-foreground">L5:</span> Posterior margin vein</li>
                <li><span className="font-medium text-foreground">ACV:</span> Anterior cross vein (between L3–L4)</li>
                <li><span className="font-medium text-foreground">PCV:</span> Posterior cross vein (between L4–L5)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Normal Dimensions</p>
              <ul className="space-y-1">
                <li>Length: ~2.5 mm</li>
                <li>Shape: elongated oval</li>
                <li>Margin: smooth with anterior and posterior bristle rows</li>
                <li>Surface: flat, transparent, no blisters</li>
                <li>Compartments: anterior (ci+) / posterior (en+)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pathway cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {PATHWAYS.map((pw) => (
          <Card
            key={pw.name}
            className={`border ${pw.color} flex flex-col overflow-hidden`}
            data-testid={`ref-card-${pw.name.replace(/[^a-zA-Z0-9]/g, "-")}`}
          >
            {/* Colour header */}
            <div className={`${pw.headerColor} px-4 py-2.5`}>
              <p className="text-sm font-bold text-white leading-tight">{pw.name}</p>
              {pw.abbrev && <p className="text-xs text-white/70 mt-0.5">{pw.abbrev}</p>}
            </div>

            {/* Image */}
            <div
              className="relative bg-white cursor-zoom-in group"
              onClick={() => setLightbox({ name: pw.name, image: pw.image, phenotype: pw.phenotype })}
              data-testid={`img-wing-${pw.name.replace(/[^a-zA-Z0-9]/g, "-")}`}
            >
              <img
                src={pw.image}
                alt={`${pw.name} mutant wing phenotype`}
                className="w-full h-44 object-contain p-2"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
              </div>
            </div>

            <CardContent className="pb-4 pt-3 space-y-3 flex-1">
              {/* Phenotype description */}
              <p className="text-xs text-muted-foreground leading-relaxed italic">{pw.phenotype}</p>

              {/* Genotype */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Example genotype</p>
                <code className="text-xs bg-muted rounded px-2 py-1 block font-mono leading-snug">{pw.genotype}</code>
              </div>

              {/* Pathway description */}
              <p className="text-xs text-muted-foreground leading-relaxed">{pw.description}</p>

              {/* Gene candidates */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Key genes</p>
                <div className="flex flex-wrap gap-1">
                  {pw.genes.map((g) => (
                    <code key={g} className="text-xs bg-muted text-foreground rounded px-1.5 py-0.5 font-mono italic">
                      {g}
                    </code>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Citation note */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">About the illustrations: </span>
          Wing images are AI-generated illustrations based on published <em>Drosophila</em> wing phenotype literature,
          including FlyBase phenotype data and classical genetics papers (1990–2024). They are intended as representative
          reference examples, not reproductions of specific published figures. For research use only.
        </p>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          data-testid="lightbox-overlay"
        >
          <div
            className="relative max-w-3xl w-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="text-sm font-bold text-foreground">{lightbox.name} — wing phenotype</p>
              <button
                onClick={() => setLightbox(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="lightbox-close"
              >
                <X size={18} />
              </button>
            </div>
            <img
              src={lightbox.image}
              alt={`${lightbox.name} wing phenotype enlarged`}
              className="w-full object-contain max-h-[70vh] bg-white p-4"
            />
            <div className="px-4 py-3 bg-muted/30 border-t">
              <p className="text-xs text-muted-foreground italic">{lightbox.phenotype}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
