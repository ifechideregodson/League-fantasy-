import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aster Research — AI Research Workspace",
  description: "A unified workspace for evidence-led academic research and scientific discovery."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
