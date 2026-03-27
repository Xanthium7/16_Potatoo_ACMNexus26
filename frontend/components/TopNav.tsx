import Link from "next/link";
import { Monitor, Settings, User } from "lucide-react";

export default function TopNav() {
    return (
        <nav className="w-full flex items-center justify-between px-8 py-5 bg-white border-b-4 border-black sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <Link href="/" className="text-3xl font-black tracking-tighter text-black uppercase flex items-baseline">
                    Annexa<div className="w-3 h-3 bg-brutal-pink ml-1"></div>
                </Link>
                <div className="flex items-center gap-6 text-sm font-bold text-black mt-1">
                    <Link href="/" className="bg-brutal-yellow px-5 py-2 border-2 border-black shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-none transition-all uppercase tracking-widest active:translate-x-[4px] active:translate-y-[4px]">
                        Service
                    </Link>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brutal-cyan border-2 border-black flex items-center justify-center shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-none transition-all cursor-pointer">
                    <User strokeWidth={3} className="w-5 h-5 text-black" />
                </div>
            </div>
        </nav>
    );
}
