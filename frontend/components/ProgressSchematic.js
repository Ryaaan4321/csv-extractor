"use client"
import { Check  } from "lucide-react";
import React from "react";
import { TOKENS } from "./CsvImport";
export function ProgressSchematic({ step }) {
  const steps = [
    { id: 1, label: "Upload" },
    { id: 2, label: "Preview" },
    { id: 3, label: "Import" },
  ];

  return (
    <div className="flex items-center w-full max-w-md">
      {steps.map((s, i) => {
        const state = s.id < step ? "done" : s.id === step ? "active" : "pending";
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-200"
                style={{
                  borderColor: state === "pending" ? TOKENS.border : TOKENS.accent,
                  backgroundColor: state === "done" ? TOKENS.accent : state === "active" ? TOKENS.surface : TOKENS.surface,
                }}
              >
                {state === "done" ? (
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <span
                    className="text-[11px] font-medium"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: state === "active" ? TOKENS.accent : TOKENS.muted,
                    }}
                  >
                    {String(s.id).padStart(2, "0")}
                  </span>
                )}
              </div>
              <span
                className="text-[11px] uppercase tracking-wide"
                style={{ color: state === "pending" ? TOKENS.muted : TOKENS.text, fontWeight: state === "active" ? 600 : 500 }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-2 mb-5" style={{ backgroundColor: s.id < step ? TOKENS.accent : TOKENS.border }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}