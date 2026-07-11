import { describe, expect, it } from "vitest";
import { MAX_CSV_SIZE, formatBytes, validateCsvFile } from "./csv";

describe("CSV validation", () => {
  it("accepts a non-empty CSV within the size limit", () => {
    expect(validateCsvFile(new File(["name\nAryan"], "leads.csv", { type: "text/csv" }))).toBeNull();
  });

  it("rejects invalid extensions, empty files, and oversized files", () => {
    expect(validateCsvFile(new File(["data"], "leads.txt"))).toMatch(/Only \.csv/);
    expect(validateCsvFile(new File([], "empty.csv"))).toMatch(/empty/);
    expect(validateCsvFile({ name: "large.csv", size: MAX_CSV_SIZE + 1 })).toMatch(/10 MB/);
  });

  it("formats common file sizes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
  });
});
