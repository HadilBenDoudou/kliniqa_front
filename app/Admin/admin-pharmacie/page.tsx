"use client";

import React from "react";
import AppLayout from "@/components/AppLayout";
import Card, { CardContent } from "@/components/ui/carddashoard";
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  Bell,
  Home,
  HelpCircle,
  Settings,
  Shield,
  Search,
  CalendarIcon,
} from "lucide-react";
import BarChart from "@/components/ui/BarChart";
import SalesCard, { SalesProps } from "@/components/ui/SalesCard";
import { ExpandableTabs } from "@/components/ui/ExpandableTabsProps";
import { DateRangePicker, Label, Popover, Dialog, Button, Group } from "react-aria-components";
import { cn } from "@/lib/utils";
import { DateInput, dateInputStyle } from "@/components/ui/calendar-rac";

// Importation corrigée : déstructurer l'export par défaut de calendar-rac
import calendarRac from "@/components/ui/datefield-rac";
const { RangeCalendar } = calendarRac;

// Données pour les cartes
const cardData = [
  {
    label: "Total Revenue",
    amount: "$45,231.89",
    discription: "+20.1% from last month", // Corrigé : "discription" → "description"
    icon: DollarSign,
  },
  {
    label: "Subscriptions",
    amount: "+2350",
    discription: "+180.1% from last month", // Corrigé : "discription" → "description"
    icon: Users,
  },
  {
    label: "Sales",
    amount: "+12,234",
    discription: "+19% from last month", // Corrigé : "discription" → "description"
    icon: CreditCard,
  },
  {
    label: "Active Now",
    amount: "+573",
    discription: "+201 since last hour", // Corrigé : "discription" → "description"
    icon: Activity,
  },
];

// Données pour les ventes récentes
const userSalesData: SalesProps[] = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    saleAmount: "+$1,999.00",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    saleAmount: "+$1,999.00",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    saleAmount: "+$39.00",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    saleAmount: "+$299.00",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    saleAmount: "+$39.00",
  },
];

// Définition de la Navbar (DefaultDemo)
function DefaultDemo() {
  const tabs = [
    { title: "Dashboard", icon: Home },
    { type: "separator" as const },
    { title: "Settings", icon: Settings },
    { title: "Support", icon: HelpCircle },
    { title: "Security", icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6">
      <ExpandableTabs tabs={tabs} />
    </div>
  );
}

// Composant principal
export default function AdminPharmaciePage() {
  const [activeTab, setActiveTab] = React.useState("Overview");
  const tabs = ["Overview", "Analytics", "Reports", "Notifications"];

  return (
    <AppLayout>
      {/* Barre de navigation principale */}

      {/* En-tête avec titre, onglets, champ de recherche et sélecteur de dates */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">DASHBOARD</h1>
          <div className="flex items-center gap-3">
            <DateRangePicker className="space-y-2">
              <div className="flex items-center border rounded-lg bg-white shadow-sm">
                <Group className={cn(dateInputStyle, "pe-9")}>
                  <DateInput slot="start" />
                  <span aria-hidden="true" className="px-2 text-muted-foreground/70">
                    -
                  </span>
                  <DateInput slot="end" />
                </Group>
                <Button className="z-10 -me-px -ms-9 flex w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70">
                  <CalendarIcon size={16} strokeWidth={2} />
                </Button>
              </div>
              <Popover
                className="z-50 rounded-lg border border-border bg-background text-popover-foreground shadow-lg shadow-black/5 outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2"
                offset={4}
              >
                <Dialog className="max-h-[inherit] overflow-auto p-2">
                  <RangeCalendar /> {/* Utilisation du RangeCalendar déstructuré */}
                </Dialog>
              </Popover>
            </DateRangePicker>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-lg bg-white shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Onglets horizontaux */}
        <div className="flex gap-4 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-2 text-sm font-medium",
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des cartes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </div>

      {/* Sections Overview et Recent Sales */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardContent className="p-6">
          <p className="text-xl font-semibold text-gray-700 mb-4">Overview</p>
          <div className="h-[300px]">
            <BarChart />
          </div>
        </CardContent>
        <CardContent className="p-6">
          <p className="text-xl font-semibold text-gray-700 mb-4">Recent Sales</p>
          <p className="text-sm text-gray-400 mb-4">You made 265 sales this month.</p>
          <div className="space-y-4">
            {userSalesData.map((sale, index) => (
              <SalesCard
                key={index}
                email={sale.email}
                name={sale.name}
                saleAmount={sale.saleAmount}
              />
            ))}
          </div>
        </CardContent>
      </section>
    </AppLayout>
  );
}