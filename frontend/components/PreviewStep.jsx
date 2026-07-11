"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { SummaryStat } from "./SummaryStat";
import { TOKENS } from "./CsvImport";

export function PreviewStep({ file, upload, onBack, onConfirm }) {
  const [query, setQuery] = useState("");
  const rows = upload.preview;
  const headers = upload.headers;
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return rows;
    return rows.filter((row) => headers.some((header) => String(row[header] ?? "").toLowerCase().includes(normalizedQuery)));
  }, [headers, query, rows]);

  return (
    <section className="w-full max-w-5xl" aria-labelledby="preview-title">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 id="preview-title" className="text-2xl font-semibold tracking-tight font-heading" style={{ color: TOKENS.text }}>Review before import</h1>
          <p className="mt-1.5 text-sm" style={{ color: TOKENS.muted }}>
            <span className="font-medium" style={{ color: TOKENS.text }}>{file.name}</span> · {upload.rowCount} rows parsed. AI mapping starts only after confirmation.
          </p>
        </div>
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border self-start" style={{ borderColor: TOKENS.border, color: TOKENS.text }}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-5 sm:gap-6 px-4 py-3 rounded-lg" style={{ backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}>
        <SummaryStat label="Total rows" value={upload.rowCount} color={TOKENS.text} />
        <div className="w-px h-8" style={{ backgroundColor: TOKENS.border }} />
        <SummaryStat label="Preview rows" value={rows.length} color={TOKENS.accent} />
        <div className="sm:ml-auto text-xs basis-full sm:basis-auto" style={{ color: TOKENS.muted }}>All rows will be evaluated after confirmation.</div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: TOKENS.muted }}>Detected source columns</p>
        <div className="flex flex-wrap gap-2">
          {headers.map((header) => (
            <div key={header} className="px-2.5 py-1 rounded-md text-xs font-mono" style={{ backgroundColor: TOKENS.bg, border: `1px solid ${TOKENS.border}`, color: TOKENS.text }}>
              {header}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TOKENS.muted }} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search preview rows…" aria-label="Search preview rows" className="w-full pl-8 pr-3 py-2 rounded-md text-sm outline-none" style={{ backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}`, color: TOKENS.text }} />
      </div>

      <div className="mt-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${TOKENS.border}` }}>
        <div className="overflow-auto max-h-[420px]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr style={{ backgroundColor: TOKENS.bg }}>
                <th className="table-heading">#</th>
                {headers.map((header) => <th key={header} className="table-heading">{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, index) => (
                <tr key={index} style={{ backgroundColor: TOKENS.surface }}>
                  <td className="table-cell font-mono text-xs" style={{ color: TOKENS.muted }}>{String(rows.indexOf(row) + 1).padStart(2, "0")}</td>
                  {headers.map((header) => (
                    <td key={header} className="table-cell max-w-[240px] truncate" title={String(row[header] ?? "")}>
                      {row[header] ? String(row[header]) : <span style={{ color: TOKENS.muted }}>—</span>}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr><td colSpan={headers.length + 1} className="px-3 py-8 text-center text-sm" style={{ color: TOKENS.muted }}>No preview rows match &quot;{query}&quot;</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs" style={{ color: TOKENS.muted }}>AI will map all {upload.rowCount} rows into the GrowEasy CRM schema.</p>
        <button type="button" onClick={onConfirm} className="px-5 py-2.5 rounded-md text-sm font-medium" style={{ backgroundColor: TOKENS.accent, color: "#FFFFFF" }}>Confirm and import</button>
      </div>
    </section>
  );
}
