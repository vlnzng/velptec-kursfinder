import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Kursfinder Prototyp",
  description: "Zwei Varianten eines KI-Kursfinders zum Vergleich. Die KI-Antworten sind simuliert.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${atkinson.variable} antialiased`}>
      <body className="min-h-dvh font-sans text-base">{children}</body>
    </html>
  );
}
