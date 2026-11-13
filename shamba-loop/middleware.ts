import { clerkMiddleware } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";
import { NextResponse, type NextRequest } from "next/server";

const isProtectedPage = (pathname: string) => /^\/(?:farmer|processor)(?:\/|$)/.test(pathname);
const authPaths = new Set(["/sign-in", "/sign-up"]);
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const rateLimitHashSecret = process.env.RATE_LIMIT_HASH_SECRET;

const redis = upstashUrl && upstashToken ? new Redis({ url: upstashUrl, token: upstashToken }) : null;
const generalLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "1 m"),
      analytics: false,
      prefix: "shambaloop:global",
    })
  : null;
const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "10 m"),
      analytics: false,
      prefix: "shambaloop:auth",
    })
  : null;

if (
  process.env.NODE_ENV !== "production" &&
  (!generalLimiter || !authLimiter || !rateLimitHashSecret || rateLimitHashSecret.length < 32)
) {
  console.warn("Upstash rate limiting is disabled in this environment; configure it before production.");
}

async function hashIdentifier(value: string) {
  if (!rateLimitHashSecret) {
    throw new Error("RATE_LIMIT_HASH_SECRET is required when Upstash rate limiting is enabled.");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(rateLimitHashSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));

  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function rateLimitResponse(request: NextRequest, status: 429 | 503, retryAfter?: number) {
  const headers = retryAfter ? { "Retry-After": String(retryAfter) } : undefined;
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: status === 429 ? "Too many requests. Please try again shortly." : "Service temporarily unavailable." },
      { status, headers },
    );
  }

  const destination = status === 429 ? "/rate-limit" : "/service-unavailable";
  return NextResponse.rewrite(new URL(destination, request.url), { status, headers });
}

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;
  const apiRequest = pathname.startsWith("/api/");
  const authRequest = authPaths.has(pathname);
  const isRateLimitedRequest = apiRequest || authRequest || isProtectedPage(pathname);

  if (isRateLimitedRequest) {
    if (!generalLimiter || !authLimiter || !rateLimitHashSecret || rateLimitHashSecret.length < 32) {
      if (process.env.NODE_ENV === "production") {
        console.error("Rate limiting is unavailable: configure Upstash Redis and a 32-character RATE_LIMIT_HASH_SECRET.");
        return rateLimitResponse(request, 503);
      }
    } else {
      try {
        const { userId } = await auth();
        const forwardedFor = request.headers.get("x-forwarded-for");
        const clientIp = forwardedFor?.split(",")[0]?.trim();

        if (!userId && !clientIp) {
          console.error("Rate limiting could not identify the client request.");
          return rateLimitResponse(request, 503);
        }

        const subject = userId ? `user:${userId}` : `ip:${clientIp}`;
        const identifier = await hashIdentifier(subject);
        const limiter = authRequest ? authLimiter : generalLimiter;
        const { success, reset } = await limiter.limit(identifier);

        if (!success) {
          const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
          return rateLimitResponse(request, 429, retryAfter);
        }
      } catch (error) {
        console.error("Upstash rate-limit check failed.", error);
        return rateLimitResponse(request, 503);
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
