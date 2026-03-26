import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import Script from "next/script";

import { SiteFooter } from "@/shared/layout/site-footer";
import { SiteHeader } from "@/shared/layout/site-header";
import { getSafeSiteUrl } from "@/lib/env";
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

const themeInitScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("targetuz_theme");
    const theme = storedTheme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: getSafeSiteUrl(),
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" data-theme="dark" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
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
