"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/header/navigation-menu";
import { Menu, MoveRight, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function Header1() {
  const navigationItems = [
    { title: "Home", href: "/", description: "" },
    {
      title: "Product",
      description: "Managing a small business today is already tough.",
      items: [
        { title: "Reports", href: "/reports" },
        { title: "Statistics", href: "/statistics" },
        { title: "Dashboards", href: "/dashboards" },
        { title: "Recordings", href: "/recordings" },
      ],
    },
    {
      title: "Company",
      description: "Managing a small business today is already tough.",
      items: [
        { title: "About us", href: "/about" },
        { title: "Fundraising", href: "/fundraising" },
        { title: "Investors", href: "/investors" },
        { title: "Contact us", href: "/contact" },
      ],
    },
  ];

  const getStartedItems = [
    { title: "Doctors", href: "/get-started/doctors" },
    { title: "Laboratoire", href: "/get-started/laboratoire" },
    { title: "Pharmacien", href: "/get-started/pharmacien" },
    { title: "Parapharmacie", href: "/get-started/parapharmacie" },
    { title: "Logement", href: "/get-started/logement" },
    { title: "Tourisme médical", href: "/get-started/tourisme-medical" },
  ];

  const [isOpen, setOpen] = useState(false);
  const [isGetStartedOpen, setGetStartedOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStartedClick = (href:any) => {
    const role = href.split("/").pop();
    window.location.href = `/signup?role=${role}`;
    setGetStartedOpen(false);
  };

  return (
    <header
      className={`w-full fixed top-0 z-40 transition-all duration-300 ${
        isScrolled ? "bg-black/50 backdrop-blur-lg shadow-lg" : "bg-black/20 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto min-h-20 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center px-6 py-4">
        <div className="justify-start items-center gap-4 lg:flex hidden flex-row">
          <NavigationMenu className="flex justify-start items-start">
          <img
    src="/logo/logo.png"
    alt="Kliniqa Logo"
    className="h-10 mr-10" // Ajout de mr-10 pour 10px d'espace à droite
  />
            <NavigationMenuList className="flex justify-start gap-4 flex-row">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.href ? (
                    <NavigationMenuLink asChild>
                      <Button variant="ghost" className="text-white hover:text-red-500">
                        {item.title}
                      </Button>
                    </NavigationMenuLink>
                  ) : (
                    <>
                      <NavigationMenuTrigger className="font-medium text-sm text-white hover:text-red-500 bg-transparent hover:bg-transparent">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="!w-[450px] p-4 bg-black border-gray-800">
                        <div className="flex flex-col lg:grid grid-cols-2 gap-4">
                          <div className="flex flex-col h-full justify-between">
                            <div className="flex flex-col">
                              <p className="text-base text-white">{item.title}</p>
                              <p className="text-gray-400 text-sm">{item.description}</p>
                            </div>
                            <Button size="sm" className="mt-10 bg-white text-black hover:bg-red-500 hover:text-white">
                              Book a call today
                            </Button>
                          </div>
                          <div className="flex flex-col text-sm h-full justify-end">
                            {item.items?.map((subItem) => (
                              <NavigationMenuLink
                                href={subItem.href}
                                key={subItem.title}
                                className="flex flex-row justify-between items-center text-white hover:text-red-500 hover:bg-gray-800 py-2 px-4 rounded"
                              >
                                <span>{subItem.title}</span>
                                <MoveRight className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex lg:justify-center">
        </div>
        <div className="flex justify-end w-full gap-4 relative">
          <Button variant="outline" className="text-black border-white hover:text-red-500 hover:border-red-500 hover:bg-black">
            Sign in
          </Button>
          <div className="relative">
            <Button className="bg-white text-black hover:bg-red-500 hover:text-white flex items-center gap-2" onClick={() => setGetStartedOpen(!isGetStartedOpen)}>
              Get started
              <ChevronDown className="w-4 h-4" />
            </Button>
            {isGetStartedOpen && (
              <div className="absolute top-12 right-0 bg-black border border-gray-800 shadow-lg rounded-md p-2 flex flex-col w-48 z-50">
                {getStartedItems.map((item) => (
                  <button key={item.title} onClick={() => handleGetStartedClick(item.href)} className="text-white hover:text-red-500 hover:bg-gray-800 py-2 px-4 rounded text-left">
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex w-12 shrink lg:hidden items-end justify-end">
          <Button variant="ghost" onClick={() => setOpen(!isOpen)} className="text-white hover:text-red-500">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          {isOpen && (
            <div className="absolute top-20 border-t border-gray-800 flex flex-col w-full right-0 bg-black shadow-lg py-4 container gap-8">
              {navigationItems.map((item) => (
                <div key={item.title}>
                  <div className="flex flex-col gap-2">
                    {item.href ? (
                      <Link href={item.href} className="flex justify-between items-center text-white hover:text-red-500">
                        <span className="text-lg">{item.title}</span>
                        <MoveRight className="w-4 h-4 stroke-1 text-gray-400 hover:text-red-500" />
                      </Link>
                    ) : (
                      <>
                        <p className="text-lg text-white">{item.title}</p>
                        {item.items &&
                          item.items.map((subItem) => (
                            <Link key={subItem.title} href={subItem.href} className="flex justify-between items-center text-gray-400 hover:text-red-500">
                              <span>{subItem.title}</span>
                              <MoveRight className="w-4 h-4 stroke-1 hover:text-red-500" />
                            </Link>
                          ))}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export { Header1 };
