"use client";
import Image from "next/image";
import Link from "next/link";

import { Search } from "feather-icons-react";
import { useState } from "react";

export const DesktopHeader = () => {
  return (
    <header
      className={`items-center justify-between  px-4 bg-white/90 backdrop-blur-lg gap-10 shadow-md w-fit rounded-full h-16 hidden md:flex`}
    >
      <Image src="/yuvi-favicon.avif" alt="Yuvi Logo" width={40} height={40} />

      <div className="flex items-center border-l border-gray-300 h-full pl-8">
        <Search className="mr-4" />
        <input
          type="search"
          name="search"
          id="search"
          placeholder="Search..."
        />
      </div>
      <nav>
        <ul className="flex space-x-8">
          <li>
            <Link
              href="/"
              className="text-indigo-400 font-medium hover:text-yuvi-rose hover:underline underline-offset-6 transition"
            >
              About us
            </Link>
          </li>
          <li>
            <Link
              href="/marketplace"
              className="text-indigo-400 font-medium hover:text-yuvi-rose hover:underline underline-offset-6 transition"
            >
              Marktplatz
            </Link>
          </li>
          <li>
            <Link
              href="/membership"
              className="text-indigo-400 font-medium hover:text-yuvi-rose hover:underline underline-offset-6 transition"
            >
              Membership
            </Link>
          </li>
          <li>
            <Link
              href="https://yuvistudio.com/"
              target="_blank"
              className="text-indigo-400 font-medium hover:text-yuvi-rose hover:underline underline-offset-6 transition"
            >
              Shop
            </Link>
          </li>
          <li>
            <Link
              href="/advert"
              className="text-indigo-400 font-medium hover:text-yuvi-rose hover:underline underline-offset-6 transition"
            >
              Community
            </Link>
          </li>
        </ul>
      </nav>
      <Link
        href="/login"
        className="flex items-center bg-indigo-400 py-2 px-4 rounded-full cursor-pointer hover:bg-yuvi-rose transition-colors"
      >
        <span className="text-white font-medium">Login</span>
        <div className="ml-2 rounded-full overflow-hidden">
          <Image
            src="/yuvi-favicon.avif"
            alt="Yuvi Logo"
            width={24}
            height={24}
          />
        </div>
      </Link>
    </header>
  );
};

export const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="absolute inset-0 w-full h-fit bg-white flex flex-col overflow-hidden md:hidden">
      <div className="flex items-center justify-between px-4 py-2">
        <Link
          href="/login"
          className="flex items-center bg-indigo-400 py-2 px-4 rounded-full hover:bg-yuvi-rose transition-colors"
        >
          <span className="text-white font-medium">Login</span>
          <div className="ml-2 rounded-full overflow-hidden">
            <Image
              src="/yuvi-favicon.avif"
              alt="Yuvi Logo"
              width={24}
              height={24}
            />
          </div>
        </Link>
        <div className="flex flex-col gap-2" onClick={() => setIsOpen(!isOpen)}>
          <div className="w-12 h-1 rounded-full bg-indigo-400" />
          <div className="w-12 h-1 rounded-full bg-indigo-400" />
          <div className="w-12 h-1 rounded-full bg-indigo-400" />
        </div>
      </div>
      <nav
        className={`md:hidden w-full max-w-screen ${isOpen ? "" : "hidden"}`}
      >
        <ul className="flex flex-col justify-center items-center space-y-8 h-screen z-50 px-8">
          <li>
            <Link
              href="/"
              className="text-5xl text-indigo-400 font-medium hover:text-yuvi-rose hover:underline underline-offset-6 transition"
            >
              About us
            </Link>
          </li>
          <li>
            <Link
              href="/marketplace"
              className="text-5xl text-indigo-400 font-medium hover:text-yuvi-rose hover:underline underline-offset-6 transition"
            >
              Marktplatz
            </Link>
          </li>
          <li>
            <Link
              href="/membership"
              className="text-5xl text-indigo-400 font-medium hover:text-yuvi-rose hover:underline underline-offset-6 transition"
            >
              Membership
            </Link>
          </li>
          <li>
            <Link
              href="https://yuvistudio.com/"
              target="_blank"
              className="text-5xl text-indigo-400 font-medium hover:text-yuvi-rose hover:underline underline-offset-6 transition"
            >
              Shop
            </Link>
          </li>
          <li>
            <Link
              href="/advert"
              className="text-5xl text-indigo-400 font-medium hover:text-yuvi-rose hover:underline underline-offset-6 transition"
            >
              Community
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default function Header() {
  return (
    <>
      <DesktopHeader />
      <MobileHeader />
    </>
  );
}
