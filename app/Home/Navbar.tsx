"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown, Heart, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button"; // Importation de ShadCN UI

const categories = [
  "Doctors",
  "Laboratoire",
  "pharmacien",
  "Parapharmacie",
  "Logement",
  "Tourisme médical",
];

const Home = () => {
  const router = useRouter();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setCategoriesOpen(false);
      setMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategoryClick = (category: string) => {
    router.push(`/signup?role=${category}`);
  };

  return (
    <nav className="bg-black text-white flex items-center justify-between p-3 shadow-md relative flex-wrap sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        {/* Mobile Menu Button */}
        <Button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop Menu */}
        <div className="hidden md:flex md:flex-row md:space-x-6">
          <div className="relative">
            <Button
              className="flex items-center bg-[#333333] px-4 py-2 hover:bg-gray-700 transition-all"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
            >
              <div className="bg-red-500 px-3 py-2 flex items-center justify-center">
                <Menu className="h-5 w-5 text-white" />
              </div>
              <div className="text-white font-medium ml-3 flex-1 text-left">
                All Categories
              </div>
              <ChevronDown className="h-5 w-5 text-white" />
            </Button>

            {categoriesOpen && (
              <div className="absolute left-0 top-full bg-black text-white shadow-lg w-56 rounded-md z-50">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>

          {["Home", "Shop", "Pages", "Blog", "About Us", "Contact Us"].map(
            (item) => (
              <Button
                key={item}
                className="text-white text-sm font-medium hover:text-red-500 transition-all"
                onClick={() => router.push(`/${item.toLowerCase().replace(/\s+/g, "-")}`)}
              >
                {item}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Icons */}
      <div className="flex items-center space-x-4">
        <button className="relative p-2 hover:text-red-500 transition-all">
          <Heart className="h-6 w-6 text-white" />
        </button>
        <button className="relative p-2 hover:text-blue-500 transition-all">
          <ShoppingBag className="h-6 w-6 text-white" />
        </button>
        <button className="relative p-2 hover:text-green-500 transition-all">
          <User className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute left-0 top-full bg-black w-64 h-screen z-50 p-4 transform transition-transform duration-300 md:hidden">
          <button className="text-white mb-4" onClick={() => setMenuOpen(false)}>
            ✖ Close
          </button>

          <div className="relative">
            <Button
              className="flex items-center bg-[#333333] px-4 py-2 hover:bg-gray-700 transition-all w-full"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
            >
              <div className="bg-red-500 px-3 py-2 flex items-center justify-center">
                <Menu className="h-5 w-5 text-white" />
              </div>
              <div className="text-white font-medium ml-3 flex-1 text-left">
                All Categories
              </div>
              <ChevronDown className="h-5 w-5 text-white" />
            </Button>

            {categoriesOpen && (
              <div className="bg-black text-white shadow-lg w-full rounded-md mt-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>

          {["Home", "Shop", "Pages", "Blog", "About Us", "Contact Us"].map(
            (item) => (
              <Button
                key={item}
                className="text-white text-sm font-medium hover:text-red-500 transition-all w-full text-left mt-2"
                onClick={() => router.push(`/${item.toLowerCase().replace(/\s+/g, "-")}`)}
              >
                {item}
              </Button>
            )
          )}
        </div>
      )}
    </nav>
  );
};

export default Home;
