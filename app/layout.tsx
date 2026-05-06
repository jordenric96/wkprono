import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WK Pronostiek 2026",
  description: "Website in opbouw",
  manifest: '/manifest.ts', // Koppeling naar het manifest
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        {children}
      </body>
    </html>
  );
}
