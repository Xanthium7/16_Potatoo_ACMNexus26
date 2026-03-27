"use client";

import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { UploadCloud, FileJson, X, Settings2, Zap, BrainCircuit, Activity, Box, ShieldCheck, Grid } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function UploadDashboard() {
    const [priority, setPriority] = useState('BALANCED');
    const [toggles, setToggles] = useState({
        aggressive: true,
        dualAI: false,
        isolate: true
    });

    return (
        <div className="min-h-screen flex flex-col bg-[#050505]">
            <TopNav />

            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 flex flex-col lg:flex-row gap-8 relative">

                    <div className="flex-1 max-w-4xl flex flex-col pt-4">
                        {/* Header Content */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="text-[10px] font-bold tracking-[0.2em] text-annexa-cyan mb-4 flex items-center gap-2 uppercase">
                                NEXUS CORE <span className="text-gray-600">&gt;</span> DATA INGESTION
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tight mb-4">
                                The Nexus <span className="text-annexa-cyan text-glow-cyan">Upload</span>
                            </h1>
                            <p className="text-gray-400 max-w-2xl leading-relaxed text-sm">
                                Deploy complex architectural payloads to the Annexa dual-AI engine. Securely upload .zip archives, JSON schemas, or raw audit logs for deep-state extraction.
                            </p>
                        </motion.div>

                        {/* Upload Area */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="border border-dashed border-white/20 bg-annexa-card/50 rounded-xl p-16 flex flex-col items-center justify-center relative overflow-hidden group hover:border-annexa-cyan/50 hover:bg-annexa-card transition-all cursor-pointer mb-8"
                        >
                            <div className="absolute inset-0 bg-annexa-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="w-20 h-20 bg-annexa-cyan/10 rounded-full flex items-center justify-center mb-6 text-annexa-cyan group-hover:scale-110 transition-transform border border-annexa-cyan/20">
                                <UploadCloud className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Initialize Payload Transfer</h3>
                            <p className="text-xs text-gray-500 font-mono text-center max-w-md relative z-10 tracking-widest uppercase mb-8">
                                Drag and drop zip, json, or log files here
                            </p>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="bg-black/50 border border-white/10 px-4 py-2 rounded text-xs text-gray-400 flex items-center gap-2 font-mono">
                                    <FileJson className="w-3 h-3" /> MAX_SIZE: 5GB
                                </div>
                                <div className="bg-black/50 border border-white/10 px-4 py-2 rounded text-xs text-gray-400 flex items-center gap-2 font-mono">
                                    <ShieldCheck className="w-3 h-3" /> AES-256 E2EE
                                </div>
                            </div>
                        </motion.div>

                        {/* Uplink Status */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-12"
                        >
                            <div className="flex justify-between text-xs font-mono mb-2">
                                <span className="text-annexa-cyan">ACTIVE UPLINK STATUS</span>
                                <span className="text-gray-500">64% Transfer Complete</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                                <div className="h-full bg-gradient-to-r from-annexa-cyan to-annexa-purple w-[64%] relative shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
                            </div>

                            {/* Upload Item */}
                            <div className="bg-annexa-card border border-white/10 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-annexa-purple/10 rounded flex items-center justify-center border border-annexa-purple/20">
                                        <FileJson className="w-5 h-5 text-annexa-purple" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white mb-1 tracking-wide">core_system_architecture.json</div>
                                        <div className="text-xs text-gray-500 font-mono">14.2 MB • Processing Entities...</div>
                                    </div>
                                </div>
                                <button className="text-gray-500 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>

                        {/* WATERMARK TEXT */}
                        <div className="absolute bottom-[-5%] left-[10%] text-[150px] font-black text-white/[0.02] tracking-tighter whitespace-nowrap pointer-events-none z-[-1] select-none">
                            ANNEXA CORE
                        </div>

                        {/* Recent Activities Footer */}
                        <div className="mt-8 border-t border-white/5 pt-8 pb-8 relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-black tracking-widest text-white">RECENT NEXUS ACTIVITIES</h2>
                                <button className="text-annexa-cyan hover:text-cyan-300 text-xs font-mono tracking-widest">View Audit History</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { name: "GRID_NODE_ZENITH", status: "SUCCESS", time: "2h ago", extra: "1.2k entities", icon: Grid, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
                                    { name: "LOG_CORE_REDUX", status: "SUCCESS", time: "5h ago", extra: "8.4MB logs", icon: Activity, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
                                    { name: "SCHEMA_V4_PROD", status: "ANALYZING", time: "12h ago", extra: "Validating...", icon: Box, color: "text-annexa-purple", bg: "bg-annexa-purple/10", border: "border-annexa-purple/20" }
                                ].map((activity, i) => (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (i * 0.1) }} key={i} className="bg-annexa-card border border-white/5 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-8 h-8 rounded ${activity.bg} ${activity.border} border flex items-center justify-center`}>
                                                <activity.icon className={`w-4 h-4 ${activity.color}`} />
                                            </div>
                                            <div className={`text-[9px] px-2 py-0.5 border rounded font-mono ${activity.status === 'SUCCESS' ? 'text-green-500 border-green-500/30 bg-green-500/5' : 'text-annexa-purple border-annexa-purple/30 bg-annexa-purple/5'}`}>
                                                {activity.status}
                                            </div>
                                        </div>
                                        <div className="font-bold text-xs tracking-widest text-white mb-1">{activity.name}</div>
                                        <div className="text-[10px] text-gray-500 font-mono">Uploaded {activity.time} • {activity.extra}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Configuration Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full lg:w-80 flex flex-col gap-6"
                    >
                        <div className="bg-annexa-card border border-white/5 rounded-xl p-6">
                            <h3 className="text-white font-bold tracking-widest text-xs mb-6 flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-annexa-cyan" /> CONFIGURATION
                            </h3>

                            <div className="mb-6">
                                <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500 mb-2 block">PROJECT IDENTIFIER</label>
                                <input
                                    type="text"
                                    placeholder="e.g. ALPHA_OMEGA_GRID"
                                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white text-xs tracking-widest focus:outline-none focus:border-annexa-cyan transition-colors"
                                />
                            </div>

                            <div className="mb-8">
                                <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500 mb-2 block">COMPUTATIONAL PRIORITY</label>
                                <div className="flex gap-2">
                                    {['LOW', 'BALANCED', 'CRITICAL'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPriority(p)}
                                            className={`flex-1 py-2 text-[10px] font-bold tracking-widest rounded border ${priority === p ? 'border-annexa-cyan bg-annexa-cyan/10 text-annexa-cyan' : 'border-white/10 text-gray-500 hover:text-white bg-black/50'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-white mb-0.5">Aggressive Behavioral Extraction</div>
                                        <div className="text-[10px] text-gray-500 font-mono">Heuristic-level log auditing</div>
                                    </div>
                                    <button
                                        onClick={() => setToggles({ ...toggles, aggressive: !toggles.aggressive })}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${toggles.aggressive ? 'bg-annexa-cyan' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-all ${toggles.aggressive ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-white mb-0.5">Dual AI Cross-Validation</div>
                                        <div className="text-[10px] text-gray-500 font-mono">Verify findings with 2nd neural</div>
                                        <div className="text-[10px] text-gray-500 font-mono">engine</div>
                                    </div>
                                    <button
                                        onClick={() => setToggles({ ...toggles, dualAI: !toggles.dualAI })}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${toggles.dualAI ? 'bg-annexa-cyan' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-all ${toggles.dualAI ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-white mb-0.5">Isolate Legacy Entities</div>
                                        <div className="text-[10px] text-gray-500 font-mono">Filter out deprecated object IDs</div>
                                    </div>
                                    <button
                                        onClick={() => setToggles({ ...toggles, isolate: !toggles.isolate })}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${toggles.isolate ? 'bg-annexa-cyan' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-all ${toggles.isolate ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <button className="w-full mt-8 bg-annexa-cyan text-black py-4 rounded font-black tracking-widest text-sm hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-between px-6 group">
                                <span className="text-left leading-tight">EXECUTE UPLOAD<br />SEQUENCE</span>
                                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Recommendation Card */}
                        <div className="bg-annexa-purple/5 border border-annexa-purple/20 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-annexa-purple/10 blur-[30px] rounded-full" />
                            <div className="flex flex-col relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <BrainCircuit className="w-4 h-4 text-annexa-purple" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-annexa-purple">AI CORE RECOMMENDATION</span>
                                </div>
                                <p className="text-xs text-gray-400 font-serif italic leading-relaxed">
                                    &quot;Payloads containing over 10,000 entities should utilize the 'Grid Sharding' protocol for optimal ingestion speed.&quot;
                                </p>
                            </div>
                        </div>

                    </motion.div>

                </main>
            </div>
        </div>
    );
}
