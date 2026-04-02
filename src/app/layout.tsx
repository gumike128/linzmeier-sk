import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { PublicSessionProvider } from "@/components/PublicSessionProvider";
import { MaintenanceBanner } from "@/components/MaintenanceBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LINZMEIER.SK | Prémiová polyuretánová izolácia LINITHERM pre stavebníctvo",
  description:
    "LINITHERM polyuretánová izolácia od Linzmeier Bauelemente GmbH. 75+ rokov skúseností, certifikát pure life, výroba v Nemecku. Šikmá strecha, plochá strecha, strop, fasáda, podlaha.",
  keywords: [
    "LINITHERM",
    "polyuretánová izolácia",
    "PU panely",
    "zateplenie strechy",
    "zateplenie podlahy",
    "prevetrávaná fasáda",
    "LINZMEIER",
    "termoizolácia",
    "zateplovacie panely",
    "izolačné panely",
    "energetická efektívnosť",
    "Slovensko",
    "nemecká kvalita",
    "certifikát pure life",
    "STN",
    "BIM",
  ],
  authors: [{ name: "LINZMEIER" }],
  openGraph: {
    title: "LINZMEIER.SK | Prémiová polyuretánová izolácia LINITHERM",
    description:
      "LINITHERM polyuretánová izolácia od Linzmeier Bauelemente GmbH. 75+ rokov skúseností, výroba v Nemecku, certifikát pure life. Šikmá strecha, plochá strecha, fasáda, podlaha, strop.",
    type: "website",
    locale: "sk_SK",
    siteName: "LINZMEIER.SK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Google Analytics – replace GA_MEASUREMENT_ID with real ID */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <PublicSessionProvider>
            {children}
            <MaintenanceBanner />
          </PublicSessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
