import { TOKENS } from "./CsvImport";
export function SummaryStat({ label, value, color }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide" style={{ color: TOKENS.muted }}>{label}</p>
      <p className="text-lg font-semibold tabular-nums font-mono" style={{ color }}>{value}</p>
    </div>
  );
}
