"use client";

import { useRef, useState } from "react";
import { AlertTriangle, FileText, RefreshCw, UploadCloud } from "lucide-react";
import { TOKENS } from "./CsvImport";
import { formatBytes, validateCsvFile } from "@/lib/csv";

export function UploadStep({ onUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState("empty");
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);

  const beginUpload = async (selectedFile) => {
    const validationError = validateCsvFile(selectedFile);
    setFile(selectedFile);
    if (validationError) {
      setStatus("invalid");
      setErrorMsg(validationError);
      return;
    }

    setStatus("uploading");
    setErrorMsg("");
    try {
      await onUpload(selectedFile);
    } catch (error) {
      setStatus("invalid");
      setErrorMsg(error.message);
    }
  };

  const reset = () => {
    setStatus("empty");
    setFile(null);
    setErrorMsg("");
  };

  return (
    <section className="w-full max-w-2xl" aria-labelledby="upload-title">
      <h1 id="upload-title" className="text-2xl font-semibold tracking-tight font-heading" style={{ color: TOKENS.text }}>
        Import leads
      </h1>
      <p className="mt-1.5 text-sm" style={{ color: TOKENS.muted }}>
        Upload a CSV export from any source system. You&apos;ll review the rows before anything is written to the CRM.
      </p>

      <div
        onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          const selectedFile = event.dataTransfer.files?.[0];
          if (selectedFile) beginUpload(selectedFile);
        }}
        className="mt-6 rounded-lg border-2 border-dashed transition-colors duration-150"
        style={{
          borderColor: dragActive ? TOKENS.accent : status === "invalid" ? TOKENS.warning : TOKENS.border,
          backgroundColor: dragActive ? TOKENS.accentSoft : TOKENS.surface,
        }}
      >
        {status === "empty" && (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: TOKENS.accentSoft }}>
              <UploadCloud size={20} color={TOKENS.accent} />
            </div>
            <p className="mt-4 text-sm font-medium" style={{ color: TOKENS.text }}>Drag and drop a CSV file here</p>
            <p className="mt-1 text-xs" style={{ color: TOKENS.muted }}>or</p>
            <button type="button" onClick={() => inputRef.current?.click()} className="mt-3 px-4 py-2 rounded-md text-sm font-medium" style={{ backgroundColor: TOKENS.accent, color: "#FFFFFF" }}>
              Browse file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              aria-label="Choose CSV file"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];
                if (selectedFile) beginUpload(selectedFile);
                event.target.value = "";
              }}
            />
            <p className="mt-4 text-xs" style={{ color: TOKENS.muted }}>CSV only · Max 10 MB · UTF-8 encoding</p>
          </div>
        )}

        {status === "uploading" && file && (
          <div className="py-10 px-8" role="status" aria-live="polite">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: TOKENS.accentSoft }}>
                <FileText size={16} color={TOKENS.accent} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: TOKENS.text }}>{file.name}</p>
                <p className="text-xs font-mono" style={{ color: TOKENS.muted }}>{formatBytes(file.size)} · Uploading and parsing…</p>
              </div>
              <span className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${TOKENS.accent} transparent ${TOKENS.accent} ${TOKENS.accent}` }} />
            </div>
            <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: TOKENS.border }}>
              <div className="h-full w-1/3 rounded-full import-progress" style={{ backgroundColor: TOKENS.accent }} />
            </div>
          </div>
        )}

        {status === "invalid" && file && (
          <div className="py-8 px-8" role="alert">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: TOKENS.warningSoft }}>
                <AlertTriangle size={16} color={TOKENS.warning} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: TOKENS.text }}>{file.name}</p>
                <p className="text-xs mt-0.5" style={{ color: TOKENS.warning }}>{errorMsg}</p>
              </div>
              <button type="button" onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border" style={{ borderColor: TOKENS.border, color: TOKENS.muted }}>
                <RefreshCw size={12} /> Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
