"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => router.push("/debut"), 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-screen bg-white"
        >
          <motion.div
            initial={{ x: -50, y: -50 }}
            animate={{ x: 0, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4"
          >
            <motion.img
              src="/splash/Logo2.png"
              alt="logo"
              className="w-16 h-16 sm:w-20 sm:h-20"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-3xl sm:text-4xl font-bold text-[#2c2cbd]"
            >
              Liniqa
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
