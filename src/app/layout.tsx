import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { TabBar } from "@/components/TabBar";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DoseMate — Medication Tracker",
  description: "Track your daily medication, never miss a dose.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f9d8a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={geist.variable}>
        <div className="phone-shell">
          <div className="pb-24">{children}</div>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
