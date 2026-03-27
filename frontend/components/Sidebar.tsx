import Link from "next/link";
import { Activity, LayoutGrid, Cpu, Shield, Network, Terminal, HelpCircle } from "lucide-react";

export default function Sidebar() {
    const navItems = [
        { icon: Activity, label: "SYSTEM HEALTH", sub: "Dual AI Active", href: "#", active: true },
        { icon: LayoutGrid, label: "ARCHITECTURE", href: "#" },
        { icon: Cpu, label: "AI AGENTS", href: "#" },
        { icon: Shield, label: "SECURITY LOGS", href: "#" },
        { icon: Network, label: "NETWORK GRID", href: "#" },
    ];

    return (
        <div className="w-64 border-r border-white/5 bg-[#08080a] h-[calc(100vh-73px)] flex flex-col justify-between hidden md:flex sticky top-[73px]">
            <div className="py-6">
                {navItems.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={i}
                            href={item.href}
                            className={`flex items-center gap-4 px-6 py-4 transition-colors ${item.active ? 'bg-white/5 border-l-4 border-annexa-cyan' : 'hover:bg-white/5 text-gray-500 border-l-4 border-transparent hover:text-white'}`}
                        >
                            <div className={`w-8 h-8 rounded bg-[#1a1a21] flex items-center justify-center ${item.active ? 'text-annexa-cyan' : ''}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div>
                                <div className={`font-bold tracking-widest text-xs ${item.active ? 'text-white' : ''}`}>
                                    {item.label}
                                </div>
                                {item.sub && (
                                    <div className="text-[10px] text-gray-500 mt-1">{item.sub}</div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="p-6">
                <button className="w-full flex items-center justify-center gap-2 bg-transparent border border-annexa-cyan text-annexa-cyan py-3 rounded text-sm font-bold tracking-widest hover:bg-annexa-cyan/10 transition-colors mb-6">
                    DEPLOY AGENT
                </button>

                <div className="space-y-4 text-xs font-mono text-gray-500">
                    <button className="flex items-center gap-3 hover:text-white transition-colors w-full text-left">
                        <Terminal className="w-4 h-4" /> Terminal
                    </button>
                    <button className="flex items-center gap-3 hover:text-white transition-colors w-full text-left">
                        <HelpCircle className="w-4 h-4" /> Help
                    </button>
                </div>
            </div>
        </div>
    );
}
