"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/breadcrumb";
import dynamic from "next/dynamic";
import AppSidebar from "@/components/app-sidebar";

const ThemeToggle = dynamic(() => import("@/components/ui/ThemeToggle"), { ssr: false });
const NotificationButton = dynamic(() => import("@/components/ui/notifications"), { ssr: false });

export default function Header() {
  return (
    <>
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
      <AppSidebar onNavChange={(item, parent) => console.log("Nav:", item, "Parent:", parent)} /> {/* Optional logging */}
    </>
  );
}