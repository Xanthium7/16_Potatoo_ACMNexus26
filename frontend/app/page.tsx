"use client";

import TopNav from "@/components/TopNav";
import { UploadCloud, Grid, Activity, Shield, ShieldCheck, Fingerprint } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-[#050505]">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-annexa-purple/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] bg-annexa-cyan/10 blur-[150px] rounded-full pointer-events-none" />

      <TopNav />

      <div className="max-w-7xl mx-auto w-full px-8 py-16 flex-1 flex flex-col lg:flex-row gap-16 relative z-10">

        {/* Left Column: Typography */}
        <motion.div
          className="flex-1 flex flex-col justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-xs uppercase tracking-[0.2em] text-annexa-purple font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-annexa-purple rounded-full animate-pulse" /> SYSTEM INITIALIZED // DUAL AI ACTIVE
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-6 text-white"
          >
            Rebuild from <span className="bg-gradient-to-r from-annexa-cyan to-blue-500 bg-clip-text text-transparent">First</span><br />
            <span className="bg-gradient-to-r from-annexa-purple to-pink-500 bg-clip-text text-transparent">Principles.</span><br />
            Rebuild with <span className="font-serif italic text-annexa-cyan pr-4">Annexa.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-gray-400 text-lg max-w-xl mb-12 leading-relaxed">
            The next evolution of cybersecurity architecture. Deploy dual-agent AI defense systems to secure your infrastructure against emerging quantum-scale threats.
          </motion.p>

          <motion.div variants={itemVariants} className="flex items-center gap-6">
            <Link href="/upload" className="group flex items-center gap-3 bg-annexa-cyan text-black px-8 py-4 rounded font-black tracking-wider hover:bg-cyan-300 transition-all duration-300 relative overflow-hidden">
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <UploadCloud className="w-5 h-5 relative z-10" />
              <span className="relative z-10">UPLOAD SYSTEM</span>
            </Link>

            <button className="flex items-center gap-3 bg-transparent border border-white/20 text-white px-8 py-4 rounded font-bold tracking-wider hover:bg-white/5 transition-all duration-300">
              <Grid className="w-5 h-5" />
              VIEW GRID
            </button>
          </motion.div>
        </motion.div>

        {/* Right Column: Dashboard Mockups */}
        <motion.div
          className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 content-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Real-time Architecture */}
          <motion.div variants={itemVariants} className="col-span-full bg-annexa-card border border-annexa-border rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-annexa-cyan to-transparent" />
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-white font-bold tracking-widest text-sm mb-1">REAL-TIME ARCHITECTURE</h3>
                <p className="text-xs text-gray-500">PROCESS PID: A8-763 // ENCRYPTION: AES-X</p>
              </div>
              <Activity className="text-gray-600 w-5 h-5" />
            </div>

            <div className="space-y-4">
              <div className="bg-[#1a1a21] border border-white/5 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-cyan-500/10 flex items-center justify-center border border-annexa-cyan/20">
                    <ShieldCheck className="text-annexa-cyan w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-wide">NEURAL CORE 01</h4>
                    <p className="text-xs text-annexa-cyan flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-annexa-cyan" /> Active / Optimal
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Lat: 0.24ms</p>
                  <div className="w-24 h-1 bg-white/10 rounded overflow-hidden">
                    <div className="w-3/4 h-full bg-annexa-cyan rounded" />
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a21] border border-white/5 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-purple-500/10 flex items-center justify-center border border-annexa-purple/20">
                    <Shield className="text-annexa-purple w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-wide">SENTINEL LOGIC</h4>
                    <p className="text-xs text-annexa-purple flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-annexa-purple" /> Patrolling Cluster
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Load: 12%</p>
                  <div className="w-24 h-1 bg-white/10 rounded overflow-hidden">
                    <div className="w-1/4 h-full bg-annexa-purple rounded" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Network Grid */}
          <motion.div variants={itemVariants} className="bg-annexa-card border border-annexa-border rounded-xl p-6">
            <h3 className="text-white font-bold tracking-widest text-xs mb-4 flex items-center gap-2">
              <Grid className="w-4 h-4 text-annexa-cyan" /> NETWORK GRID
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`aspect-square rounded ${i === 5 ? 'bg-annexa-cyan shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-[#1a1a21] border border-white/5 line-through decoration-white/10 decoration-[0.5px]'}`} />
              ))}
            </div>
          </motion.div>

          {/* Recent Logs (Fake) */}
          <motion.div variants={itemVariants} className="bg-annexa-card border border-annexa-border rounded-xl p-6">
            <h3 className="text-white font-bold tracking-widest text-xs mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-annexa-purple" /> RECENT LOGS
            </h3>
            <div className="space-y-3 font-mono text-[10px]">
              <p className="text-gray-400"><span className="text-annexa-purple">[14:22:01]</span> SHIELD_API: AUTH_SUCCESS</p>
              <p className="text-gray-400"><span className="text-annexa-purple">[14:21:40]</span> PING: 192.168.0.21 -&gt; ACK</p>
              <p className="text-gray-400"><span className="text-annexa-purple">[14:20:14]</span> THREAT_DETECT: BLOCKED</p>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full mt-24 pb-24 border-t border-white/5 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-8 pt-16">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-2xl font-black tracking-tight text-white">MODULAR DEFENSE HIERARCHY</h2>
            <div className="text-xs text-gray-500 border border-white/10 px-3 py-1 rounded bg-black/50">SYSTEM VERSION: V4.2.9-LTS</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <div className="bg-annexa-card border border-annexa-border p-8 rounded-xl hover:border-annexa-cyan transition-colors group">
              <div className="w-12 h-12 bg-[#1a1a21] rounded flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 transition-colors">
                <Fingerprint className="text-annexa-cyan w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3 tracking-wide">NEURAL MESH</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Distributed AI agents that learn from every attack vector across the global Annexa network.</p>
            </div>

            <div className="bg-annexa-card border border-annexa-border p-8 rounded-xl hover:border-annexa-purple transition-colors group">
              <div className="w-12 h-12 bg-[#1a1a21] rounded flex items-center justify-center mb-6 group-hover:bg-purple-500/10 transition-colors">
                <Activity className="text-annexa-purple w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3 tracking-wide">DUAL AI CORE</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Twin engines monitoring logic and behavioral patterns simultaneously for zero-false-positives.</p>
            </div>

            <div className="bg-annexa-card border border-annexa-border p-8 rounded-xl hover:border-green-500 transition-colors group">
              <div className="w-12 h-12 bg-[#1a1a21] rounded flex items-center justify-center mb-6 group-hover:bg-green-500/10 transition-colors">
                <ShieldCheck className="text-green-500 w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3 tracking-wide">QUANTUM VAULT</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Lattice-based encryption standards ready to withstand next-generation compute threats.</p>
            </div>
          </div>

          <div className="mt-32 p-16 rounded-2xl bg-gradient-to-br from-annexa-card to-[#0a0a0f] border border-white/5 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-annexa-cyan/5 blur-[100px] rounded-full pointer-events-none" />
            <h2 className="text-5xl font-black text-white tracking-tight mb-2 relative z-10">THE FUTURE IS</h2>
            <h2 className="text-5xl font-black text-annexa-cyan tracking-tight mb-6 relative z-10 text-glow-cyan">ANNEXA.</h2>
            <p className="text-gray-400 mb-10 max-w-lg mx-auto relative z-10">Join the elite organizations rebuilding their digital fortress with first-principles security.</p>

            <div className="flex justify-center flex-col sm:flex-row gap-4 max-w-xl mx-auto relative z-10">
              <input
                type="text"
                placeholder="ENTER CORE ID / EMAIL"
                className="bg-black/50 border border-white/10 rounded px-6 py-4 text-white text-sm tracking-widest focus:outline-none focus:border-annexa-cyan flex-1"
              />
              <button className="bg-annexa-cyan text-black px-10 py-4 rounded font-black tracking-wider hover:bg-cyan-400 transition-colors whitespace-nowrap">
                INITIALIZE
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
