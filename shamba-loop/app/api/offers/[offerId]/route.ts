import { NextResponse } from "next/server";
import { proxyToDjango } from "@/lib/django-api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ offerId: string }> },
) {
  const { offerId } = await params;
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(offerId)) {
    return NextResponse.json({ error: "Choose a valid offer." }, { status: 400 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch (error) {
    console.error("Could not read offer response.", error);
    return NextResponse.json({ error: "Send a valid response." }, { status: 400 });
  }
  return proxyToDjango(`/api/offers/${encodeURIComponent(offerId)}/`, "PATCH", body);
}
