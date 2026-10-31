import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { MarketplaceProvider } from "@/components/MarketplaceProvider";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShambaLoop — Turn farm waste into income",
  description: "A trusted marketplace connecting Kenyan farmers with nearby processors who value agricultural waste.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <MarketplaceProvider>
            <SiteHeader />
            <main>{children}</main>
            <footer className="site-footer">
              <span className="brand footer-brand"><span className="brand-mark" aria-hidden="true">s</span><span>shamba<span className="brand-light">loop</span></span></span>
              <span>Waste less. Earn more. Grow together.</span>
              <span>Made for Kenya <span aria-hidden="true">♥</span></span>
            </footer>
          </MarketplaceProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}