import { NextResponse } from "next/server";
import { proxyToDjango } from "@/lib/django-api";

export async function POST(request: Request) {
  let body: string;
  try {
    body = await request.text();
  } catch (error) {
    console.error("Could not read offer request.", error);
    return NextResponse.json({ error: "Send valid offer details." }, { status: 400 });
  }
  return proxyToDjango("/api/offers/", "POST", body);
}
