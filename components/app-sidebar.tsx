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
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export const data = {
  
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [{ title: "Home", url: "/admin/admin-pharmacie" }],
    },
    {
      title: "Account",
      url: "#",
      icon: SquareTerminal,
      isActive: false,
      items: [{ title: "Pharmacie", url: "/admin/admin-pharmacie/pharmacie-user" }],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        { title: "Genesis", url: "/admin/admin-pharmacie/pharmacie-user/Genesis" },
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

type NavItem = {
  title: string;
  url: string;
};

type NavMainItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  isActive?: boolean;
  items: NavItem[];
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
   <SidebarHeader className="p-0 h-12">
  <img
    src="/logo/logo.png"
    alt="Team Logo"
    className="w-auto h-10 mx-auto object-contain"
    style={{ marginTop: '20px' }}
  />
</SidebarHeader>


      <SidebarContent>
        <NavMain items={data.navMain} onItemClick={handleNavigation} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser  />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}