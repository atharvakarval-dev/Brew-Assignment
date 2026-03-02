import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"]
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "CineInsight - AI Movie Sentiment Analysis",
  description:
    "Enter any IMDb ID and get AI-powered audience sentiment insights in seconds."
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfairDisplay.variable} ${jetBrainsMono.variable} bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  if (args[0]?.includes?.('Extra attributes from the server') && args[0]?.includes?.('fdprocessedid')) {
                    return;
                  }
                  originalError.apply(console, args);
                };
              })();
            `
          }}
        />
        {children}
      </body>
    </html>
  );
}
