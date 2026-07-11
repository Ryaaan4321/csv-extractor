const BACKEND_API_URL = (process.env.BACKEND_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export async function proxyPost(path, init) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/${path}`, { method: "POST", cache: "no-store", ...init });
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
    });
  } catch {
    return Response.json(
      { status: "error", message: "The import service is unavailable. Please try again shortly." },
      { status: 502 },
    );
  }
}
