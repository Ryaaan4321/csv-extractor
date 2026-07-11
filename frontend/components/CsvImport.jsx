"use client";

import { useState } from "react";
import { ProgressSchematic } from "./ProgressSchematic";
import { UploadStep } from "./UploadStep";
import { PreviewStep } from "./PreviewStep";
import { ImportStep } from "./ImportStep";
import { uploadCsv, extractCsv } from "@/lib/api";

export const TOKENS = {
  bg: "#F7F8FA",
  surface: "#FFFFFF",
  text: "#14171F",
  muted: "#5B6472",
  border: "#E4E7EC",
  accent: "#2451B0",
  accentSoft: "#EAF0FB",
  success: "#1F9D6C",
  successSoft: "#E7F6EF",
  warning: "#C4622D",
  warningSoft: "#FBEEE6",
};

export const TARGET_SCHEMA = [
  "created_at", "name", "email", "country_code", "mobile_without_country_code",
  "company", "city", "state", "country", "lead_owner", "crm_status",
  "crm_note", "data_source", "possession_time", "description",
];

export default function CsvImporterApp() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [upload, setUpload] = useState(null);
  const [result, setResult] = useState(null);
  const [importState, setImportState] = useState("idle");
  const [importError, setImportError] = useState("");

  const handleUpload = async (selectedFile) => {
    const data = await uploadCsv(selectedFile);
    setFile(selectedFile);
    setUpload(data);
    setStep(2);
    return data;
  };

  const handleConfirm = async () => {
    setStep(3);
    setImportState("loading");
    setImportError("");
    try {
      const data = await extractCsv(upload.uploadId);
      setResult(data);
      setImportState("success");
    } catch (error) {
      setImportError(error.message);
      setImportState("error");
    }
  };

  const reset = () => {
    setStep(1);
    setFile(null);
    setUpload(null);
    setResult(null);
    setImportState("idle");
    setImportError("");
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center py-8 sm:py-12 px-4 sm:px-6" style={{ backgroundColor: TOKENS.bg }}>
      <div className="mb-8 sm:mb-10 w-full max-w-md">
        <ProgressSchematic step={step} />
      </div>

      {step === 1 && <UploadStep onUpload={handleUpload} />}
      {step === 2 && (
        <PreviewStep
          file={file}
          upload={upload}
          onBack={reset}
          onConfirm={handleConfirm}
        />
      )}
      {step === 3 && (
        <ImportStep
          state={importState}
          result={result}
          error={importError}
          onRetry={handleConfirm}
          onReset={reset}
        />
      )}
    </main>
  );
}
