export const MAX_CSV_SIZE = 10 * 1024 * 1024;

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateCsvFile(file) {
  if (!file?.name?.toLowerCase().endsWith(".csv")) return "Only .csv files are supported.";
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_CSV_SIZE) return `File exceeds the 10 MB limit (${formatBytes(file.size)}).`;
  return null;
}
