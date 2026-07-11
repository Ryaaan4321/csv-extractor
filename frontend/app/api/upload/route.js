import { proxyPost } from "@/lib/proxy";

export async function POST(request) {
  const formData = await request.formData();
  return proxyPost("upload", { body: formData });
}
