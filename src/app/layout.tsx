import type { Metadata } from "next";
import localFont from "next/font/local";
import { Rubik } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClienentLayout";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "YUVI ",
  description: "Dein Marktplatz für Bewegungskurse",
};

const PetitieCochon = localFont({
  src: "./fonts/nf-le-petit-cochon.ttf",
  variable: "--font-petite-cochon",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${rubik.variable} ${PetitieCochon.variable} antialiased bg-background! min-h-screen`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
