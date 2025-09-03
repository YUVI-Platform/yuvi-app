import type { Metadata } from "next";
import { Geist, Geist_Mono, Gelasio } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClienentLayout";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const gelasio = Gelasio({ variable: "--font-gelasio", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YUVI ",
  description: "A platform for Sport collaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gelasio.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
