import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BuyLoom - Your Trusted Affiliate Shopping Partner",
  description:
    "Discover amazing products curated just for you. Find the best deals from trusted retailers across the United States.",
  keywords: "affiliate marketing, shopping, deals, products, reviews, BuyLoom",
  authors: [{ name: "BuyLoom Team" }],
  creator: "BuyLoom",
  publisher: "BuyLoom",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://buyloom.com",
    siteName: "BuyLoom",
    title: "BuyLoom - Your Trusted Affiliate Shopping Partner",
    description: "Discover amazing products curated just for you. Find the best deals from trusted retailers.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BuyLoom - Affiliate Shopping",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuyLoom - Your Trusted Affiliate Shopping Partner",
    description: "Discover amazing products curated just for you.",
    images: ["/og-image.jpg"],
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "BuyLoom",
              description: "Your trusted affiliate shopping partner",
              url: "https://buyloom.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://buyloom.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
