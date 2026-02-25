import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://targetuz.uz"),
  title: {
    default: "TargetUZ | Instagram va Meta Ads mutaxassislari platformasi",
    template: "%s | TargetUZ",
  },
  description:
    "O'zbekiston bozori uchun Instagram va Meta Ads target mutaxassislarini topish, natijali portfolio ko'rish va escrow orqali xavfsiz to'lov qilish platformasi.",
  openGraph: {
    title: "TargetUZ",
    description:
      "Instagram va Meta Ads bo'yicha tekshirilgan mutaxassislar, aniq CTR/CPC/ROI natijalari va xavfsiz escrow to'lov tizimi.",
    locale: "uz_UZ",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
  keywords: [
    "instagram target",
    "meta ads mutaxassis",
    "targetolog uzbekiston",
    "payme click escrow",
    "reklama mutaxassisi",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} bg-slate-950 text-slate-100 antialiased`}>
        <Providers>
          <div className="relative min-h-screen overflow-x-hidden">
            <div className="fixed inset-0 -z-10 bg-app-grid opacity-70" />
            <div className="fixed inset-0 -z-10 bg-app-gradient" />
            <SiteHeader />
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
