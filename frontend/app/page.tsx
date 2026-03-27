"use client";

import TopNav from "@/components/TopNav";
import { Upload, ShieldCheck, AlertTriangle, Scale, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const cardData = [
  {
    bgColor: "#ffee00",
    icon: <Scale strokeWidth={3} className="w-8 h-8" />,
    tag: "ISSUE-001",
    title: "Apache License Attribution",
    body: 'Is your legal team frustrated with the attribution clause? Tired of putting "Portions of this software..." in your documentation?',
  },
  {
    bgColor: "#ff90e8",
    icon: <AlertTriangle strokeWidth={3} className="w-8 h-8" />,
    tag: "ISSUE-002",
    title: "AGPL Contamination",
    body: "Does your company forbid AGPL code? One wrong import and suddenly your entire proprietary codebase must be open sourced.",
  },
  {
    bgColor: "#4facf7",
    icon: <ShieldCheck strokeWidth={3} className="w-8 h-8" />,
    tag: "ISSUE-003",
    title: "License Compliance Overhead",
    body: "Tracking licenses across hundreds of dependencies? Legal reviews taking weeks? What if you could just... not deal with any of that?",
  },
  {
    bgColor: "#90ff90",
    icon: <Heart strokeWidth={3} className="w-8 h-8" />,
    tag: "ISSUE-004",
    title: "Giving Back To Community",
    body: "Some licenses require you to contribute improvements back. Your shareholders didn\u2019t invest in your company so you could help strangers.",
  },
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const pop = {
    hidden: { opacity: 0, y: 50, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <>
      {/* ──── CIRCULAR LOADER ──── */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-[200] bg-[#fdfbf7] flex items-center justify-center flex-col"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {/* Spinning circle */}
            <div className="relative w-28 h-28 mb-10">
              <motion.div
                className="absolute inset-0 border-[6px] border-black/10 rounded-full"
              />
              <motion.div
                className="absolute inset-0 border-[6px] border-transparent border-t-black border-r-black rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className="text-2xl font-black tracking-tight"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  A.
                </motion.span>
              </div>
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.35em] text-black/60">
              Loading Experience
            </p>

            {/* Progress bar */}
            <div className="w-56 h-2 bg-black/10 border-2 border-black mt-6 overflow-hidden">
              <motion.div
                className="h-full bg-black"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── MAIN PAGE ──── */}
      <main className="min-h-screen flex flex-col bg-[#fdfbf7] relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-20 right-[-5%] w-72 h-72 rounded-full pointer-events-none" style={{ backgroundColor: "rgba(255, 238, 0, 0.3)" }} />
        <div className="absolute top-[60%] left-[-8%] w-96 h-96 rounded-full pointer-events-none" style={{ backgroundColor: "rgba(255, 144, 232, 0.2)" }} />
        <div className="absolute bottom-10 right-[10%] w-48 h-48 rotate-45 pointer-events-none" style={{ backgroundColor: "rgba(144, 255, 144, 0.25)" }} />

        <TopNav />

        {/* ──── HERO SECTION ──── */}
        <motion.div
          className="max-w-6xl mx-auto w-full px-8 pt-20 pb-8 flex-1 flex flex-col relative z-10"
          variants={stagger}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          <motion.div variants={pop} className="mb-4">
            <span className="inline-block border-3 border-black px-5 py-2 text-xs font-black uppercase tracking-[0.3em] shadow-brutal-sm -rotate-1" style={{ backgroundColor: "#ffee00" }}>
              Cybersecurity Platform
            </span>
          </motion.div>

          <motion.h1
            variants={pop}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-black uppercase leading-[0.95] tracking-tight mb-8 text-black"
          >
            Rebuild from<br />
            <span className="inline-block px-3 py-1 border-4 border-black shadow-brutal mt-2 rotate-1" style={{ backgroundColor: "#ff90e8" }}>
              First Principles.
            </span>
            <br />
            Secure with{" "}
            <span className="inline-block border-b-[6px] border-black italic">
              Annexa.
            </span>
          </motion.h1>

          <motion.p
            variants={pop}
            className="text-black/60 text-lg md:text-xl max-w-xl leading-relaxed mb-12 font-medium"
          >
            The next evolution of cybersecurity architecture. Deploy dual-agent
            AI defense systems to secure your infrastructure against emerging
            threats.
          </motion.p>

          {/* ──── UPLOAD SECTION ──── */}
          <motion.div variants={pop} className="w-full flex justify-center mb-20">
            <div
              className={`w-full max-w-3xl bg-white border-4 ${isDragging
                ? "border-brutal-cyan bg-brutal-cyan/10 translate-x-[6px] translate-y-[6px] shadow-brutal-none"
                : "border-black shadow-brutal-lg hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-brutal-sm"
                } p-12 md:p-16 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer group`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
            >
              <div className="w-20 h-20 border-4 border-black flex items-center justify-center mb-8 shadow-brutal-sm group-hover:rotate-6 transition-transform duration-300" style={{ backgroundColor: "#ffee00" }}>
                <Upload strokeWidth={3} className="w-9 h-9 text-black" />
              </div>

              <h3 className="text-3xl md:text-4xl font-black text-black tracking-tight mb-3 uppercase">
                Upload Your Manifest
              </h3>
              <p className="text-black/50 text-base md:text-lg max-w-md mb-8 font-medium">
                Upload your manifest and we&apos;ll handle the rest. All
                protocols are securely parsed and integrated automatically.
              </p>

              <button className="bg-black text-white px-10 py-4 border-4 border-black font-black tracking-widest uppercase shadow-brutal-sm hover:bg-brutal-pink hover:text-black hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-brutal-none transition-all duration-150 active:translate-x-[6px] active:translate-y-[6px]">
                Select Manifest File
              </button>

              <p className="mt-6 text-xs text-black/40 font-bold tracking-widest uppercase">
                Drag &amp; Drop supported • .JSON, .YAML, .ZIP • MAX 250MB
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ──── PROBLEMS SECTION ──── */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-6xl mx-auto w-full px-8 py-24 relative z-10"
        >
          <div className="mb-16">
            <span className="inline-block bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-[0.3em] mb-6 rotate-[-1deg]">
              Why Annexa?
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black uppercase">
              The{" "}
              <span className="inline-block px-2 border-4 border-black shadow-brutal-sm rotate-1" style={{ backgroundColor: "#ff90e8" }}>
                Problem
              </span>{" "}
              with
              <br />
              Open Source
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cardData.map((card, i) => (
              <motion.div
                key={card.tag}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                viewport={{ once: true }}
                className="border-4 border-black p-8 shadow-brutal hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-brutal-none transition-all duration-200 cursor-default group"
                style={{ backgroundColor: card.bgColor }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-white border-3 border-black flex items-center justify-center shadow-brutal-sm group-hover:rotate-12 transition-transform duration-300">
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-black tracking-widest text-black/60 bg-white/60 px-3 py-1 border-2 border-black">
                    {card.tag}
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-black uppercase mb-3">
                  {card.title}
                </h3>
                <p className="text-black/70 text-sm leading-relaxed font-medium">
                  {card.body}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ──── FOOTER ──── */}
        <footer className="w-full py-12 mt-auto relative z-10 flex flex-col items-center justify-center border-t-4 border-black bg-white">
          <p className="text-black/40 font-black italic text-base uppercase tracking-wider">
            &quot;True security lies in rebuilding the foundation.&quot;
          </p>
          <div className="flex gap-3 mt-4">
            <div className="w-4 h-4 bg-brutal-yellow border-2 border-black" />
            <div className="w-4 h-4 bg-brutal-pink border-2 border-black" />
            <div className="w-4 h-4 bg-brutal-cyan border-2 border-black" />
            <div className="w-4 h-4 bg-brutal-green border-2 border-black" />
          </div>
        </footer>
      </main>
    </>
  );
}
