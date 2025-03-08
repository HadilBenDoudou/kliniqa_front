"use client";

import { HoverEffect } from "@/components/ui/service/hover-effect";
import { useState } from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react"; // Icône pour la flèche

export function CardHoverEffectDemo() {
  const [showAll, setShowAll] = useState(false);

  // Liste des services avec des icônes (images)
  const services = [
    {
      title: "Patient space",
      description: "Access dedicated tools and resources for patients.",
      link: "/patient-space",
      icon: "/serviceicon/image1.svg", // Ajustez l'extension selon vos fichiers
    },
    {
      title: "Doctor space",
      description: "A platform for doctors to manage their practice.",
      link: "/doctor-space",
      icon: "/serviceicon/image2.svg", // Ajustez l'extension selon vos fichiers
    },
    {
      title: "Logement",
      description: "Find housing solutions for medical travelers.",
      link: "/logement",
      icon: "/serviceicon/Vector.svg", // Ajustez l'extension selon vos fichiers
    },
    {
      title: "Pharmacy",
      description: "Access pharmaceutical services and products.",
      link: "/pharmacy",
      icon: "/serviceicon/Group.svg", // Ajustez l'extension selon vos fichiers
    },
    {
      title: "Para-pharmacy",
      description: "Explore non-prescription health and wellness products.",
      link: "/para-pharmacy",
      icon: "/serviceicon/image3.svg", // Ajustez l'extension selon vos fichiers
    },
    {
      title: "Medical tourism",
      description: "Plan your medical travel with ease.",
      link: "/medical-tourism",
      icon: "/serviceicon/Frame.svg", // Ajustez l'extension selon vos fichiers
    },
    {
      title: "Prayer healing",
      description: "Support for spiritual healing and wellness.",
      link: "/prayer-healing",
      icon: "/serviceicon/image4.svg", // Ajustez l'extension selon vos fichiers
    },
    {
      title: "Labs",
      description: "Access laboratory services for diagnostics.",
      link: "/labs",
      icon: "/serviceicon/tasbih.svg", // Ajustez l'extension selon vos fichiers
    },
  ];

  // Afficher seulement les 6 premiers services si showAll est faux
  const displayedServices = showAll ? services : services.slice(0, 6);

  return (
    <div className="max-w-5xl mx-auto px-8">
      <HoverEffect items={displayedServices} />
      {!showAll && services.length > 6 && (
        <div className="flex justify-end mt-0">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault(); // Empêche le comportement par défaut du lien
              setShowAll(true); // Affiche tous les services
            }}
            className="text-[#2c2cbd] hover:text-[#2c2cbd]/80 flex items-center gap-2"
          >
            View more
            <MoveRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}