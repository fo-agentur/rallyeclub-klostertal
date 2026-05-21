import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { listSponsors } from "@/lib/queries/sponsors";

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

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL("https://rallyeclub-klostertal.at"),
  title: {
    default: "Rallyeclub Klostertal — Motorsport im Klostertal",
    template: "%s · Rallyeclub Klostertal",
  },
  description:
    "Offizielle Webseite des Rallyeclub Klostertal aus Vorarlberg. Autoslalom, Clubausfahrten, News und Termine aus dem Klostertal.",
  keywords: ["Rallyeclub", "Klostertal", "Autoslalom", "Motorsport", "Vorarlberg", "Frastanz"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rallyeclub Klostertal — Motorsport im Klostertal",
    description: "Motorsport aus dem Klostertal — News, Termine und Galerie.",
    url: "https://rallyeclub-klostertal.at",
    siteName: "Rallyeclub Klostertal",
    locale: "de_AT",
    type: "website",
    images: [
      {
        url: "/images/headers/hero-hq-1.png",
        width: 1920,
        height: 1080,
        alt: "Rallyeclub Klostertal — Autoslalom",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rallyeclub Klostertal",
    description: "Motorsport aus dem Klostertal.",
    images: ["/images/headers/hero-hq-1.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sponsors = await listSponsors();

  return (
    <html lang="de-AT" className={`${inter.variable} ${bebas.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-white text-ink">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter sponsors={sponsors} />
      </body>
    </html>
  );
}
