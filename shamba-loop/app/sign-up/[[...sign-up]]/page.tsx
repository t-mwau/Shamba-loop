import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <div className="page-wrap" style={{ display: "grid", placeItems: "center" }}>
      <Suspense>
        <SignUp
          signInUrl="/sign-in"
          fallbackRedirectUrl="/farmer"
          appearance={{ variables: { colorPrimary: "#2e694d", colorForeground: "#1d3129" } }}
        />
      </Suspense>
    </div>
  );
}
