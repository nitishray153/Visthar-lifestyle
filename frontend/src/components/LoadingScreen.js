import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GOLD_LOGO = "https://customer-assets.emergentagent.com/job_eco-smart-hub/artifacts/2thwkzxn_visthar_logo-removebg-preview%20(1).png";

export default function LoadingScreen({ onComplete }) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 300);
        const t2 = setTimeout(() => setPhase(2), 1500);
        const t3 = setTimeout(() => onComplete(), 2500);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    return (
        <div className="loading-overlay" data-testid="loading-screen">
            {/* Pulse rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full border border-[#00FF66]/20"
                        initial={{ width: 100, height: 100, opacity: 0 }}
                        animate={phase >= 1 ? {
                            width: [100, 300 + i * 100],
                            height: [100, 300 + i * 100],
                            opacity: [0.5, 0],
                        } : {}}
                        transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                    />
                ))}
            </div>

            {/* Logo */}
            <motion.img
                src={GOLD_LOGO}
                alt="Visthar"
                className="w-24 h-24 md:w-32 md:h-32 object-contain relative z-10"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={phase >= 1 ? {
                    scale: [0.5, 1.1, 1],
                    opacity: 1,
                    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
                } : {}}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                    filter: phase >= 1 ? 'drop-shadow(0 0 30px rgba(0, 255, 102, 0.4))' : 'none'
                }}
            />

            {/* Brand Text */}
            <motion.div
                className="mt-6 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
            >
                <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 font-mono">Digital Lifestyle</p>
            </motion.div>

            {/* Loading bar */}
            <motion.div
                className="mt-8 w-32 h-px bg-zinc-800 rounded-full overflow-hidden relative z-10"
                initial={{ opacity: 0 }}
                animate={phase >= 1 ? { opacity: 1 } : {}}
            >
                <motion.div
                    className="h-full bg-[#00FF66]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
            </motion.div>
        </div>
    );
}
