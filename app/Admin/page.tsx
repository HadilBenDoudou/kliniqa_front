"use client";

import dynamic from "next/dynamic";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ModeToggle";

// Désactivation du SSR pour éviter les erreurs d'hydratation
const SidebarProvider = dynamic(() => import("@/components/ui/sidebar").then(mod => mod.SidebarProvider), { ssr: false });
const SidebarInset = dynamic(() => import("@/components/ui/sidebar").then(mod => mod.SidebarInset), { ssr: false });
const SidebarTrigger = dynamic(() => import("@/components/ui/sidebar").then(mod => mod.SidebarTrigger), { ssr: false });
const ThemeToggle = dynamic(() => import("@/components/ui/ThemeToggle"), { ssr: false });
const NotificationButton = dynamic(() => import("@/components/ui/notifications"), { ssr: false });

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center justify-between px-4 bg-[#FAFAFA] text-gray-800 dark:bg-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* Boutons de notifications et mode sombre */}
          <div className="flex items-center gap-4">
            <NotificationButton />
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
