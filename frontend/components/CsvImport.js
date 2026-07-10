"use client"
import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { UploadCloud, FileText, Search, Check, X, ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { ProgressSchematic } from "./ProgressSchematic";
import { UploadStep } from "./UploadStep";
import { PreviewStep } from "./PreviewStep";
import { SummaryStat } from "./SummaryStat";
import { StatusBadge } from "./StatusBadge";
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
export const HEADER_MAP = {
  "name": "name",
  "email": "email",
  "phone": "mobile_without_country_code",
  "alt phone": "→ crm_note",
  "project": "data_source",
  "city": "city",
  "state": "state",
  "enquiry date": "created_at",
  "assigned to": "lead_owner",
  "remarks": "crm_note",
};
export const RAW_HEADERS = ["Name", "Email", "Phone", "Alt Phone", "Project", "City", "State", "Enquiry Date", "Assigned To", "Remarks"];

export const MOCK_ROWS = [
  { "Name": "Ritika Sahni", "Email": "ritika.sahni@gmail.com", "Phone": "9876543210", "Alt Phone": "", "Project": "meridian_tower", "City": "Bengaluru", "State": "Karnataka", "Enquiry Date": "2026-06-14", "Assigned To": "Vivek Rao", "Remarks": "Interested in 3BHK, wants site visit" },
  { "Name": "Mohd. Arshad", "Email": "", "Phone": "9123456780", "Alt Phone": "9988776655", "Project": "eden_park", "City": "Bengaluru", "State": "Karnataka", "Enquiry Date": "12/06/2026", "Assigned To": "Priya Nair", "Remarks": "Called twice, no response" },
  { "Name": "Deepa Krishnan", "Email": "deepa.k@outlook.com", "Phone": "", "Alt Phone": "", "Project": "", "City": "Chennai", "State": "Tamil Nadu", "Enquiry Date": "2026-06-10", "Assigned To": "Vivek Rao", "Remarks": "Source unclear, from referral" },
  { "Name": "Suresh Iyer", "Email": "", "Phone": "", "Alt Phone": "", "Project": "sarjapur_plots", "City": "Bengaluru", "State": "Karnataka", "Enquiry Date": "2026-06-09", "Assigned To": "Priya Nair", "Remarks": "Duplicate entry from last week" },
  { "Name": "Farah Sheikh", "Email": "farah.sheikh91@yahoo.com", "Phone": "+91 9845098450", "Alt Phone": "", "Project": "varah_swamy", "City": "Hyderabad", "State": "Telangana", "Enquiry Date": "2026-06-15", "Assigned To": "Vivek Rao", "Remarks": "Sale closed last quarter, follow up for referral" },
  { "Name": "Anand Chetty", "Email": "anand.chetty@gmail.com; a.chetty@work.com", "Phone": "9012345678", "Alt Phone": "", "Project": "eden_park", "City": "Bengaluru", "State": "Karnataka", "Enquiry Date": "2026-06-13", "Assigned To": "Priya Nair", "Remarks": "Prefers evening calls" },
  { "Name": "Kavya Reddy", "Email": "kavya.reddy@gmail.com", "Phone": "9871234560", "Alt Phone": "", "Project": "meridian_tower", "City": "Bengaluru", "State": "Karnataka", "Enquiry Date": "32/13/2026", "Assigned To": "Vivek Rao", "Remarks": "Budget mismatch, marked cold" },
  { "Name": "Imran Qureshi", "Email": "imran.q@gmail.com", "Phone": "9090909090", "Alt Phone": "8080808080", "Project": "", "City": "Bengaluru", "State": "Karnataka", "Enquiry Date": "2026-06-08", "Assigned To": "Priya Nair", "Remarks": "" },
  { "Name": "Neha Bhatt", "Email": "neha.bhatt@gmail.com", "Phone": "9765432109", "Alt Phone": "", "Project": "sarjapur_plots", "City": "Bengaluru", "State": "Karnataka", "Enquiry Date": "2026-06-16", "Assigned To": "Vivek Rao", "Remarks": "Wants possession within 6 months" },
  { "Name": "Rahul Menon", "Email": "", "Phone": "", "Alt Phone": "", "Project": "meridian_tower", "City": "Kochi", "State": "Kerala", "Enquiry Date": "2026-06-05", "Assigned To": "Priya Nair", "Remarks": "Bad number, unreachable" },
  { "Name": "Sanjana Rao", "Email": "sanjana.rao@gmail.com", "Phone": "9345612780", "Alt Phone": "", "Project": "varah_swamy", "City": "Bengaluru", "State": "Karnataka", "Enquiry Date": "2026-06-11", "Assigned To": "Vivek Rao", "Remarks": "Site visit scheduled for weekend" },
  { "Name": "Tariq Ahmed", "Email": "tariq.ahmed@hotmail.com", "Phone": "9988001122", "Alt Phone": "", "Project": "eden_park", "City": "Bengaluru", "State": "Karnataka", "Enquiry Date": "2026-06-07", "Assigned To": "Priya Nair", "Remarks": "Follow up next month" },
];

export function rowWillBeSkipped(row) {
  const hasEmail = Boolean(row["Email"] && row["Email"].trim());
  const hasPhone = Boolean(row["Phone"] && row["Phone"].trim()) || Boolean(row["Alt Phone"] && row["Alt Phone"].trim());
  return !hasEmail && !hasPhone;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CsvImporterApp() {
  const [step, setStep] = useState(1); 
  const [file, setFile] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-12 px-6" style={{ backgroundColor: TOKENS.bg, fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-10">
        <ProgressSchematic step={step} />
      </div>

      {step === 1 && (
        <UploadStep
          onFileReady={(f) => { setFile(f); setStep(2); }}
        />
      )}

      {step === 2 && (
        <PreviewStep
          file={file}
          onBack={() => setStep(1)}
          onConfirm={() => window.alert("Import step not built yet — this is where the AI extraction pipeline would run.")}
        />
      )}
    </div>
  );
}