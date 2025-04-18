import type { Metadata } from "next";
import "./globals.css";
import { Prompt } from "next/font/google";

const prompt = Prompt({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "CMNY Event Management",
  description: "CMNY Event Management to manage rehearsal schedules and parts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={prompt.className}>
      <body className="w-full h-full bg-orange-100">{children}</body>
    </html>
  );
}
