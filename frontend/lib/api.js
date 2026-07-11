class ApiError extends Error {}

async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new ApiError("The server could not be reached. Check your connection and try again.");
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("The server returned an unreadable response. Please try again.");
  }

  if (!response.ok) throw new ApiError(payload.message || "The request could not be completed.");
  if (payload?.status !== "success" || !payload.data) throw new ApiError("The server response was missing expected data.");
  return payload.data;
}

function assertUpload(data) {
  if (typeof data.uploadId !== "string" || !Array.isArray(data.headers) || !Array.isArray(data.preview) || !Number.isInteger(data.rowCount)) {
    throw new ApiError("The upload response was incomplete. Please upload the file again.");
  }
  return data;
}

function assertExtraction(data) {
  if (!Array.isArray(data.records) || !Array.isArray(data.skippedRecords) || !Number.isInteger(data.totalImported) || !Number.isInteger(data.totalSkipped)) {
    throw new ApiError("The extraction response was incomplete. Please retry the import.");
  }
  return data;
}

export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append("file", file);
  return assertUpload(await request("/api/upload", { method: "POST", body: formData }));
}

export async function extractCsv(uploadId) {
  return assertExtraction(await request("/api/extraction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId }),
  }));
}
