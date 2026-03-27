"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function TopNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black h-20 flex items-center justify-between px-8">
      {/* LOGO */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xl shadow-brutal-sm group-hover:rotate-6 transition-transform">
          A
        </div>
        <span className="font-black text-2xl uppercase tracking-tighter">
          Annexa.
        </span>
      </Link>

      {/* QUOTE SECTION */}
      <div className="hidden md:flex items-center gap-8 pr-4">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40">
          " Licence?? nah just drop the manifest "
        </span>
        <div className="w-12 h-1 bg-black" />
      </div>
    </nav>
  );
}
