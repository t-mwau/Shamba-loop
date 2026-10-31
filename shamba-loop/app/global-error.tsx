"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", fontFamily: "sans-serif" }}>
          <section style={{ maxWidth: "440px", textAlign: "center" }}>
            <h1>Something went wrong</h1>
            <p>Please try again. If the problem continues, contact our support team.</p>
            <button onClick={reset}>Try again</button>
          </section>
        </main>
      </body>
    </html>
  );
}
