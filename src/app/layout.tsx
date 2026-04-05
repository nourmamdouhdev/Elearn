import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ELearn — منصة التعليم الأولى في مصر",
  description:
    "منصة تعليمية متكاملة لطلاب الثانوية العامة في مصر. دروس عالية الجودة، مدرسين متميزين، ونظام تعليمي حديث.",
  keywords: ["تعليم", "ثانوية عامة", "مصر", "دروس", "مدرسين", "elearn"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cairo.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
