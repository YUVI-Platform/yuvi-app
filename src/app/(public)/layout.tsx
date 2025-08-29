import Footer from "@/components/UI/Navigation/Footer";
import { Header } from "@/components/UI/Navigation/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="fixed flex w-full justify-center items-center mt-10 z-100">
        <Header />
      </div>

      {children}
      <Footer />
    </div>
  );
}
