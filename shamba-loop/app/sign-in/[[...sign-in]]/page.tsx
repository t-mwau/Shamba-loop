import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <div className="page-wrap" style={{ display: "grid", placeItems: "center" }}>
      <Suspense>
        <SignIn
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/farmer"
          appearance={{ variables: { colorPrimary: "#2e694d", colorForeground: "#1d3129" } }}
        />
      </Suspense>
    </div>
  );
}
