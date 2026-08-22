import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "EE ZONE - Electrical & Electronics Engineering Hub",
  description: "Next-Generation Electrical & Electronics Engineering Suite with Real-Time SPICE Physics, Microprocessors & Virtual Workstations",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/logo/ee-zone-app-icon.jpg" },
      { url: "/images/logo/ee-zone-app-icon.jpg", sizes: "192x192", type: "image/jpeg" },
      { url: "/images/logo/ee-zone-app-icon.jpg", sizes: "512x512", type: "image/jpeg" }
    ],
    apple: [
      { url: "/images/logo/ee-zone-app-icon.jpg", sizes: "180x180", type: "image/jpeg" }
    ],
    shortcut: "/images/logo/ee-zone-app-icon.jpg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="e24d0c9e-e4fc-4077-96b8-bf644fe969e3"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <SiteHeader />
        {children}
        <Footer />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}