"use client";

import TopNav from "@/components/TopNav";
import { Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Simulate initial loading sequence for visual effect
    const timer = setTimeout(() => setIsLoaded(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  return (
    <>
      {/* Intro Loader Screen */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-[100] bg-background flex items-center justify-center flex-col"
            initial={{ opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-annexa-cyan text-xs md:text-sm tracking-[0.4em] font-mono mb-8 font-bold"
            >
              INITIALIZING ANNEXA PROTOCOL
            </motion.div>

            <div className="w-64 md:w-96 h-[2px] bg-white/10 overflow-hidden relative rounded-full">
              <motion.div
                className="absolute top-0 left-0 h-full bg-annexa-cyan shadow-[0_0_15px_rgba(0,240,255,0.8)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen flex flex-col relative overflow-hidden bg-background">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-annexa-purple/15 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-annexa-cyan/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-50">
          <TopNav />
        </div>

        {/* Content Wrapper */}
        <motion.div
          className="max-w-7xl mx-auto w-full px-8 pt-20 pb-16 flex-1 flex flex-col relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          {/* Typography Header */}
          <div className="flex flex-col items-center text-center justify-center mb-16 max-w-4xl mx-auto mt-8">
            <motion.div variants={itemVariants} className="text-xs lg:text-sm uppercase tracking-[0.3em] text-annexa-purple font-bold mb-6 flex items-center justify-center gap-3">
              <span className="w-2 h-2 bg-annexa-purple rounded-full animate-pulse shadow-[0_0_10px_#b026ff]" /> SYSTEM INITIALIZED // DUAL AI ACTIVE
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.05] mb-8 text-white"
            >
              Rebuild from <span className="bg-linear-to-r from-annexa-cyan to-blue-500 bg-clip-text text-transparent">First</span><br />
              <span className="bg-linear-to-r from-annexa-purple to-pink-500 bg-clip-text text-transparent">Principles.</span><br />
              Secure with <span className="font-serif italic text-annexa-cyan pr-4">Annexa.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed mx-auto">
              The next evolution of cybersecurity architecture. Deploy dual-agent AI defense systems to secure your infrastructure against emerging quantum-scale threats.
            </motion.p>
          </div>

          {/* Full-width Upload manifest section */}
          <motion.div variants={itemVariants} className="w-full relative mt-8 flex-1 flex flex-col items-center justify-center">
            {/* The aesthetic border outline wrapper */}
            <div className="absolute inset-0 bg-linear-to-r from-annexa-cyan/20 to-annexa-purple/20 rounded-3xl blur-md opacity-40 group-hover:opacity-100 transition duration-1000"></div>

            <div
              className={`relative w-full max-w-5xl bg-[#0a0a0f]/80 backdrop-blur-sm border-2 border-dashed ${isDragging ? 'border-annexa-cyan bg-annexa-cyan/5' : 'border-white/10 hover:border-annexa-cyan/40'} rounded-3xl p-16 md:p-24 flex flex-col items-center justify-center text-center transition-all duration-300 group cursor-pointer overflow-hidden`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-annexa-cyan/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out" />

              <div className="w-24 h-24 bg-black/50 border border-white/5 rounded-2xl flex items-center justify-center mb-10 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-500">
                <Upload className="w-10 h-10 text-annexa-cyan group-hover:text-white transition-colors" />
              </div>

              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                UPLOAD YOUR MANIFEST
              </h3>
              <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-10">
                Upload your manifest and we&apos;ll handle the rest. All protocols are securely parsed and integrated automatically.
              </p>

              <button className="bg-annexa-cyan text-black px-12 py-5 rounded font-black tracking-widest uppercase hover:bg-cyan-300 transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] hover:-translate-y-1">
                SELECT MANIFEST FILE
              </button>

              <p className="mt-8 text-xs text-gray-500 font-mono tracking-widest uppercase">
                Drag & Drop supported • .JSON, .YAML, .ZIP • MAX 250MB
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Problems with Open Source Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto w-full px-8 py-32 relative z-10"
        >
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif tracking-tight text-white mb-6">
              The <span className="text-red-500 font-bold italic">Problem</span> with Open Source
            </h2>
            <div className="w-16 h-[2px] bg-red-500 mx-auto opacity-80" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {/* Card 1 */}
            <div className="bg-[#1a1a21]/50 border border-white/5 p-10 rounded-2xl hover:border-white/10 hover:bg-[#1a1a21]/80 transition-all duration-300">
              <div className="flex justify-between items-start mb-8">
                <div className="w-3 h-3 bg-gray-400 mt-1" />
                <span className="text-[10px] font-mono tracking-widest text-gray-400">ISSUE-001</span>
              </div>
              <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-5">Apache License Attribution</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Is your legal team <span className="font-semibold text-white">frustrated</span> with the attribution clause? Tired of putting &quot;Portions of this software...&quot; in your documentation? Those maintainers worked for free—why should they get credit?
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#1a1a21]/50 border border-white/5 p-10 rounded-2xl hover:border-white/10 hover:bg-[#1a1a21]/80 transition-all duration-300">
              <div className="flex justify-between items-start mb-8">
                <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-b-[14px] border-l-transparent border-r-transparent border-b-gray-400 mt-1" />
                <span className="text-[10px] font-mono tracking-widest text-gray-400">ISSUE-002</span>
              </div>
              <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-5">AGPL Contamination</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Does your company <span className="font-semibold text-white">forbid AGPL code</span>? One wrong import and suddenly your entire proprietary codebase must be open sourced. The horror!
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#1a1a21]/50 border border-white/5 p-10 rounded-2xl hover:border-white/10 hover:bg-[#1a1a21]/80 transition-all duration-300">
              <div className="flex justify-between items-start mb-8">
                <div className="w-3.5 h-3.5 bg-gray-400 rotate-45 mt-1" />
                <span className="text-[10px] font-mono tracking-widest text-gray-400">ISSUE-003</span>
              </div>
              <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-5">License Compliance Overhead</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Tracking licenses across hundreds of dependencies? Legal reviews taking weeks? Third-party audits finding &quot;issues&quot;? What if you could just... <span className="font-semibold text-white">not deal with any of that?</span>
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#1a1a21]/50 border border-white/5 p-10 rounded-2xl hover:border-white/10 hover:bg-[#1a1a21]/80 transition-all duration-300">
              <div className="flex justify-between items-start mb-8">
                <div className="w-3.5 h-3.5 bg-gray-400 rounded-full mt-1" />
                <span className="text-[10px] font-mono tracking-widest text-gray-400">ISSUE-004</span>
              </div>
              <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-5">Giving Back To Community</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Some licenses require you to contribute improvements back. Your shareholders didn&apos;t invest in your company so you could <span className="font-semibold text-white">help strangers.</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Minimal Footer Quotes */}
        <footer className="w-full py-16 mt-auto relative z-10 flex items-center justify-center">
          <p className="text-gray-500 font-serif italic text-lg opacity-60 hover:opacity-100 transition-opacity duration-300">
            &quot;True security lies in rebuilding the foundation, not patching the cracks.&quot;
          </p>
        </footer>
      </main>
    </>
  );
}
