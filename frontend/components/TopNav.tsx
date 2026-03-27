import Link from "next/link";
import { Monitor, Settings, User } from "lucide-react";

export default function TopNav() {
    return (
        <nav className="w-full flex items-center justify-between px-8 py-4 bg-background/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
                    Annexa<span className="text-annexa-cyan">.</span>
                </Link>
                <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
                    <Link href="/" className="text-annexa-cyan border-b-2 border-annexa-cyan pb-1 uppercase tracking-wider">
                        The Nexus
                    </Link>
                </div>
            </div>
        </nav>
    );
}
