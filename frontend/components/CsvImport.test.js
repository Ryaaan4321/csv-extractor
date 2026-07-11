import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CsvImporterApp from "./CsvImport";
import { ImportStep } from "./ImportStep";
import { extractCsv, uploadCsv } from "@/lib/api";

vi.mock("@/lib/api", () => ({ uploadCsv: vi.fn(), extractCsv: vi.fn() }));

const uploadResponse = {
  uploadId: "729bcae5-93e7-4cf4-82cb-0dfb10b39f4f",
  headers: ["Full Name", "Contact"],
  rowCount: 3,
  preview: [{ "Full Name": "Asha", Contact: "asha@example.com" }],
};

const extractionResponse = {
  records: [{ sourceRowIndex: 0, name: "Asha", email: "asha@example.com", created_at: null, country_code: null, mobile_without_country_code: null, company: null, city: null, state: null, country: null, lead_owner: null, crm_status: null, crm_note: null, data_source: "", possession_time: null, description: null }],
  skippedRecords: [{ sourceRowIndex: 1, reason: "Row has neither an email nor a mobile number" }],
  totalImported: 1,
  totalSkipped: 1,
};

describe("CSV importer workflow", () => {
  beforeEach(() => {
    uploadCsv.mockResolvedValue(uploadResponse);
    extractCsv.mockResolvedValue(extractionResponse);
  });

  it("uploads, previews real data, imports, renders results, and resets", async () => {
    const user = userEvent.setup();
    render(React.createElement(CsvImporterApp));
    const input = screen.getByLabelText("Choose CSV file");
    await user.upload(input, new File(["Full Name,Contact\nAsha,asha@example.com"], "leads.csv", { type: "text/csv" }));

    expect(await screen.findByRole("heading", { name: "Review before import" })).toBeInTheDocument();
    expect(screen.getByText("Asha")).toBeInTheDocument();
    expect(screen.getByText("3 rows parsed. AI mapping starts only after confirmation.", { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm and import" }));
    expect(await screen.findByRole("heading", { name: "Import complete" })).toBeInTheDocument();
    expect(screen.getByText("Row has neither an email nor a mobile number")).toBeInTheDocument();
    expect(screen.getByText("asha@example.com")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Import another CSV" }));
    expect(screen.getByRole("heading", { name: "Import leads" })).toBeInTheDocument();
  });

  it("renders upload failures and allows another attempt", async () => {
    uploadCsv.mockRejectedValue(new Error("The import service is unavailable."));
    render(React.createElement(CsvImporterApp));
    fireEvent.change(screen.getByLabelText("Choose CSV file"), { target: { files: [new File(["name\nA"], "leads.csv")] } });
    expect(await screen.findByRole("alert")).toHaveTextContent("The import service is unavailable.");
    expect(screen.getByRole("button", { name: /Try again/ })).toBeInTheDocument();
  });

  it("shows extraction failures and retries with the same upload", async () => {
    const user = userEvent.setup();
    extractCsv.mockRejectedValueOnce(new Error("Upload expired")).mockResolvedValueOnce(extractionResponse);
    render(React.createElement(CsvImporterApp));
    await user.upload(screen.getByLabelText("Choose CSV file"), new File(["name\nA"], "leads.csv"));
    await user.click(await screen.findByRole("button", { name: "Confirm and import" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Upload expired");
    await user.click(screen.getByRole("button", { name: /Retry/ }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Import complete" })).toBeInTheDocument());
  });

  it("renders the all-skipped and no-skipped empty states", () => {
    const { rerender } = render(React.createElement(ImportStep, {
      state: "success",
      result: { records: [], skippedRecords: extractionResponse.skippedRecords, totalImported: 0, totalSkipped: 1 },
      onReset: vi.fn(),
    }));
    expect(screen.getByText(/No records could be imported/)).toBeInTheDocument();

    rerender(React.createElement(ImportStep, {
      state: "success",
      result: { records: extractionResponse.records, skippedRecords: [], totalImported: 1, totalSkipped: 0 },
      onReset: vi.fn(),
    }));
    expect(screen.getByText("Every row passed validation.")).toBeInTheDocument();
  });
});
