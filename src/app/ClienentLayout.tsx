"use client";

import { usePathname } from "next/navigation";
import Header from "../components/UI/Navigation/Header";
import Footer from "../components/UI/Navigation/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard =
    pathname.includes("/dashboard") || pathname.includes("/login");

  return (
    <>
      {isDashboard ? (
        <>{children}</>
      ) : (
        <>
          <div className="fixed flex w-full justify-center items-center md:py-4 z-100 bg-background">
            <Header />
          </div>
          {children}
          <Footer />
        </>
      )}
    </>
  );
}
