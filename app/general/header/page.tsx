"use client";
import React from "react";
import Image from "next/image";
import { Button } from "react-aria-components";
import Link from "next/link"; // Ajouté pour les liens de navigation

function Header() {
  const Menu = [
    { id: 1, name: "Home", path: "/" },
    { id: 2, name: "About", path: "/about" },
    { id: 3, name: "Services", path: "/services" },
    { id: 4, name: "Contact", path: "/contact" },
  ];

  return (
    <header className="flex items-center justify-between p-4 shadow-sm md:px-20">
      <div className="flex items-center gap-10">
        <Image
          src="/logo/logo.png"
          alt="Kliniqa Logo"
          width={180}
          height={80}
          priority // Ajouté pour optimiser le chargement du logo
        />
        <div className="md:flex gap-10 hidden">
          {Menu.map((item) => (
            <nav key={item.id}>
              <Link href={item.path} className="hover:text-blue-600 transition-colors">
                <span className="hover:text-primary cursor-pointer hover:scale-105 transition-all ease-in-out">
                  {item.name}
                </span>
              </Link>
            </nav>
          ))}
        </div>
      </div>
      <Button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Get Started
      </Button>
    </header>
  );
}

export default Header;