import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Nastaliq_Urdu, Amiri } from "next/font/google";
import "./globals.css";
import MainShell from "../components/MainShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const notoNastaliq = Noto_Nastaliq_Urdu({ subsets: ["arabic"], variable: "--font-nastaliq" });
const amiri = Amiri({ weight: ["400", "700"], subsets: ["arabic"], variable: "--font-amiri" });

export const metadata: Metadata = {
  title: "Maududi's Legacy",
  description: "Explore the works of Sayyid Abul A'la Maududi with AI-powered chat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${notoNastaliq.variable} ${amiri.variable}`}>
        <MainShell>{children}</MainShell>
      </body>
    </html>
  );
}

