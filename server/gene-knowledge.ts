/**
 * Gene-level knowledge base: for each pathway, maps specific phenotype patterns
 * to the most likely candidate genes, with severity grading rubrics.
 *
 * Severity scale (1–5):
 *   1 = Very mild: subtle, requires careful inspection
 *   2 = Mild: clearly abnormal but minor
 *   3 = Moderate: obvious defect, functional wing retained
 *   4 = Severe: major structural disruption
 *   5 = Very severe / lethal-adjacent: near-complete loss of wing structure
 */

export type GeneCandidate = {
  gene: string;
  full_name: string;
  flybase_id?: string;
  allele_type: "LOF" | "GOF" | "dominant" | "hypomorph" | "haploinsufficient";
  phenotype_match: string;   // what specific aspect of the phenotype matches this gene
  notes?: string;
};

export type SeverityRubric = {
  score: number;            // 1–5
  label: string;            // e.g. "Mild", "Moderate"
  description: string;      // what the score means for this pathway
  example_allele?: string;
};

export type PathwayGeneData = {
  pathway: string;
  severity_rubric: SeverityRubric[];
  phenotype_to_genes: {
    pattern: string;         // description of phenotype pattern
    candidates: GeneCandidate[];
  }[];
};

export const GENE_KNOWLEDGE: PathwayGeneData[] = [
  {
    pathway: "Notch",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "1–2 small nicks at margin, bristle row intact or nearly so", example_allele: "N[fa-1] (facet)" },
      { score: 2, label: "Mild", description: "2–4 shallow notches, localized bristle loss, veins normal", example_allele: "Su(H) LOF het, Numb OE" },
      { score: 3, label: "Moderate", description: "Multiple clear notches along margin, partial bristle row loss, possible mild vein thickening", example_allele: "N[55e11] het, Dl/+ trans-het" },
      { score: 4, label: "Severe", description: "Large notches removing >20% of margin, widespread bristle loss, thickened veins, shape distortion", example_allele: "N[nd3], Ser/+" },
      { score: 5, label: "Very Severe", description: "Majority of wing margin absent, extensive vein defects, near-complete margin loss", example_allele: "N null clones, wg-Gal4>N-RNAi" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Small discrete notch(es) at proximal anterior margin, mild bristle loss",
        candidates: [
          { gene: "Su(H)", full_name: "Suppressor of Hairless", flybase_id: "FBgn0004837", allele_type: "LOF", phenotype_match: "Su(H) LOF reduces Notch target gene activation; proximal-biased mild notching is characteristic", notes: "Su(H)[sf] and Su(H)[1] heterozygotes show mild notching; Su(H) is the canonical Notch transcriptional effector" },
          { gene: "Numb", full_name: "Numb", flybase_id: "FBgn0002973", allele_type: "GOF", phenotype_match: "Numb GOF antagonizes Notch; overexpression causes mild margin notching", notes: "Numb overexpression mimics Notch LOF; endogenous Numb asymmetrically segregates during SOP division" },
          { gene: "neuralized", full_name: "neuralized", flybase_id: "FBgn0002932", allele_type: "LOF", phenotype_match: "neur LOF reduces Delta ubiquitination and Notch activation at margin", notes: "neur encodes E3 ubiquitin ligase for Delta; LOF causes mild-moderate wing notching" },
        ],
      },
      {
        pattern: "Moderate notches distributed along anterior and posterior margin, bristle row disrupted",
        candidates: [
          { gene: "N", full_name: "Notch", flybase_id: "FBgn0004647", allele_type: "haploinsufficient", phenotype_match: "N haploinsufficiency causes classic wing notching; severity proportional to allele strength", notes: "N[55e11], N[nd3] are classic notching alleles; N is X-linked so females are haploinsufficient in heterozyotes" },
          { gene: "Dl", full_name: "Delta", flybase_id: "FBgn0000463", allele_type: "LOF", phenotype_match: "Dl LOF reduces Notch ligand availability; moderate notching, vein thickening", notes: "Dl/+ trans-heterozygous with N/+ strongly enhances notching" },
          { gene: "Ser", full_name: "Serrate", flybase_id: "FBgn0004197", allele_type: "LOF", phenotype_match: "Ser LOF causes notching especially at wing tip and anterior margin", notes: "Ser is the dorsal-compartment Notch ligand; Ser/+ can cause mild notching alone or strongly enhance N/+" },
        ],
      },
      {
        pattern: "Severe notching with thickened veins and widespread margin loss",
        candidates: [
          { gene: "N", full_name: "Notch", flybase_id: "FBgn0004647", allele_type: "LOF", phenotype_match: "Strong N LOF alleles cause severe notching plus vein thickening (N suppresses vein fate)", notes: "N[nd3] is a classic 'Notchoid' allele causing notching + thick veins; N also suppresses vein differentiation" },
          { gene: "mam", full_name: "mastermind", flybase_id: "FBgn0002643", allele_type: "LOF", phenotype_match: "mam encodes Notch transcriptional coactivator; LOF causes severe margin + vein phenotypes", notes: "mam is required for all Notch target gene activation; strong alleles are lethal, hypomorphs show severe wing phenotypes" },
          { gene: "H", full_name: "Hairless", flybase_id: "FBgn0001185", allele_type: "GOF", phenotype_match: "H GOF (Hairless overexpression) represses all Notch targets causing severe margin loss", notes: "H is a co-repressor that competes with NICD for Su(H) binding; H GOF mimics complete Notch LOF" },
        ],
      },
      {
        pattern: "Loss of wing margin bristles with minimal notching of blade",
        candidates: [
          { gene: "wg", full_name: "wingless", flybase_id: "FBgn0284084", allele_type: "hypomorph", phenotype_match: "Wg hypomorphs can cause bristle loss with minimal blade notching; wg is a Notch target at the margin", notes: "wg is transcribed by Notch-activated cells at margin; wg hypomorphs can phenocopy mild Notch LOF at margin" },
          { gene: "cut", full_name: "cut", flybase_id: "FBgn0004198", allele_type: "LOF", phenotype_match: "cut LOF causes loss of margin-specific cell fates including bristles", notes: "cut is a Notch target gene at the wing margin specifying margin identity" },
          { gene: "vestigial", full_name: "vestigial", flybase_id: "FBgn0003975", allele_type: "hypomorph", phenotype_match: "vg hypomorphs cause margin-specific loss reflecting Notch-Vg feedback", notes: "vg boundary enhancer is activated by Notch; vg hypomorphs can cause selective margin defects" },
        ],
      },
    ],
  },

  {
    pathway: "Dpp",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "Subtle L3-L4 cross-vein thinning or slight compression of L3-L4 interval" },
      { score: 2, label: "Mild", description: "Loss of anterior or posterior cross vein; mild compression of posterior wing" },
      { score: 3, label: "Moderate", description: "Clear posterior wing size reduction; both cross veins absent; L3-L4 spacing compressed", example_allele: "dpp[disk] hypomorph" },
      { score: 4, label: "Severe", description: "Wing size ~50–70% normal; major loss of posterior veins; shape distortion" },
      { score: 5, label: "Very Severe", description: "Tiny wing remnant; most veins absent; near-complete wing loss", example_allele: "dpp null clones" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Cross vein loss only, normal wing size and longitudinal veins",
        candidates: [
          { gene: "dpp", full_name: "decapentaplegic", flybase_id: "FBgn0000490", allele_type: "hypomorph", phenotype_match: "Mild dpp hypomorphs affect cross veins before longitudinal veins", notes: "dpp[disk] is a classic weak allele causing cross-vein loss and mild size reduction" },
          { gene: "tkv", full_name: "thickveins", flybase_id: "FBgn0003716", allele_type: "LOF", phenotype_match: "tkv (BMP type I receptor) LOF in clones causes local vein patterning defects", notes: "tkv LOF removes Dpp signaling in posterior cells; heterozygotes show mild vein defects" },
          { gene: "sax", full_name: "saxophone", flybase_id: "FBgn0003277", allele_type: "LOF", phenotype_match: "sax (type I BMP receptor) LOF causes cross vein defects", notes: "sax cooperates with tkv to transduce Dpp signal; sax LOF preferentially affects crossveins" },
        ],
      },
      {
        pattern: "Reduced posterior wing compartment, compressed L3-L4 interval",
        candidates: [
          { gene: "Mad", full_name: "Mothers against dpp", flybase_id: "FBgn0011648", allele_type: "LOF", phenotype_match: "Mad is the primary Dpp signal transducer; LOF causes posterior wing reduction and vein loss", notes: "Mad/Smad1 LOF causes strong Dpp-like phenotypes; Mad clones lose posterior wing fate" },
          { gene: "Medea", full_name: "Medea", flybase_id: "FBgn0021158", allele_type: "LOF", phenotype_match: "Medea (Co-Smad) LOF phenocopies Mad LOF in the wing", notes: "Medea is the Co-Smad required for all BMP signaling in the wing; LOF is strong" },
          { gene: "brk", full_name: "brinker", flybase_id: "FBgn0020386", allele_type: "GOF", phenotype_match: "brk GOF mimics Dpp LOF: posterior size reduction and vein loss", notes: "brk encodes a Dpp-repressed transcription factor; brk GOF is epistatic to Dpp signaling" },
        ],
      },
      {
        pattern: "Enlarged wing with ectopic tissue, ectopic veins in posterior compartment",
        candidates: [
          { gene: "brk", full_name: "brinker", flybase_id: "FBgn0020386", allele_type: "LOF", phenotype_match: "brk LOF causes Dpp pathway hyperactivation: wing overgrowth and ectopic vein material", notes: "brk LOF derepresses Dpp target genes throughout the wing; causes overgrowth and patterning defects" },
          { gene: "dpp", full_name: "decapentaplegic", flybase_id: "FBgn0000490", allele_type: "GOF", phenotype_match: "Ectopic dpp expression (GOF) causes overgrowth and ectopic vein differentiation", notes: "dpp GOF in anterior compartment causes ectopic posterior-type vein patterning" },
        ],
      },
    ],
  },

  {
    pathway: "Wnt/Wingless",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "Loss of 1–2 rows of margin bristles, blade intact" },
      { score: 2, label: "Mild", description: "Smooth loss of margin bristles along part of margin, subtle blade indentation" },
      { score: 3, label: "Moderate", description: "Clear margin tissue loss (smooth, not notched), loss of both bristle rows over substantial margin length", example_allele: "wg[1] hypomorph" },
      { score: 4, label: "Severe", description: "Major blade loss from margin inward, >30% of wing area missing" },
      { score: 5, label: "Very Severe", description: "Wing reduced to small stub or absent; entire margin lost", example_allele: "wg null / arm null clones" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Loss of margin bristles with smooth margin (not notched)",
        candidates: [
          { gene: "wg", full_name: "wingless", flybase_id: "FBgn0284084", allele_type: "hypomorph", phenotype_match: "wg is the primary Wnt ligand at the wing margin; hypomorphs cause progressive margin loss", notes: "wg[1] is a classic allele; wg temperature-sensitive alleles allow severity titration" },
          { gene: "fz", full_name: "frizzled", flybase_id: "FBgn0001085", allele_type: "LOF", phenotype_match: "fz LOF reduces Wg signaling at margin cells causing bristle/margin loss", notes: "fz/fz2 double LOF gives strong Wg-like phenotypes" },
          { gene: "dsh", full_name: "dishevelled", flybase_id: "FBgn0000499", allele_type: "LOF", phenotype_match: "dsh LOF blocks Wg signal transduction", notes: "dsh acts downstream of Fz; LOF phenocopies wg hypomorph" },
        ],
      },
      {
        pattern: "Large blade loss with diffuse margin deletion",
        candidates: [
          { gene: "arm", full_name: "armadillo", flybase_id: "FBgn0000117", allele_type: "LOF", phenotype_match: "arm (β-catenin) LOF blocks all Wg signaling; strong clonal loss of wing fate", notes: "arm is the core Wg effector; arm LOF clones lose wing identity entirely" },
          { gene: "pan", full_name: "pangolin", flybase_id: "FBgn0019656", allele_type: "LOF", phenotype_match: "pan (TCF/LEF) LOF blocks Wg target gene transcription", notes: "pan LOF in wing causes loss of Wg target genes (wg, Dll, vg) and wing reduction" },
          { gene: "pygo", full_name: "pygopus", flybase_id: "FBgn0026722", allele_type: "LOF", phenotype_match: "pygo (Wg coactivator) LOF causes strong wing-margin and size reduction", notes: "pygo is a Wg transcriptional coactivator; pygo LOF strongly reduces wing size" },
        ],
      },
    ],
  },

  {
    pathway: "Hedgehog",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "Slight L3 or L4 broadening; cross vein position mildly shifted" },
      { score: 2, label: "Mild", description: "Clear L3 or L4 thickening near A/P boundary; subtle extra vein stub between L3-L4" },
      { score: 3, label: "Moderate", description: "Distinct ectopic vein between L3-L4; one longitudinal vein clearly broadened or duplicated", example_allele: "ptc LOF" },
      { score: 4, label: "Severe", description: "L3-L4 fusion or major A/P duplication; substantial ectopic vein material" },
      { score: 5, label: "Very Severe", description: "Complete A/P patterning collapse; L3-L4 region unrecognizable", example_allele: "smo GOF, ptc null" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Ectopic vein between L3 and L4",
        candidates: [
          { gene: "ptc", full_name: "patched", flybase_id: "FBgn0003892", allele_type: "LOF", phenotype_match: "ptc LOF derepresses Smo constitutively, causing ectopic Hh signaling at A/P boundary → ectopic L3-L4 vein", notes: "ptc is the Hh receptor/repressor; ptc LOF is the classic Hh GOF model in wing" },
          { gene: "smo", full_name: "smoothened", flybase_id: "FBgn0003444", allele_type: "GOF", phenotype_match: "Activated smo causes ectopic Hh pathway activation and A/P boundary expansion", notes: "smo GOF mimics constitutive Hh signaling; UAS-smo[act] gives strong L3-L4 region expansion" },
          { gene: "ci", full_name: "cubitus interruptus", flybase_id: "FBgn0000308", allele_type: "GOF", phenotype_match: "Activated ci (CiAct) expands Hh target gene expression causing ectopic vein and patterning defects", notes: "ci encodes the Gli-family Hh transcription factor; CiAct mimics maximal Hh signaling" },
        ],
      },
      {
        pattern: "L3 or L4 absent or truncated in posterior compartment",
        candidates: [
          { gene: "hh", full_name: "hedgehog", flybase_id: "FBgn0001169", allele_type: "LOF", phenotype_match: "hh LOF in posterior cells removes the Hh morphogen signal, causing loss of L3/L4 vein specification", notes: "hh is expressed in posterior compartment; loss causes anterior vein specification defects" },
          { gene: "smo", full_name: "smoothened", flybase_id: "FBgn0003444", allele_type: "LOF", phenotype_match: "smo LOF in anterior cells blocks Hh reception; loss of L3 and L4 vein fates", notes: "smo LOF clones in anterior wing lose all Hh pathway responses" },
        ],
      },
    ],
  },

  {
    pathway: "EGFR/Ras",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "Subtle vein thickening limited to L2 or L5 tips" },
      { score: 2, label: "Mild", description: "Clear thickening of 1–2 longitudinal veins; no ectopic veins" },
      { score: 3, label: "Moderate", description: "Thickened veins + at least one ectopic vein stub; possible mild roughness", example_allele: "ras[V12] clones" },
      { score: 4, label: "Severe", description: "Multiple ectopic complete veins; extensive vein thickening; rough bumpy wing surface" },
      { score: 5, label: "Very Severe", description: "Neoplastic overgrowth; wing blade largely replaced by vein material and rough tissue" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Thickened longitudinal veins, especially L2 and L5",
        candidates: [
          { gene: "Egfr", full_name: "Epidermal growth factor receptor", flybase_id: "FBgn0003731", allele_type: "GOF", phenotype_match: "Egfr GOF activates Ras-MAPK causing vein cell fate expansion and vein thickening", notes: "Egfr is the primary EGFR in wing; GOF causes thickened veins; LOF causes vein loss (see below)" },
          { gene: "rho", full_name: "rhomboid", flybase_id: "FBgn0004635", allele_type: "GOF", phenotype_match: "rho GOF cleaves Spitz (EGF ligand) in provein cells, causing vein thickening by local EGFR activation", notes: "rho is expressed in provein cells and cleaves the TGFα-like ligand Spitz; rho GOF causes thick veins" },
          { gene: "pnt", full_name: "pointed", flybase_id: "FBgn0003118", allele_type: "GOF", phenotype_match: "pnt (ETS transcription factor) GOF drives vein differentiation; overexpression thickens all veins", notes: "pnt is the downstream transcriptional activator of EGFR/Ras in vein cells" },
        ],
      },
      {
        pattern: "Extra ectopic veins, especially delta branches off existing veins",
        candidates: [
          { gene: "ras", full_name: "Ras oncogene at 85D", flybase_id: "FBgn0003205", allele_type: "GOF", phenotype_match: "ras[V12] GOF (constitutively active) strongly induces extra vein material and ectopic vein differentiation", notes: "ras[V12] is the canonical constitutively active Ras; causes dramatic ectopic veins and neoplastic tissue" },
          { gene: "aos", full_name: "argos", flybase_id: "FBgn0000137", allele_type: "LOF", phenotype_match: "aos LOF removes EGFR negative feedback inhibitor; causes extra veins by sustained EGFR activation", notes: "argos is a secreted EGFR antagonist; aos LOF causes phenotype similar to mild EGFR GOF" },
          { gene: "kek1", full_name: "kekkon-1", flybase_id: "FBgn0014455", allele_type: "LOF", phenotype_match: "kek1 LOF removes transmembrane EGFR inhibitor; enhanced vein differentiation and extra vein material", notes: "kek1 is a leucine-rich repeat protein that inhibits EGFR at the cell surface" },
        ],
      },
      {
        pattern: "Loss of veins, thin veins, or gaps in longitudinal veins",
        candidates: [
          { gene: "Egfr", full_name: "Epidermal growth factor receptor", flybase_id: "FBgn0003731", allele_type: "LOF", phenotype_match: "Egfr LOF causes failure of vein differentiation; thin or absent veins", notes: "Egfr LOF in wing causes characteristic loss of L2 vein and truncations of L3/L4/L5" },
          { gene: "spi", full_name: "spitz", flybase_id: "FBgn0003495", allele_type: "LOF", phenotype_match: "spi (TGFα/EGF ligand) LOF removes EGFR activation in provein cells; vein loss", notes: "spitz is the primary EGF ligand for vein differentiation; spi LOF phenocopies weak Egfr LOF" },
        ],
      },
    ],
  },

  {
    pathway: "Hippo/Yorkie",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "5–15% wing size increase; flat and smooth" },
      { score: 2, label: "Mild", description: "15–40% wing size increase; slight ruffling at margin" },
      { score: 3, label: "Moderate", description: "Wing clearly larger than wild-type; folding/ruffling of blade due to excess tissue", example_allele: "wts hypomorph, ex LOF" },
      { score: 4, label: "Severe", description: "Wing ~2–3x normal size; prominent folding; possible melanotic spots" },
      { score: 5, label: "Very Severe", description: "Massive tumor-like overgrowth 3–5x normal; deeply folded/ruffled; melanotic tumors; lethal in strong alleles", example_allele: "wts null, hpo null" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Moderate wing overgrowth with ruffling",
        candidates: [
          { gene: "wts", full_name: "warts", flybase_id: "FBgn0011739", allele_type: "LOF", phenotype_match: "wts encodes the Hippo pathway kinase that phosphorylates and inactivates Yki; LOF causes strong overgrowth", notes: "wts is the NDR kinase core component; wts LOF gives strong uniform overgrowth" },
          { gene: "hpo", full_name: "hippo", flybase_id: "FBgn0260397", allele_type: "LOF", phenotype_match: "hpo (MST kinase) LOF deactivates the entire Hippo kinase cascade; strong overgrowth", notes: "hpo encodes the Ste20 kinase upstream of Wts; hpo LOF phenocopies wts LOF" },
          { gene: "ex", full_name: "expanded", flybase_id: "FBgn0000615", allele_type: "LOF", phenotype_match: "ex (FERM domain protein) LOF reduces Hippo pathway activation; moderate overgrowth, milder than wts/hpo", notes: "ex acts at apical junctions to recruit Hpo; ex LOF has more variable expressivity than wts" },
        ],
      },
      {
        pattern: "Severe tumor-like overgrowth with melanotic spots",
        candidates: [
          { gene: "yki", full_name: "yorkie", flybase_id: "FBgn0034970", allele_type: "GOF", phenotype_match: "yki GOF (Yki-S168A, phosphorylation-dead) causes constitutive nuclear Yki and maximal overgrowth", notes: "yki GOF is the most penetrant Hippo pathway GOF; UAS-yki[S168A] gives massive tumorous overgrowth" },
          { gene: "fat", full_name: "fat", flybase_id: "FBgn0008636", allele_type: "LOF", phenotype_match: "fat (protocadherin) LOF deregulates both Hippo pathway and Fat-Ds PCP; causes wing overgrowth", notes: "fat LOF affects both Hippo pathway (growth) and Fat-Ds PCP (polarity); overgrowth is prominent" },
          { gene: "mer", full_name: "merlin", flybase_id: "FBgn0026430", allele_type: "LOF", phenotype_match: "mer (NF2/Merlin) LOF disrupts Hippo pathway activation at apical junctions; overgrowth", notes: "mer acts with ex at apical junctions; mer/ex double LOF gives strong synergistic overgrowth" },
        ],
      },
    ],
  },

  {
    pathway: "JNK",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "Small blisters (<5% wing area) or tiny patches of apoptotic loss" },
      { score: 2, label: "Mild", description: "1–3 blisters covering 5–15% wing area; mild irregular margin" },
      { score: 3, label: "Moderate", description: "Multiple blisters; substantial tissue loss; ragged or thinned wing regions", example_allele: "bsk hypomorph" },
      { score: 4, label: "Severe", description: "Large blisters or tissue loss covering >30% wing area; wing deformed" },
      { score: 5, label: "Very Severe", description: "Wing blade largely absent due to apoptosis; only proximal stump remains", example_allele: "hep GOF, eiger GOF" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Wing blistering (bubble-like D-V surface separation)",
        candidates: [
          { gene: "bsk", full_name: "basket", flybase_id: "FBgn0000229", allele_type: "LOF", phenotype_match: "bsk (JNK) LOF disrupts dorsal closure mechanics; wing disc fusion defects cause adult blistering", notes: "bsk is the canonical Drosophila JNK; bsk LOF in wing context causes blistering and tissue loss" },
          { gene: "hep", full_name: "hemipterous", flybase_id: "FBgn0010303", allele_type: "GOF", phenotype_match: "hep (JNKK/MKK7) GOF constitutively activates JNK causing apoptosis-driven tissue loss", notes: "hep GOF drives sustained JNK activation → caspase activation → tissue loss" },
          { gene: "puc", full_name: "puckered", flybase_id: "FBgn0243512", allele_type: "LOF", phenotype_match: "puc (JNK phosphatase) LOF removes JNK negative feedback; sustained JNK activation and tissue loss", notes: "puc is a transcriptional target of JNK that forms a negative feedback loop; puc LOF causes strong JNK hyperactivation" },
        ],
      },
    ],
  },

  {
    pathway: "Integrin",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "1–2 tiny blisters (<3% wing area each) in intervein regions" },
      { score: 2, label: "Mild", description: "Small blisters in 1–2 intervein regions, 3–10% wing area" },
      { score: 3, label: "Moderate", description: "Multiple blisters in several intervein compartments; 10–30% wing area blistered", example_allele: "mys hypomorph, if LOF" },
      { score: 4, label: "Severe", description: "Large blisters covering most of wing blade; wing inflated" },
      { score: 5, label: "Very Severe", description: "Entire wing blade blistered; wing is a single large bubble", example_allele: "mys null clones" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Large smooth air-filled blisters, D-V surface separation",
        candidates: [
          { gene: "mys", full_name: "myospheroid", flybase_id: "FBgn0002873", allele_type: "LOF", phenotype_match: "mys (βPS integrin) LOF removes integrin-mediated D-V adhesion; air-filled blistering", notes: "mys is the βPS integrin subunit required for D-V adhesion at wing maturation; classic blistering gene" },
          { gene: "if", full_name: "inflated", flybase_id: "FBgn0001248", allele_type: "LOF", phenotype_match: "if (αPS2 integrin) LOF causes blistering similar to mys LOF; disrupts the main wing integrin heterodimer", notes: "if encodes the αPS2 integrin; if/mys form the main wing adhesion integrin; if LOF named 'inflated' for blistering" },
          { gene: "rhea", full_name: "rhea (talin)", flybase_id: "FBgn0026183", allele_type: "LOF", phenotype_match: "talin (rhea) LOF disrupts integrin-actin linkage; causes blistering like integrin LOF itself", notes: "talin is the cytoplasmic integrin adaptor linking integrins to actin; rhea LOF mimics integrin LOF" },
          { gene: "mew", full_name: "multiple edematous wings", flybase_id: "FBgn0002868", allele_type: "LOF", phenotype_match: "mew (αPS1 integrin) LOF causes blistering in dorsal surface regions", notes: "mew is expressed dorsally; mew/mys heterodimers mediate specific adhesion zones; mew LOF causes localized blistering" },
        ],
      },
    ],
  },

  {
    pathway: "FGF",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "One cross vein (ACV or PCV) thinner than normal; present but incomplete" },
      { score: 2, label: "Mild", description: "One cross vein absent; other intact" },
      { score: 3, label: "Moderate", description: "Both cross veins absent; longitudinal veins normal", example_allele: "ths/pyr double LOF" },
      { score: 4, label: "Severe", description: "Both cross veins absent; tips of L4/L5 also truncated" },
      { score: 5, label: "Very Severe", description: "Cross veins absent + substantial longitudinal vein truncations" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Missing anterior or posterior cross vein",
        candidates: [
          { gene: "ths", full_name: "thisbe", flybase_id: "FBgn0031235", allele_type: "LOF", phenotype_match: "ths (FGF8-like ligand) LOF contributes to cross vein cell specification failure", notes: "ths and pyr are partially redundant FGF ligands; ths single LOF causes partial cross-vein loss" },
          { gene: "pyr", full_name: "pyramus", flybase_id: "FBgn0031987", allele_type: "LOF", phenotype_match: "pyr (FGF8-like ligand) LOF causes cross vein defects; stronger in double with ths", notes: "pyr/ths double LOF gives complete cross-vein loss" },
          { gene: "htl", full_name: "heartless", flybase_id: "FBgn0010389", allele_type: "LOF", phenotype_match: "htl (FGF receptor) LOF in wing context causes cross vein specification failure", notes: "htl is the FGF receptor for Ths/Pyr in wing; htl LOF in cross-vein cells removes FGF signaling" },
          { gene: "dof", full_name: "downstream of FGFR", flybase_id: "FBgn0026372", allele_type: "LOF", phenotype_match: "dof is required for all FGF receptor signaling; LOF phenocopies receptor LOF", notes: "dof encodes the scaffold protein required for FGFR signal transduction in all tissues" },
        ],
      },
    ],
  },

  {
    pathway: "PCP/Frizzled",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "Occasional misoriented hairs in small patches; <10% of cells affected" },
      { score: 2, label: "Mild", description: "10–30% of wing hairs misoriented; small swirled domains" },
      { score: 3, label: "Moderate", description: "Widespread hair misorientation; swirled domains visible across wing; some multiple-hair cells", example_allele: "fz LOF" },
      { score: 4, label: "Severe", description: "Most hairs randomized; many multiple-hair cells; vortex patterns" },
      { score: 5, label: "Very Severe", description: "Complete randomization; all cells have multiple or non-distally pointing hairs", example_allele: "mwh (multiple wing hairs) LOF" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Swirled or randomized trichome orientation, normal wing size and veins",
        candidates: [
          { gene: "fz", full_name: "frizzled", flybase_id: "FBgn0001085", allele_type: "LOF", phenotype_match: "fz is the core PCP receptor; LOF causes global trichome polarity randomization", notes: "fz LOF is the canonical PCP phenotype; trichome direction randomized across whole wing" },
          { gene: "Vang", full_name: "Van Gogh / strabismus", flybase_id: "FBgn0026597", allele_type: "LOF", phenotype_match: "Vang (stbm) LOF disrupts the asymmetric PCP complex causing polarity randomization", notes: "Vang localizes to the proximal face of wing cells; LOF causes polarity defects like fz LOF" },
          { gene: "fmi", full_name: "flamingo / starry night", flybase_id: "FBgn0022786", allele_type: "LOF", phenotype_match: "fmi (atypical cadherin) LOF disrupts PCP complex propagation and polarity organization", notes: "fmi is required for all PCP signal propagation; LOF gives strong polarity defects" },
          { gene: "pk", full_name: "prickle", flybase_id: "FBgn0003031", allele_type: "LOF", phenotype_match: "pk LOF disrupts the proximal PCP complex component; polarity swirling phenotype", notes: "pk/pk-sple isoforms specify proximal cell polarity; LOF causes characteristic swirled patterns" },
        ],
      },
      {
        pattern: "Multiple wing hairs per cell",
        candidates: [
          { gene: "in", full_name: "inturned", flybase_id: "FBgn0002009", allele_type: "LOF", phenotype_match: "in LOF causes multiple hairs per cell; acts downstream of core PCP complex to restrict hair initiation", notes: "in is a 'tissue polarity effector' gene; in LOF gives strong multiple-hair phenotype" },
          { gene: "fy", full_name: "fuzzy", flybase_id: "FBgn0001077", allele_type: "LOF", phenotype_match: "fy LOF causes multiple hairs; acts in the same pathway as in", notes: "fy and in act together to restrict actin polymerization to single distal vertex" },
          { gene: "mwh", full_name: "multiple wing hairs", flybase_id: "FBgn0002928", allele_type: "LOF", phenotype_match: "mwh LOF causes the multiple-hair phenotype; mwh is a formin-family actin nucleator repressor", notes: "mwh is the defining multiple-wing-hair gene; all wing cells form multiple actin hairs in mwh LOF" },
        ],
      },
    ],
  },

  {
    pathway: "Insulin/PI3K/TOR",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "~5–15% size reduction; proportionally normal; subtle cell size reduction" },
      { score: 2, label: "Mild", description: "15–30% size reduction; normal venation and margin" },
      { score: 3, label: "Moderate", description: "30–50% size reduction; wing clearly smaller than wild-type but all structures present", example_allele: "chico LOF" },
      { score: 4, label: "Severe", description: "50–70% size reduction; normal proportions retained; wing very small" },
      { score: 5, label: "Very Severe", description: ">70% size reduction; tiny wing remnant; normal patterning but miniature", example_allele: "Dp110 null, PTEN GOF" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Uniformly small wing, normal vein pattern, normal margin",
        candidates: [
          { gene: "chico", full_name: "chico (IRS1/2/3/4 homolog)", flybase_id: "FBgn0020367", allele_type: "LOF", phenotype_match: "chico LOF reduces insulin signaling output; proportionally smaller wing with fewer, smaller cells", notes: "chico[1] homozygous flies are fertile but small; the original insulin receptor substrate mutant" },
          { gene: "Dp110", full_name: "Dp110 (PI3-kinase 92E)", flybase_id: "FBgn0015279", allele_type: "LOF", phenotype_match: "Dp110 LOF reduces PI3K signaling and PIP3 production; uniformly smaller wing", notes: "Dp110 is the catalytic PI3K subunit; LOF clones are smaller than wild-type; GOF causes overgrowth" },
          { gene: "Pten", full_name: "PTEN", flybase_id: "FBgn0026379", allele_type: "GOF", phenotype_match: "PTEN GOF reduces PIP3 levels, suppressing PI3K-Akt-TOR signaling; uniformly small wing", notes: "PTEN opposes Dp110; PTEN GOF mimics PI3K LOF; PTEN LOF causes wing overgrowth" },
          { gene: "TOR", full_name: "Target of rapamycin", flybase_id: "FBgn0021796", allele_type: "LOF", phenotype_match: "TOR LOF reduces cell growth and size; proportionally smaller wing with normal patterning", notes: "TOR integrates nutrient and insulin signals; TOR LOF gives small-cell, small-wing phenotype" },
          { gene: "S6k", full_name: "S6 kinase", flybase_id: "FBgn0010379", allele_type: "LOF", phenotype_match: "S6k (p70 S6K) LOF reduces ribosome biogenesis and translation; small cells and small wing", notes: "S6k is the key TOR effector for cell growth; S6k[l-1] LOF gives ~30% wing size reduction" },
        ],
      },
    ],
  },

  {
    pathway: "JAK/STAT",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "Subtle hinge region reduction; wing slightly smaller proximally" },
      { score: 2, label: "Mild", description: "Hinge region clearly reduced; wing held slightly out; no blistering" },
      { score: 3, label: "Moderate", description: "Wing held out; hinge hypoplastic; proximal wing blade reduced", example_allele: "stat92E hypomorph" },
      { score: 4, label: "Severe", description: "Wing held perpendicular to body; blistering; tissue fate changes" },
      { score: 5, label: "Very Severe", description: "Tumorous overgrowth; wing unrecognizable; lethal in strong alleles", example_allele: "hop[tum-l]" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Hinge hypoplasia, wing held out or drooping",
        candidates: [
          { gene: "stat92E", full_name: "signal transducer and activator of transcription at 92E", flybase_id: "FBgn0016917", allele_type: "LOF", phenotype_match: "stat92E LOF in hinge cells causes hinge hypoplasia and held-out wing posture", notes: "JAK/STAT signaling is specifically required for hinge specification; stat92E LOF wings are held out from body" },
          { gene: "hop", full_name: "hopscotch", flybase_id: "FBgn0001721", allele_type: "LOF", phenotype_match: "hop (JAK) LOF reduces STAT activation in hinge; hinge and proximal wing reduced", notes: "hop LOF in wing causes hinge defects; hop GOF (hoptum) causes tumorous overgrowth" },
          { gene: "upd", full_name: "unpaired", flybase_id: "FBgn0004956", allele_type: "LOF", phenotype_match: "upd (JAK/STAT ligand) LOF removes the signal activating hop-stat92E in hinge cells", notes: "upd is the Drosophila IL-6-like JAK/STAT ligand; upd LOF in hinge causes hinge reduction" },
        ],
      },
      {
        pattern: "Wing overgrowth or blistering",
        candidates: [
          { gene: "hop", full_name: "hopscotch", flybase_id: "FBgn0001721", allele_type: "GOF", phenotype_match: "hop[tum-l] (tumorous GOF) causes massive JAK/STAT hyperactivation → tumorous wing overgrowth", notes: "hop[tum-l] is a temperature-sensitive GOF allele; at 29°C causes lethal melanotic tumors" },
        ],
      },
    ],
  },

  {
    pathway: "Myc/Cell Competition",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "~5–10% size change; subtle bristle size difference" },
      { score: 2, label: "Mild", description: "10–20% size reduction (LOF) or increase (GOF); normal patterning" },
      { score: 3, label: "Moderate", description: "20–35% size change; bristle/cell size clearly different from wild-type", example_allele: "dm[1] LOF" },
      { score: 4, label: "Severe", description: "35–50% size change; proportionally miniature or enlarged wing" },
      { score: 5, label: "Very Severe", description: ">50% size change", example_allele: "dm null" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Proportionally smaller wing, smaller cells and bristles",
        candidates: [
          { gene: "dm", full_name: "diminutive (dMyc)", flybase_id: "FBgn0262656", allele_type: "LOF", phenotype_match: "dm (dMyc) LOF reduces ribosome biogenesis; proportionally smaller wing with smaller cells", notes: "dm[1] and dm[P0] are classic weak alleles; strong LOF causes lethality" },
          { gene: "dMyc", full_name: "dMyc", flybase_id: "FBgn0262656", allele_type: "GOF", phenotype_match: "dMyc GOF increases cell growth rate and wing size ~16%", notes: "UAS-dMyc overexpression drives faster growth; dMyc winner cells eliminate slower-growing neighbors" },
        ],
      },
    ],
  },

  {
    pathway: "TNF/Eiger",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "Small patches of tissue loss or irregular margin; <10% wing area" },
      { score: 2, label: "Mild", description: "Visible tissue loss patches; 10–20% of wing area" },
      { score: 3, label: "Moderate", description: "Substantial tissue loss; irregular ragged wing shape; 20–50% affected" },
      { score: 4, label: "Severe", description: "Most wing blade absent; only proximal regions remain" },
      { score: 5, label: "Very Severe", description: "Wing completely absent; only hinge stub visible", example_allele: "egr GOF strong" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Ragged apoptotic tissue loss, irregular wing edges",
        candidates: [
          { gene: "egr", full_name: "eiger", flybase_id: "FBgn0036509", allele_type: "GOF", phenotype_match: "eiger (TNF homolog) GOF causes massive JNK-dependent apoptosis and wing tissue loss", notes: "egr is the Drosophila TNF homolog; egr GOF is a potent wing ablation tool; endogenous egr drives loser-cell elimination" },
          { gene: "wgn", full_name: "wengen", flybase_id: "FBgn0036716", allele_type: "GOF", phenotype_match: "wgn (TNF receptor) constitutive activation drives Eiger-JNK apoptosis downstream", notes: "wgn is the primary Eiger death receptor; constitutively active wgn mimics Eiger GOF" },
          { gene: "grnd", full_name: "grindelwald", flybase_id: "FBgn0036716", allele_type: "GOF", phenotype_match: "grnd (second TNF receptor) activation drives apoptosis; involved in cell competition loser elimination", notes: "grnd is the death-activating Eiger receptor specifically required for competitive cell elimination" },
        ],
      },
    ],
  },

  {
    pathway: "Fat-Dachsous",
    severity_rubric: [
      { score: 1, label: "Very Mild", description: "Subtle proximal hair misorientation; normal size" },
      { score: 2, label: "Mild", description: "Proximal hair polarity defects; mild wing shape change" },
      { score: 3, label: "Moderate", description: "Clear proximal PCP defects; wing slightly enlarged or shape-distorted", example_allele: "ft hypomorph" },
      { score: 4, label: "Severe", description: "Substantial overgrowth via Hippo deregulation; proximal PCP defects throughout" },
      { score: 5, label: "Very Severe", description: "Tumorous overgrowth (via Hippo) + widespread polarity defects", example_allele: "ft null" },
    ],
    phenotype_to_genes: [
      {
        pattern: "Proximal hair polarity defects with mild overgrowth",
        candidates: [
          { gene: "ft", full_name: "fat", flybase_id: "FBgn0008636", allele_type: "LOF", phenotype_match: "ft (Fat protocadherin) LOF causes both Fat-Ds PCP defects and Hippo-mediated overgrowth", notes: "ft is expressed on cell surfaces; ft LOF activates dachs and deregulates both PCP and Hippo" },
          { gene: "ds", full_name: "dachsous", flybase_id: "FBgn0000438", allele_type: "LOF", phenotype_match: "ds (Dachsous atypical cadherin) LOF causes PCP defects and mild growth changes", notes: "ds is the Fat ligand; ds LOF gives PCP phenotypes with less overgrowth than fat LOF" },
          { gene: "fj", full_name: "four-jointed", flybase_id: "FBgn0001085", allele_type: "LOF", phenotype_match: "fj (Golgi kinase) LOF modulates Fat-Ds binding affinity; affects PCP gradient", notes: "fj phosphorylates Fat and Ds in the Golgi to modulate their binding; fj LOF alters PCP gradient" },
        ],
      },
    ],
  },
];

