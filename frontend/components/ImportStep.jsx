"use client";

import { AlertTriangle, Check, RefreshCw, RotateCcw } from "lucide-react";
import { TOKENS, TARGET_SCHEMA } from "./CsvImport";
import { SummaryStat } from "./SummaryStat";
import { StatusBadge } from "./StatusBadge";

function LoadingState() {
  return (
    <div className="w-full max-w-2xl rounded-lg px-8 py-14 text-center" style={{ backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}` }} role="status">
      <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: TOKENS.accentSoft }}>
        <span className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${TOKENS.accent} transparent ${TOKENS.accent} ${TOKENS.accent}` }} />
      </div>
      <h1 className="mt-5 text-xl font-semibold font-heading" style={{ color: TOKENS.text }}>Extracting CRM records</h1>
      <p className="mt-2 text-sm" style={{ color: TOKENS.muted }}>AI is mapping fields and validating each batch. Larger files may take a few minutes.</p>
      <div className="mt-6 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: TOKENS.border }}>
        <div className="h-full w-1/3 rounded-full import-progress" style={{ backgroundColor: TOKENS.accent }} />
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry, onReset }) {
  return (
    <div className="w-full max-w-2xl rounded-lg px-8 py-12 text-center" style={{ backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}` }} role="alert">
      <div className="mx-auto w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: TOKENS.warningSoft }}><AlertTriangle size={20} color={TOKENS.warning} /></div>
      <h1 className="mt-4 text-xl font-semibold font-heading" style={{ color: TOKENS.text }}>Import could not be completed</h1>
      <p className="mt-2 text-sm" style={{ color: TOKENS.warning }}>{error}</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={onReset} className="px-4 py-2 rounded-md text-sm font-medium border" style={{ borderColor: TOKENS.border, color: TOKENS.text }}>Start over</button>
        <button type="button" onClick={onRetry} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium" style={{ backgroundColor: TOKENS.accent, color: "#FFFFFF" }}><RefreshCw size={14} /> Retry</button>
      </div>
    </div>
  );
}

function Results({ result, onReset }) {
  return (
    <section className="w-full max-w-6xl" aria-labelledby="results-title">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: TOKENS.successSoft }}><Check size={14} color={TOKENS.success} strokeWidth={3} /></span><h1 id="results-title" className="text-2xl font-semibold font-heading" style={{ color: TOKENS.text }}>Import complete</h1></div>
          <p className="mt-1.5 text-sm" style={{ color: TOKENS.muted }}>AI extraction finished. Review the normalized CRM records below.</p>
        </div>
        <button type="button" onClick={onReset} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border self-start" style={{ borderColor: TOKENS.border, color: TOKENS.text }}><RotateCcw size={14} /> Import another CSV</button>
      </div>

      <div className="mt-5 flex items-center gap-6 px-4 py-3 rounded-lg" style={{ backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}>
        <SummaryStat label="Total processed" value={result.totalImported + result.totalSkipped} color={TOKENS.text} />
        <div className="w-px h-8" style={{ backgroundColor: TOKENS.border }} />
        <SummaryStat label="Imported" value={result.totalImported} color={TOKENS.success} />
        <div className="w-px h-8" style={{ backgroundColor: TOKENS.border }} />
        <SummaryStat label="Skipped" value={result.totalSkipped} color={result.totalSkipped ? TOKENS.warning : TOKENS.muted} />
      </div>

      <h2 className="mt-6 text-sm font-semibold" style={{ color: TOKENS.text }}>Successfully parsed records</h2>
      {result.records.length ? (
        <div className="mt-2 rounded-lg overflow-hidden" style={{ border: `1px solid ${TOKENS.border}` }}>
          <div className="overflow-auto max-h-[480px]">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10"><tr style={{ backgroundColor: TOKENS.bg }}><th className="table-heading">Source row</th>{TARGET_SCHEMA.map((field) => <th key={field} className="table-heading">{field}</th>)}</tr></thead>
              <tbody>{result.records.map((record) => <tr key={record.sourceRowIndex} style={{ backgroundColor: TOKENS.surface }}><td className="table-cell font-mono text-xs">{record.sourceRowIndex + 2}</td>{TARGET_SCHEMA.map((field) => <td key={field} className="table-cell max-w-[260px] truncate" title={record[field] == null ? "" : String(record[field])}>{record[field] || <span style={{ color: TOKENS.muted }}>—</span>}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      ) : <div className="mt-2 rounded-lg px-5 py-8 text-center text-sm" style={{ backgroundColor: TOKENS.warningSoft, color: TOKENS.warning, border: `1px solid ${TOKENS.border}` }}>No records could be imported because every row was skipped.</div>}

      <h2 className="mt-6 text-sm font-semibold" style={{ color: TOKENS.text }}>Skipped records</h2>
      {result.skippedRecords.length ? (
        <div className="mt-2 rounded-lg overflow-hidden" style={{ border: `1px solid ${TOKENS.border}` }}><div className="overflow-auto max-h-[300px]"><table className="w-full text-sm border-collapse"><thead className="sticky top-0"><tr style={{ backgroundColor: TOKENS.bg }}><th className="table-heading">Source row</th><th className="table-heading">Status</th><th className="table-heading">Reason</th></tr></thead><tbody>{result.skippedRecords.map((record) => <tr key={`${record.sourceRowIndex}-${record.reason}`} style={{ backgroundColor: TOKENS.surface }}><td className="table-cell font-mono text-xs">{record.sourceRowIndex + 2}</td><td className="table-cell"><StatusBadge color={TOKENS.warning} bg="#F5DFCF" label="Skipped" /></td><td className="table-cell whitespace-normal">{record.reason}</td></tr>)}</tbody></table></div></div>
      ) : <div className="mt-2 rounded-lg px-5 py-6 text-sm flex items-center gap-2" style={{ backgroundColor: TOKENS.successSoft, color: TOKENS.success, border: `1px solid ${TOKENS.border}` }}><Check size={15} /> Every row passed validation.</div>}
    </section>
  );
}

export function ImportStep({ state, result, error, onRetry, onReset }) {
  if (state === "loading") return <LoadingState />;
  if (state === "error") return <ErrorState error={error} onRetry={onRetry} onReset={onReset} />;
  if (state === "success" && result) return <Results result={result} onReset={onReset} />;
  return null;
}
