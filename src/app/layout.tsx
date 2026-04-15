import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://rallyeclub-klostertal.at"),
  title: {
    default: "Rallyeclub Klostertal — Motorsport im Klostertal",
    template: "%s · Rallyeclub Klostertal",
  },
  description:
    "Offizielle Webseite des Rallyeclub Klostertal aus Vorarlberg. Autoslalom, Clubausfahrten, News und Termine aus dem Klostertal.",
  keywords: ["Rallyeclub", "Klostertal", "Autoslalom", "Motorsport", "Vorarlberg", "Frastanz"],
  openGraph: {
    title: "Rallyeclub Klostertal",
    description: "Motorsport aus dem Klostertal — News, Termine und Galerie.",
    locale: "de_AT",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-AT" className={`${inter.variable} ${bebas.variable}`}>
      <body className="min-h-screen bg-white text-ink">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
