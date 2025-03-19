"use client";

import * as React from "react";
import {
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
  Frame,
  PieChart,
  Map,
  House,
  BriefcaseMedical,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";


export const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/pharmacien",
      icon: House,
      isActive: true,
      items: [{ title: "Home", url: "/admin/pharmacien" },], // Explicitly empty for clarity
    },
    {
      title: "pharmacist",
      url: "#",
      icon: BriefcaseMedical,
      isActive: false,
      items: [{ title: "Products", url: "/admin/pharmacien/products" },
        { title: "Categorie", url: "/admin/pharmacien/categorie" },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        { title: "Genesis", url: "/admin/administrateur/pharmacie-user/Genesis" },
        { title: "Explorer", url: "#" },
        { title: "Quantum", url: "#" },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Introduction", url: "#" },
        { title: "Get Started", url: "#" },
        { title: "Tutorials", url: "#" },
        { title: "Changelog", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
  ],
  projects: [
    { name: "Design Engineering", url: "#", icon: Frame },
    { name: "Sales & Marketing", url: "#", icon: PieChart },
    { name: "Travel", url: "#", icon: Map },
  ],
};

// Type definitions
type NavItem = {
  title: string;
  url: string;
};

type NavMainItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  isActive?: boolean;
  items?: NavItem[]; // Made optional to reflect reality
};

type AppSidebarProps = {
  onNavChange: (item: NavItem, parent?: NavMainItem) => void;
};

export default function AppSidebar({ onNavChange, ...props }: AppSidebarProps) {
  const handleNavigation = (item: NavItem, parent?: NavMainItem) => {
    onNavChange(item, parent);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-0 h-12 flex items-center justify-center">
        <img
          src="/logo/logo.png"
          alt="Team Logo"
          className="w-auto h-8 mx-auto object-contain" // Reduced height to fit within h-12
        />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} onItemClick={handleNavigation} />
        <NavProjects projects={data.projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser /> {/* Add props here if NavUser expects them */}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}