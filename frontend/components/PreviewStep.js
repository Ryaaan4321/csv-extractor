"use client"
import {  Search, ArrowLeft } from "lucide-react";
import { SummaryStat } from "./SummaryStat";
import { StatusBadge } from "./StatusBadge";
import { MOCK_ROWS } from "./CsvImport";
import { RAW_HEADERS } from "./CsvImport";
import { HEADER_MAP } from "./CsvImport";
import { TOKENS } from "./CsvImport";
import { rowWillBeSkipped } from "./CsvImport";
import { useState } from "react";
export function PreviewStep({ file, onBack, onConfirm }) {
  const [query, setQuery] = useState("");

  const flaggedCount = useMemo(() => MOCK_ROWS.filter(rowWillBeSkipped).length, [/*static mock*/]);
  const readyCount = MOCK_ROWS.length - flaggedCount;

  const filteredRows = useMemo(() => {
    if (!query.trim()) return MOCK_ROWS;
    const q = query.toLowerCase();
    return MOCK_ROWS.filter((row) => RAW_HEADERS.some((h) => (row[h] || "").toLowerCase().includes(q)));
  }, [query]);

  return (
    <div className="w-full max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: TOKENS.text, fontFamily: "'Sora', sans-serif" }}>
            Review before import
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: TOKENS.muted }}>
            <span className="font-medium" style={{ color: TOKENS.text }}>{file?.name}</span> · {MOCK_ROWS.length} rows parsed. Mapping is confirmed by the extraction step after you import.
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border transition-colors flex-shrink-0"
          style={{ borderColor: TOKENS.border, color: TOKENS.text }}
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </div>
      <div className="mt-5 flex items-center gap-6 px-4 py-3 rounded-lg" style={{ backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}>
        <SummaryStat label="Total rows" value={MOCK_ROWS.length} color={TOKENS.text} />
        <div className="w-px h-8" style={{ backgroundColor: TOKENS.border }} />
        <SummaryStat label="Ready to import" value={readyCount} color={TOKENS.success} />
        <div className="w-px h-8" style={{ backgroundColor: TOKENS.border }} />
        <SummaryStat label="Will be skipped" value={flaggedCount} color={flaggedCount > 0 ? TOKENS.warning : TOKENS.muted} />
        <div className="ml-auto text-xs" style={{ color: TOKENS.muted }}>
          Skipped rows have no email and no phone number.
        </div>
      </div>
      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: TOKENS.muted }}>
          Detected column mapping <span className="normal-case font-normal">(confirmed by AI on import — not editable here)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {RAW_HEADERS.map((h) => {
            const target = HEADER_MAP[h.toLowerCase()];
            return (
              <div
                key={h}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs"
                style={{ backgroundColor: TOKENS.bg, border: `1px solid ${TOKENS.border}` }}
              >
                <span style={{ color: TOKENS.text, fontFamily: "'JetBrains Mono', monospace" }}>{h}</span>
                <span style={{ color: TOKENS.muted }}>→</span>
                <span style={{ color: target ? TOKENS.accent : TOKENS.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {target || "unmapped"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="mt-5 relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TOKENS.muted }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rows…"
          className="w-full pl-8 pr-3 py-2 rounded-md text-sm outline-none transition-colors"
          style={{ backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}`, color: TOKENS.text }}
        />
      </div>

      {/* Table */}
      <div className="mt-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${TOKENS.border}` }}>
        <div className="overflow-auto max-h-[420px]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr style={{ backgroundColor: TOKENS.bg }}>
                <th className="text-left px-3 py-2 text-xs font-medium uppercase tracking-wide border-b" style={{ color: TOKENS.muted, borderColor: TOKENS.border, fontFamily: "'JetBrains Mono', monospace" }}>#</th>
                {RAW_HEADERS.map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-medium uppercase tracking-wide border-b whitespace-nowrap" style={{ color: TOKENS.muted, borderColor: TOKENS.border }}>
                    {h}
                  </th>
                ))}
                <th className="text-left px-3 py-2 text-xs font-medium uppercase tracking-wide border-b" style={{ color: TOKENS.muted, borderColor: TOKENS.border }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => {
                const skipped = rowWillBeSkipped(row);
                return (
                  <tr
                    key={i}
                    style={{ backgroundColor: skipped ? TOKENS.warningSoft : TOKENS.surface }}
                    className="transition-colors"
                  >
                    <td className="px-3 py-2 whitespace-nowrap border-b" style={{ borderColor: TOKENS.border, color: TOKENS.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>
                      {String(MOCK_ROWS.indexOf(row) + 1).padStart(2, "0")}
                    </td>
                    {RAW_HEADERS.map((h) => (
                      <td key={h} className="px-3 py-2 whitespace-nowrap border-b max-w-[220px] truncate" style={{ borderColor: TOKENS.border, color: TOKENS.text }} title={row[h]}>
                        {row[h] ? row[h] : <span style={{ color: TOKENS.muted }}>—</span>}
                      </td>
                    ))}
                    <td className="px-3 py-2 whitespace-nowrap border-b" style={{ borderColor: TOKENS.border }}>
                      {skipped ? (
                        <StatusBadge color={TOKENS.warning} bg="#F5DFCF" label="Skip" />
                      ) : (
                        <StatusBadge color={TOKENS.success} bg="#D3EDE0" label="OK" />
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={RAW_HEADERS.length + 2} className="px-3 py-8 text-center text-sm" style={{ color: TOKENS.muted }}>
                    No rows match "{query}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs" style={{ color: TOKENS.muted }}>
          {readyCount} of {MOCK_ROWS.length} rows will be imported into the CRM.
        </p>
        <button
          onClick={onConfirm}
          className="px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
          style={{ backgroundColor: TOKENS.accent, color: "#FFFFFF" }}
        >
          Confirm and import {readyCount} rows
        </button>
      </div>
    </div>
  );
}