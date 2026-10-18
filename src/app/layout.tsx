import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LenisProvider } from "@/providers/LenisProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Muhammad Rehan | Electronic Engineering & IoT Portfolio",
  description:
    "Portfolio of Muhammad Rehan — Electronic Engineering Student, IoT Engineer, Research Enthusiast, and Software Tester at Universitas Muhammadiyah Riau. Specializing in IoT, Embedded Systems, and Web Development.",
  keywords: [
    "Muhammad Rehan",
    "Electronic Engineering",
    "IoT Engineer",
    "Embedded Systems",
    "ESP32",
    "Arduino",
    "Portfolio",
    "Research",
    "UMRI",
    "Universitas Muhammadiyah Riau",
  ],
  authors: [{ name: "Muhammad Rehan" }],
  creator: "Muhammad Rehan",
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "Muhammad Rehan | Electronic Engineering & IoT Portfolio",
    description:
      "Electronic Engineering Student & IoT Engineer — Building technology that connects electronics, software, and real-world solutions.",
    siteName: "Muhammad Rehan Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhammad Rehan | Electronic Engineering & IoT Portfolio",
    description:
      "Electronic Engineering Student & IoT Engineer — Building technology that connects electronics, software, and real-world solutions.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable}`}>
      <head>
        {/* Structured Data — JSON-LD Person Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Muhammad Rehan",
              jobTitle: "Electronic Engineering Student & IoT Engineer",
              affiliation: {
                "@type": "EducationalOrganization",
                name: "Universitas Muhammadiyah Riau",
              },
              url: "https://github.com/Han0953",
              sameAs: ["https://github.com/Han0953"],
              knowsAbout: [
                "Internet of Things",
                "Embedded Systems",
                "Electronics",
                "Software Testing",
                "Web Development",
              ],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Pekanbaru",
                addressRegion: "Riau",
                addressCountry: "ID",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <LenisProvider>{children}</LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
