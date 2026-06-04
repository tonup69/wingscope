const SEVERITY_CONFIG: Record<number, { label: string; color: string; dots: number }> = {
  1: { label: "Very Mild", color: "text-emerald-600 dark:text-emerald-400", dots: 1 },
  2: { label: "Mild",      color: "text-lime-600 dark:text-lime-400",    dots: 2 },
  3: { label: "Moderate",  color: "text-amber-600 dark:text-amber-400",  dots: 3 },
  4: { label: "Severe",    color: "text-orange-600 dark:text-orange-400",dots: 4 },
  5: { label: "Very Severe", color: "text-red-600 dark:text-red-400",   dots: 5 },
};

export function SeverityBadge({ score, label }: { score: number; label?: string }) {
  const cfg = SEVERITY_CONFIG[score] || SEVERITY_CONFIG[1];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
      <span className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i <= score ? "bg-current" : "bg-current opacity-20"}`}
          />
        ))}
      </span>
      {label || cfg.label}
    </span>
  );
}
