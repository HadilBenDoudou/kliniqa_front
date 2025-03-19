"use client";

import React, { useState, JSX } from "react";
import { Heart, Star, Stethoscope, MapPin, HeartPulse, Eye, Sun, Brain, Baby } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

// Interface pour un médecin
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  location: string;
  reviews: string;
  rating: number;
  image: string;
}

// Liste des médecins
const doctors: Doctor[] = [
  { id: 1, name: "Dr. Mohamed Ali Sliman", specialty: "Generalist", location: "Tunis, Nabeul", reviews: "1,872 Reviews", rating: 5, image: "/doctors/doctor1.png" },
  { id: 2, name: "Dr. Sami Derman", specialty: "Generalist", location: "Tunis, Nabeul", reviews: "1,872 Reviews", rating: 5, image: "/doctors/doctor2.png" },
  { id: 3, name: "Dr. Alfa Miled", specialty: "Cardiology", location: "Tunis, Nabeul", reviews: "1,872 Reviews", rating: 5, image: "/doctors/doctor3.png" },
  { id: 4, name: "Dr. Sami Derman", specialty: "Ophthalmology", location: "Tunis, Nabeul", reviews: "1,872 Reviews", rating: 5, image: "/doctors/doctor2.png" },
];

// Liste des catégories médicales avec icônes associées
const categoriesWithIcons = [
  { name: "Primary care", image: "/doctors/icons/stethoscope.svg" },
  { name: "Dentist", image: "/doctors/icons/tooth.png" },
  { name: "Dermatologist", image: "/doctors/icons/sun.png" },
  { name: "Ophthalmology", image: "/doctors/icons/eye.png" },
  { name: "Cardiology", image: "/doctors/icons/heart2.png" },
  { name: "Obstetrics", image: "/doctors/icons/baby.png" },
  { name: "Psychiatrist", image: "/doctors/icons/brain.png" },
];

// Mapping des icônes par spécialité
const specialtyIcons: Record<string, JSX.Element> = {
  Generalist: <Stethoscope className="w-4 h-4 text-blue-600" />,
  Cardiology: <HeartPulse className="w-4 h-4 text-red-500" />,
  Ophthalmology: <Eye className="w-4 h-4 text-blue-400" />,
  Dermatologist: <Sun className="w-4 h-4 text-yellow-500" />,
  Psychiatrist: <Brain className="w-4 h-4 text-purple-500" />,
};

// Variants pour l'animation des cartes (gauche/droite)
const getCardVariants = (index: number) => ({
  hidden: { opacity: 0, x: index % 2 === 0 ? -100 : 100 }, // Gauche (-100) pour impair, Droite (100) pour pair
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
  exit: { 
    opacity: 0, 
    x: index % 2 === 0 ? 100 : -100, // Sort vers la droite pour impair, gauche pour pair
    transition: { duration: 0.3, ease: "easeIn" } 
  },
});

const DoctorsSection = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 }); // Détection du défilement

  // Gestion du bouton Favoris
  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  return (
    <section
      ref={sectionRef}
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-center text-gray-900"
      >
        Easy Doctor’s Appointment
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center text-gray-600 mt-2"
      >
        Your journey to better health starts with a simple, efficient, and patient-focused appointment booking process.
      </motion.p>

      {/* Catégories médicales */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-wrap justify-center gap-3 mt-6"
      >
        {categoriesWithIcons.map((category, index) => (
          <Button
            key={index}
            onClick={() => setSelectedCategory(category.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              selectedCategory === category.name
                ? "bg-blue-600 text-white"
                : "border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <img src={category.image} alt={category.name} className="w-5 h-5" />
            {category.name}
          </Button>
        ))}
      </motion.div>

      {/* Liste des médecins avec animation gauche/droite */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {doctors.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            variants={getCardVariants(index)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            exit="exit"
            className="relative bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <Button
              className="absolute top-4 right-4 p-2 rounded-full border border-gray-300 backdrop-blur-md bg-white/50"
              onClick={() => toggleFavorite(doctor.id)}
            >
              <Heart
                className={`w-6 h-6 transition-all ${
                  favorites.includes(doctor.id) ? "text-red-500 fill-red-500" : "text-gray-300"
                }`}
                fill="currentColor"
              />
            </Button>

            <img src={doctor.image} alt={doctor.name} className="w-full h-48 object-cover rounded-md" />

            <h3 className="text-lg font-bold text-gray-900 mt-3">{doctor.name}</h3>

            <p className="text-gray-600 flex items-center gap-2">
              {specialtyIcons[doctor.specialty]}
              {doctor.specialty}
            </p>

            <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-red-500" />
              <img src="/pays/tunisia.png" alt="Tunisia" className="w-4 h-4" />
              {doctor.location}
            </p>

            <div className="flex items-center gap-1 mt-2">
              <Star className="text-yellow-500 w-5 h-5 fill-yellow-500" />
              <span className="text-gray-700 font-medium">{doctor.rating}.0</span>
              <span className="text-gray-500">({doctor.reviews})</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const services = [
  { name: "Routine Check-Ups" },
  { name: "Prosthodontics", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry." },
  { name: "Pediatric Dentistry" },
  { name: "Cosmetic Dentistry" },
];

const HomePage = () => {
  return (
    <div>
      <DoctorsSection />
    </div>
  );
};

export default HomePage;