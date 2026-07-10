import { TOKENS } from "./CsvImport";
export function SummaryStat({ label, value, color }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide" style={{ color: TOKENS.muted }}>{label}</p>
      <p className="text-lg font-semibold tabular-nums" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
    </div>
  );
}