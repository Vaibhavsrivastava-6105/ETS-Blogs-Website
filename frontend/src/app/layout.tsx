import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ets blogs | Premium Platform",
  description: "Ideas, Stories & Insights That Matter",
};

import Navbar from "@/components/layout/Navbar";
import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let themeClass = "";
  try {
    await connectDB();
    const settings = await Settings.findOne({});
    if (settings?.appearance?.theme === "Dark") {
      themeClass = "dark";
    }
  } catch (err) {
    console.error("Failed to fetch global theme settings:", err);
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased ${themeClass}`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
