import { proxyToDjango } from "@/lib/django-api";

export async function GET() {
  return proxyToDjango("/api/marketplace/", "GET");
}
