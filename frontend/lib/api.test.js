import { afterEach, describe, expect, it, vi } from "vitest";
import { extractCsv, uploadCsv } from "./api";

afterEach(() => vi.unstubAllGlobals());

describe("frontend API client", () => {
  it("returns validated upload data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "success", data: { uploadId: "id", headers: ["Name"], rowCount: 1, preview: [{ Name: "A" }] } }), { status: 201 })));
    await expect(uploadCsv(new File(["Name\nA"], "leads.csv"))).resolves.toMatchObject({ uploadId: "id", rowCount: 1 });
  });

  it("surfaces backend errors and rejects malformed success data", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: "error", message: "Upload expired" }), { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: "success", data: {} }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(extractCsv("id")).rejects.toThrow("Upload expired");
    await expect(extractCsv("id")).rejects.toThrow("response was incomplete");
  });

  it("provides a useful message when the server is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network")));
    await expect(extractCsv("id")).rejects.toThrow("server could not be reached");
  });
});
