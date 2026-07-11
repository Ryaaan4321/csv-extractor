import { proxyPost } from "@/lib/proxy";

export async function POST(request) {
  const body = await request.text();
  return proxyPost("extraction", { headers: { "Content-Type": "application/json" }, body });
}
