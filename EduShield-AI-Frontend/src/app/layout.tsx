import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduShield AI — Preventive Education Intelligence",
  description: "AI Copilot for Early School Intervention & Smart Educational Decision-Making. Built for Indian schools to detect at-risk students early and improve school-level outcomes.",
  keywords: "education, AI, school, intervention, dropout prevention, India, student risk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#FAF7F2]">
        {children}
      </body>
    </html>
  );
}
