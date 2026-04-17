import type { Metadata } from "next";
import { Unbounded } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-brand",
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Бренд одежды",
  description: "Сайт бренда одежды"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={unbounded.variable}>{children}</body>
    </html>
  );
}
