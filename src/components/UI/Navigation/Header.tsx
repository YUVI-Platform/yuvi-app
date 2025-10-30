"use client";
import clsx from "clsx";
import {
  ChevronDownIcon,
  HeartHandshakeIcon,
  Menu,
  ShoppingCartIcon,
  StoreIcon,
  User2Icon,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const DesktopHeader = () => {
  return (
    <header className="md:flex justify-between items-center text-xl font-semibold w-full max-w-[1920px] mt-1 px-20 pt-10 hidden">
      <div className="text-yuvi-rose text-4xl font-fancy">YUVi</div>
      <div className="flex gap-2 justify-center items-center">
        <div className=" flex justify-center items-center  gap-4 bg-yuvi-white p-2.5 rounded-2xl text-sm">
          <span className="text-yuvi-skyblue text-lg animate-pulse">
            Book Now!
          </span>
          <input
            type="text"
            placeholder="Where are you?"
            className="placeholder:font-light border-r border-slate-300 h-full "
          />
          <input
            type="text"
            placeholder="Moving Type?"
            className="placeholder:font-light h-full"
          />
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-yuvi-rose text-white rounded-2xl cursor-pointer">
            Studio
            <ChevronDownIcon />
          </button>
        </div>
        <nav className="flex h-fit w-fit bg-yuvi-white p-4 rounded-2xl">
          <ul className="flex space-x-8">
            <li className="flex gap-1">
              <StoreIcon /> Marktplatz
            </li>
            <li className="flex gap-1">
              <User2Icon />
              Membership
            </li>
            <li className="flex gap-1">
              <ShoppingCartIcon />
              Shop
            </li>
            <li className="flex gap-1">
              <HeartHandshakeIcon />
              Community
            </li>
          </ul>
        </nav>
      </div>

      <div className="flex justify-center items-center gap-2 border-2 border-yuvi-skyblue px-4 py-2 rounded-2xl font-bold text-yuvi-skyblue cursor-pointer hover:bg-yuvi-skyblue hover:text-yuvi-white transition">
        Login
        <div className="h-8 w-8 bg-yuvi-rose rounded-xl">
          <Image
            src="/character_placeholder_img.png"
            width={32}
            height={32}
            alt="user icon"
          />
        </div>
      </div>
    </header>
  );
};

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="flex items-center w-full justify-between px-4 py-4 bg-background md:hidden z-50 relative">
      {/* Logo / Brand */}
      <Link href="/" className="text-2xl font-bold text-yuvi-rose font-fancy">
        YUVi
      </Link>

      <div className="flex gap-4">
        <div className="flex justify-center items-center gap-2 border-2 border-yuvi-skyblue px-2 py-1 rounded-2xl font-bold text-yuvi-skyblue cursor-pointer hover:bg-yuvi-skyblue hover:text-yuvi-white transition">
          Login
          <div className="h-6 w-6 bg-yuvi-rose rounded-lg">
            <Image
              src="/character_placeholder_img.png"
              width={32}
              height={32}
              alt="user icon"
            />
          </div>
        </div>

        {/* Hamburger Button */}
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Menu Toggle">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <nav
        className={clsx(
          "absolute top-full left-0 w-full h-screen bg-background flex flex-col items-start gap-6 px-6 py-8 transition-all duration-300 ease-in-out z-40",
          isOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <Link
          href="/sessions"
          onClick={() => setIsOpen(false)}
          className="text-xl font-semibold"
        >
          Sessions
        </Link>
        <Link
          href="/studios"
          onClick={() => setIsOpen(false)}
          className="text-xl font-semibold"
        >
          Studios
        </Link>
        <Link
          href="/about"
          onClick={() => setIsOpen(false)}
          className="text-xl font-semibold"
        >
          About
        </Link>
        <Link
          href="/contact"
          onClick={() => setIsOpen(false)}
          className="text-xl font-semibold"
        >
          Contact
        </Link>
      </nav>
    </header>
  );
};

export default function Header() {
  return (
    <>
      <MobileHeader />
      <DesktopHeader />
    </>
  );
}