export const GENE_KNOWLEDGE_PROMPT = `
## Gene-Level Identification

For each pathway prediction, you must also identify the most likely specific genes responsible, based on the exact pattern and severity of the phenotype. Use the following principles:

**Severity grading (1–5 scale) — calibrate against a wild-type wing as baseline 0:**

CRITICAL ANTI-BIAS RULE: You have a strong tendency to assign scores of 1 or 2. FIGHT THIS BIAS. Wild-type = 0. Any wing that is not wild-type starts at 2 minimum. Multiple defects, large notches, widespread margin damage, significant shape distortion, or crumpling push the score to 3, 4, or 5. Do NOT assign 1 or 2 to a wing with obvious, visible defects.

- Score 1 (Very Mild): A nearly wild-type wing. Only 1–2 tiny nicks (< 3% wing width deep) visible under magnification. Vein pattern, blade shape, and posture are all normal. A casual observer would think it looks close to normal.
- Score 2 (Mild): Clearly abnormal to a trained observer. Small but definite notches (3–8% deep), minor bristle loss, OR slight shape asymmetry. No major structural disruption. The wing is functional-looking overall.
- Score 3 (Moderate): OBVIOUSLY abnormal — would be immediately apparent to any researcher. Multiple clear notches OR one large notch (>10% wing width), widespread bristle loss, clear vein defects, OR significant shape distortion. A researcher seeing this wing would immediately call it mutant.
- Score 4 (Severe): Major disruption of wing structure. Large notches removing >20% of margin, extensive vein defects, marked size reduction or overgrowth, strong shape distortion or crumpling. The wing is clearly non-functional.
- Score 5 (Very Severe): Near-complete loss of wing structure. Majority of margin absent, most veins missing or severely disrupted, tiny wing remnant, or extreme shape distortion. Functionally useless as a wing.

SEVERITY CALIBRATION ANCHORS — use these as reference points:
- N[fa-1] facet = score 1
- Su(H) heterozygote with 2–3 small notches = score 2  
- N[55e11] heterozygote with several clear notches = score 3
- N[nd3] notched + thickened veins = score 4
- wg-Gal4>N-RNAi near-complete margin loss = score 5
- me31B^k06607 with multiple visible notches and distorted margin = score 3 or higher

IF the morphology description mentions: multiple notches, large notches, margin irregularities, crumpling, folding, shape distortion, vein defects, or any combination of defects → the severity score MUST be 3 or higher. Do not assign 1 or 2 when multiple structural defects are present.

**Gene identification rules:**
1. Match the phenotype PATTERN to the gene. Different genes in the same pathway give distinct patterns:
   - Notch: Su(H)/Numb → mild proximal notching (score 2); N/Dl/Ser → moderate distributed notching (score 3); mam/H → severe (score 4–5)
   - Dpp: mild hypomorphs → cross vein loss (score 2); strong LOF → posterior size reduction (score 3–4); brk GOF → overgrowth (score 3–4)
   - Hippo: ex/mer → moderate overgrowth (score 3); wts/hpo → strong (score 4); yki GOF → massive (score 4–5)
   - EGFR: rho/aos → vein thickening (score 2–3); ras[V12] → ectopic veins (score 3); Egfr LOF → vein loss (score 3–4)
2. Consider LOF vs GOF: increased pathway activity and decreased activity produce opposite phenotypes
3. Rank gene candidates by likelihood — the best match goes first
4. FlyBase gene symbols are italicized in publications (e.g., *Notch*, *dpp*, *wg*) — report them in standard format

**Add this to your JSON output for each pathway prediction:**
"severity_score": 1-5 (integer),
"severity_label": "Very Mild" / "Mild" / "Moderate" / "Severe" / "Very Severe",
"severity_rationale": "brief explanation of why this severity score was assigned, citing the specific features that determined the score",
"gene_candidates": [
  {
    "gene": "gene symbol",
    "full_name": "full gene name",
    "allele_type": "LOF" / "GOF" / "dominant" / "hypomorph" / "haploinsufficient",
    "likelihood": "High" / "Medium" / "Low",
    "rationale": "why this gene matches the specific phenotype pattern and severity observed"
  }
]
`;
