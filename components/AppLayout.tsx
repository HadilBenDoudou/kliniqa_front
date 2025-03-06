"use client";

import React, { useState } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import AppSidebar from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import NotificationButton from "@/components/ui/notifications";
import ThemeToggle from "@/components/ui/ThemeToggle";

type BreadcrumbItemType = {
  label: string;
  href?: string;
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

interface AppLayoutProps {
  children: React.ReactNode;
  initialBreadcrumb?: BreadcrumbItemType[]; // Optional initial breadcrumb
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar onNavChange={(item) => console.log(item)} />
      <SidebarInset>
        <header className="flex h-16 items-center justify-between px-4 bg-[#FAFAFA] text-gray-800 dark:bg-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb /> {/* No items prop */}
          </div>
          <div className="flex items-center gap-4">
            <NotificationButton />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}