import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Avyay Health — The Care That Follows You Home",
  description:
    "AI care companion that contacts every discharged patient daily for 30 days — via SMS or app — and alerts care coordinators the moment a patient needs help.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
