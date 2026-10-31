import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="ShambaLoop home">
        <span className="brand-mark" aria-hidden="true">s</span>
        <span>shamba<span className="brand-light">loop</span></span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/processor">Find supply</Link>
        <Link href="/farmer">Farmer dashboard</Link>
      </nav>
      <div className="header-actions">
        <Suspense fallback={null}>
          <Show when="signed-out">
            <Link className="header-sign-in" href="/sign-in">Sign in</Link>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </Suspense>
        <Link className="header-cta" href="/farmer/new-listing">
          List your waste <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
