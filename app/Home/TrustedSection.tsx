"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const TrustedSection = () => {
  return (
    <section
      className="py-12 px-4 sm:px-6 flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/TrustedSection/Why Choose Us.png')" }}
    >
      <Card className="max-w-6xl flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-white/80 p-6 shadow-lg">
        {/* Images */}
        <div className="relative w-full md:w-1/2 flex justify-center">
          {/* Image principale */}
          <motion.img
            src="/TrustedSection/Rectangle 3.png"
            alt="Patient"
            className="rounded-lg shadow-lg w-full sm:w-3/4 md:w-2/3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Badge en haut à droite */}
          <motion.div
            className="absolute -top-4 right-4 sm:-top-8 sm:right-2 bg-white rounded-full p-2 sm:p-3 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center border-2 border-gray-300 rounded-full">
              <img src="/TrustedSection/div.cs_about_mini_img.png" alt="Quality Badge" className="w-10 sm:w-12" />
            </div>
          </motion.div>

          {/* Image en bas plus grande */}
          <motion.div
            className="absolute -bottom-4 right-4 sm:bottom-[-30px] sm:right-[-30px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <img
              src="/TrustedSection/cta_img 1.png"
              alt="Doctor"
              className="w-24 h-24 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-full shadow-lg"
            />
          </motion.div>
        </div>

        {/* Texte */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            100% Trusted <br /> Organic Food Store
          </h2>
          <div className="mt-4 sm:mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <span className="text-red-600 text-lg sm:text-xl">✔</span>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Healthy & natural food for lovers of healthy food.
                </h3>
                <p className="text-gray-600 text-sm">
                  Ut quis tempus erat. Phasellus euismod bibendum magna non tristique.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <span className="text-red-600 text-lg sm:text-xl">✔</span>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Every day fresh and quality products for you.
                </h3>
                <p className="text-gray-600 text-sm">
                  Maecenas vehicula a justo quis laoreet. Sed in placerat nibh.
                </p>
              </div>
            </div>
          </div>

          {/* Bouton */}
          <Button className="bg-black text-white px-6 sm:px-8 py-3 rounded-full flex items-center justify-center mt-6 text-lg font-medium hover:bg-gray-900 transition-all w-full sm:w-auto">

            Shop Now →
          </Button>
        </div>
      </Card>
    </section>
  );
};

export default TrustedSection;
