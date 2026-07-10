"use client"
import { UploadCloud, FileText, Search, Check, X, ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { formatBytes } from "./CsvImport";
import { useState } from "react";
import { useRef } from "react";
import { useEffect,useCallback } from "react";
import { TOKENS } from "./CsvImport";
import { MOCK_ROWS } from "./CsvImport";
export function UploadStep({ onFileReady }) {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState("empty"); 
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);
  const progressRef = useRef(null);
  const MAX_SIZE = 5 * 1024 * 1024;
  const validate = (f) => {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      return "Only .csv files are supported.";
    }
    if (f.size > MAX_SIZE) {
      return `File exceeds the 5 MB limit (${formatBytes(f.size)}).`;
    }
    if (f.size === 0) {
      return "This file is empty.";
    }
    return null;
  };

  const beginUpload = useCallback((f) => {
    const err = validate(f);
    if (err) {
      setStatus("invalid");
      setErrorMsg(err);
      setFile(f);
      return;
    }
    setStatus("uploading");
    setErrorMsg("");
    setFile(f);
    setProgress(0);

    clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.max(4, (100 - p) * 0.18);
        if (next >= 100) {
          clearInterval(progressRef.current);
          setStatus("uploaded");
          return 100;
        }
        return next;
      });
    }, 90);
  }, []);

  useEffect(() => () => clearInterval(progressRef.current), []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) beginUpload(f);
  };

  const handleBrowse = (e) => {
    const f = e.target.files?.[0];
    if (f) beginUpload(f);
    e.target.value = "";
  };

  const handleReplace = () => {
    clearInterval(progressRef.current);
    setStatus("empty");
    setFile(null);
    setProgress(0);
    setErrorMsg("");
  };

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight" style={{ color: TOKENS.text, fontFamily: "'Sora', sans-serif" }}>
        Import leads
      </h1>
      <p className="mt-1.5 text-sm" style={{ color: TOKENS.muted }}>
        Upload a CSV export from any source system. You'll review the rows before anything is written to the CRM.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
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
            <p className="mt-4 text-sm font-medium" style={{ color: TOKENS.text }}>
              Drag and drop a CSV file here
            </p>
            <p className="mt-1 text-xs" style={{ color: TOKENS.muted }}>
              or
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-3 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ backgroundColor: TOKENS.accent, color: "#FFFFFF" }}
            >
              Browse file
            </button>
            <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleBrowse} />
            <p className="mt-4 text-xs" style={{ color: TOKENS.muted }}>
              CSV only · Max 5 MB · UTF-8 encoding
            </p>
          </div>
        )}

        {status === "uploading" && file && (
          <div className="py-10 px-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: TOKENS.accentSoft }}>
                <FileText size={16} color={TOKENS.accent} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: TOKENS.text }}>{file.name}</p>
                <p className="text-xs" style={{ color: TOKENS.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatBytes(file.size)} · Uploading…
                </p>
              </div>
              <span className="text-xs tabular-nums" style={{ color: TOKENS.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: TOKENS.border }}>
              <div className="h-full rounded-full transition-all duration-150" style={{ width: `${progress}%`, backgroundColor: TOKENS.accent }} />
            </div>
          </div>
        )}

        {status === "uploaded" && file && (
          <div className="py-8 px-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: TOKENS.successSoft }}>
                <Check size={16} color={TOKENS.success} strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: TOKENS.text }}>{file.name}</p>
                <p className="text-xs" style={{ color: TOKENS.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatBytes(file.size)} · {MOCK_ROWS.length} rows detected
                </p>
              </div>
              <button
                onClick={handleReplace}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors"
                style={{ borderColor: TOKENS.border, color: TOKENS.muted }}
              >
                <RefreshCw size={12} />
                Replace
              </button>
            </div>
          </div>
        )}

        {status === "invalid" && file && (
          <div className="py-8 px-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: TOKENS.warningSoft }}>
                <AlertTriangle size={16} color={TOKENS.warning} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: TOKENS.text }}>{file.name}</p>
                <p className="text-xs mt-0.5" style={{ color: TOKENS.warning }}>{errorMsg}</p>
              </div>
              <button
                onClick={handleReplace}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors"
                style={{ borderColor: TOKENS.border, color: TOKENS.muted }}
              >
                <RefreshCw size={12} />
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

      {status === "uploaded" && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onFileReady(file)}
            className="px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
            style={{ backgroundColor: TOKENS.accent, color: "#FFFFFF" }}
          >
            Continue to preview
          </button>
        </div>
      )}
    </div>
  );
}