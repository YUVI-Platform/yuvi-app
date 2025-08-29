import Image from "next/image";
import Link from "next/link";

import { Search } from "feather-icons-react";

export const Header = () => {
  return (
    <header className="flex items-center justify-between  px-4 bg-white/90 backdrop-blur-lg gap-10 shadow-md w-fit rounded-full h-16">
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
              href="/advert"
              className="text-indigo-400 font-medium hover:text-yuvi-rose hover:underline underline-offset-6 transition"
            >
              Membership
            </Link>
          </li>
          <li>
            <Link
              href="/advert"
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
      <div className="flex items-center bg-indigo-400 py-2 px-4 rounded-full cursor-pointer hover:bg-yuvi-rose transition-colors">
        <span className="text-white font-medium">Login</span>
        <div className="ml-2 rounded-full overflow-hidden">
          <Image
            src="/yuvi-favicon.avif"
            alt="Yuvi Logo"
            width={24}
            height={24}
          />
        </div>
      </div>
    </header>
  );
};
