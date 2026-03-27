"use client";

import TopNav from "@/components/TopNav";
import { Upload, ArrowRight, ShieldCheck, AlertTriangle, Scale, Heart } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    // Apply scroll snapping to the html element
    document.documentElement.style.scrollSnapType = "y mandatory";
    document.documentElement.style.scrollBehavior = "smooth";
    
    return () => {
      document.documentElement.style.scrollSnapType = "";
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  // Faster spring for direct-feeling scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 90,
    restDelta: 0.001
  });

  // Transform values for the scroll interaction
  const heroScale = useTransform(smoothProgress, [0, 0.4], [1, 0.9]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.4], [1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.4], [0, -80]);

  const uploadOpacity = useTransform(smoothProgress, [0.3, 0.55], [0, 1]);
  const uploadY = useTransform(smoothProgress, [0.3, 0.55], [60, 0]);
  const uploadScale = useTransform(smoothProgress, [0.3, 0.55], [0.95, 1]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 2500);
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
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
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
            exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: "circOut" }}
          >
            <div className="relative w-28 h-28 mb-8">
              <motion.div
                className="absolute inset-0 border-[6px] border-black/5 rounded-full"
              />
              <motion.div
                className="absolute inset-0 border-[6px] border-transparent border-t-black border-r-black rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className="text-2xl font-black tracking-tighter"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  A.
                </motion.span>
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40">
              Initializing Protocol
            </p>
            <div className="w-48 h-2 bg-black/5 border-2 border-black mt-6 overflow-hidden relative">
              <motion.div
                className="h-full bg-black"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── MAIN CONTAINER ──── */}
      <div ref={containerRef} className="h-[200vh] bg-[#fdfbf7] relative">
        {/* Snap Points */}
        <div className="h-screen snap-start pointer-events-none" />
        <div className="h-screen snap-start pointer-events-none" />

        {/* Fixed Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full" style={{ backgroundColor: "#ffee00" }} />
          <div className="absolute bottom-[-5%] left-[-5%] w-[25%] h-[25%] rounded-full" style={{ backgroundColor: "#ff90e8" }} />
        </div>

        <main className="fixed inset-0 flex flex-col overflow-hidden pt-20 pointer-events-none">
          <div className="pointer-events-auto">
            <TopNav />
          </div>

          <div className="flex-1 relative">
            {/* ──── SECTION 1: HERO (Fades out on scroll) ──── */}
            <motion.div
              style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
              className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center px-8 lg:px-20 gap-8 lg:gap-16 pointer-events-auto"
            >
              <div className="flex-1 flex flex-col items-start max-w-xl">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={isLoaded ? { x: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.5 }}
                  className="mb-4"
                >
                  <span className="inline-block border-2 border-black px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] shadow-brutal-sm -rotate-2" style={{ backgroundColor: "#ffee00" }}>
                    Clean Room as a Service
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={isLoaded ? { y: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.6 }}
                  className="text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-black uppercase leading-[0.9] tracking-tighter text-black mb-6"
                >
                  Rebuild from<br />
                  <span className="inline-block px-4 py-1 border-4 border-black shadow-brutal mt-2 rotate-1" style={{ backgroundColor: "#ff90e8" }}>
                    Principles.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={isLoaded ? { y: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.7 }}
                  className="text-black/60 text-base md:text-lg max-w-md leading-snug font-bold tracking-tight"
                >
                  Deploy isolated AI agents to observe, abstract, and rebuild software into independent, secure implementations.
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={isLoaded ? { y: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.8 }}
                  className="mt-8 flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full border-3 border-black flex items-center justify-center bg-white group-hover:bg-brutal-cyan transition-colors shadow-brutal-sm">
                    <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <ArrowRight className="rotate-90 w-5 h-5" />
                    </motion.div>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Scroll to start</span>
                </motion.div>
              </div>

              {/* HERO IMAGE WITH RANDOM CLIPPING */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
                animate={isLoaded ? { scale: 1, opacity: 1, rotate: 0 } : {}}
                transition={{ delay: 0.7, type: "spring", stiffness: 100, damping: 15 }}
                className="flex-1 relative w-full aspect-square max-w-[420px]"
              >
                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 clip-brutal-1" />
                <div className="absolute inset-0 border-4 border-black bg-white overflow-hidden clip-brutal-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="image.png"
                    alt="Annexa Hero"
                    className="w-full h-full object-cover object-left grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </div>

                {/* Floating Elements */}
                <div className="absolute top-[-15px] left-[-15px] w-16 h-16 border-4 border-black bg-brutal-cyan shadow-brutal-sm flex items-center justify-center -rotate-12">
                  <ShieldCheck strokeWidth={3} size={24} />
                </div>
                <div className="absolute bottom-[-5px] right-[-20px] px-3 py-1.5 border-3 border-black bg-brutal-green font-black text-[9px] uppercase tracking-widest rotate-6 shadow-brutal-sm">
                  VERIFIED.PROTO
                </div>
              </motion.div>
            </motion.div>

            {/* ──── SECTION 2: UPLOAD (Reveals on scroll) ──── */}
            <motion.div
              style={{ opacity: uploadOpacity, y: uploadY, scale: uploadScale }}
              className="absolute inset-0 flex flex-col items-center justify-center px-8 pointer-events-auto"
            >
              <div
                className={`w-full max-w-3xl bg-white border-6 ${isDragging
                  ? "border-brutal-cyan translate-x-[4px] translate-y-[4px] shadow-brutal-none"
                  : "border-black shadow-brutal-lg"
                  } p-12 md:p-16 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer group relative`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
              >
                {/* Visual Flair */}
                <div className="absolute top-[-30px] left-[-30px] w-20 h-20 border-3 border-black bg-brutal-yellow flex items-center justify-center shadow-brutal-sm rotate-[-15deg]">
                  <Upload size={32} strokeWidth={3} />
                </div>
                <div className="absolute bottom-[-15px] right-[10%] px-5 py-2.5 border-3 border-black bg-brutal-pink font-black text-[10px] uppercase tracking-[0.3em] rotate-[5deg] shadow-brutal-sm">
                  Drop it here ✦
                </div>

                <h3 className="text-4xl md:text-5xl lg:text-7xl font-black text-black tracking-tighter mb-4 uppercase leading-none">
                  Unleash your<br />manifest
                </h3>
                <p className="text-black/50 text-base md:text-lg lg:text-xl max-w-xl mb-10 font-bold leading-tight">
                  Drag and drop your protocols. Our isolated agents will parse, abstract, and rebuild your implementation in real-time.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                  <button className="flex-1 bg-black text-white px-8 py-5 border-4 border-black font-black text-xs tracking-widest uppercase shadow-brutal-sm hover:bg-brutal-cyan hover:text-black hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-brutal-none transition-all duration-150 active:scale-95">
                    Select File
                  </button>
                  <div className="hidden sm:flex items-center justify-center px-6 border-4 border-black bg-white shadow-brutal-sm font-black text-[10px] uppercase">
                    Max 250MB
                  </div>
                </div>

                <div className="mt-10 flex items-center gap-6 opacity-20 filter grayscale scale-90">
                  <ShieldCheck size={28} />
                  <Scale size={28} />
                  <AlertTriangle size={28} />
                  <Heart size={28} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Fixed Bottom Status Bar */}
          <footer className="h-16 border-t-4 border-black bg-white flex items-center justify-between px-8 z-50 pointer-events-auto">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brutal-green animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black/60">System Ready</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Active Agents: 02</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/60 italic">"Secure by architecture"</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => <div key={i} className={`w-3 h-3 border-2 border-black ${i % 2 === 0 ? 'bg-brutal-pink' : 'bg-brutal-cyan'}`} />)}
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
