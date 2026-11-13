import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type ProxyMethod = "GET" | "POST" | "PATCH";

export async function proxyToDjango(
  path: string,
  method: ProxyMethod,
  body?: string,
): Promise<NextResponse> {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Your session has expired. Sign in again." }, { status: 401 });
  }

  const baseUrl = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";
  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch (error) {
      console.error("Django API returned an invalid response.", error);
      return NextResponse.json(
        { error: "The service returned an unexpected response. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json(responseBody, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Django API request failed.", error);
    return NextResponse.json(
      { error: "Marketplace service is unavailable. Please try again shortly." },
      { status: 503 },
    );
  }
}
