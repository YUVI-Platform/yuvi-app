import { Instagram, Youtube, Linkedin } from "feather-icons-react";

export default function Footer() {
  return (
    <footer className="flex justify-center items-center w-full mt-20 md:px-20">
      <div className="flex flex-col justify-center items-center min-h-72 w-full max-w-[1920px] bg-yuvi-skyblue text-yuvi-white rounded-t-4xl">
        <div className="flex">
          <div>
            <p className="text-center p-4 text-2xl font-bold">Contact us</p>
            <p className="text-center p-4">info@yuvi.com</p>
          </div>
          <div>
            <p className="text-center p-4 text-2xl font-bold">Call Us</p>
            <p className="text-center p-4">+49 123 456 7890</p>
          </div>
        </div>
        <p className="text-center p-4">Follow us on</p>
        <div className="flex gap-4">
          <div className="flex justify-center items-center h-10 w-10 bg-yuvi-rose p-2 rounded-full">
            <Instagram className="w-8 h-8" />
          </div>
          <div className="flex justify-center items-center h-10 w-10 bg-yuvi-rose p-2 rounded-full">
            <Youtube className="w-8 h-8" />
          </div>
          <div className="flex justify-center items-center h-10 w-10 bg-yuvi-rose p-2 rounded-full">
            <Linkedin className="w-8 h-8" />
          </div>
        </div>
        <div>
          <p className="text-center p-4">
            &copy; {new Date().getFullYear()} YUVI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
<Instagram />;
