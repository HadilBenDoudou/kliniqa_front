"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/ui/administrateur/AppLayout";
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  Home,
  HelpCircle,
  Settings,
  Shield,
} from "lucide-react";
import BarChart from "@/components/ui/BarChart";
import SalesCard, { SalesProps } from "@/components/ui/administrateur/SalesCard";
import { ExpandableTabs } from "@/components/ui/ExpandableTabsProps";
import { cn } from "@/lib/utils";
import { fetchUsers, User } from "@/lib/services/Admin_pharmacie/userService";
import { fetchPharmacien, Pharmacien } from "@/lib/services/profile/userservice";
import { motion } from "framer-motion";
import Card, { CardContent } from "@/components/ui/administrateur/carddashoard";

// Define the box style for the loading animation
const box = {
  width: 20,
  height: 20,
  backgroundColor: "#2d2dc1",
  borderRadius: 5,
};

// Function to calculate dynamic card data
const calculateCardData = (users: User[]) => {
  const pharmacists = users.filter((user) => user.role === "pharmacien"); // Filter only pharmacists
  const totalPharmacists = pharmacists.length;
  const activePharmacists = pharmacists.filter((user) => user.status === "Active").length;
  const newPharmacistsThisMonth = pharmacists.filter((user) => {
    const createdDate = new Date(user.created_at);
    const now = new Date();
    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return [
    {
      label: "Total Pharmacists",
      amount: `${totalPharmacists}`,
      discription: "Total registered pharmacists",
      icon: Users,
    },
    {
      label: "Active Pharmacists",
      amount: `${activePharmacists}`,
      discription: `${totalPharmacists > 0 ? Math.round((activePharmacists / totalPharmacists) * 100) : 0}% of total`,
      icon: Activity,
    },
    {
      label: "New This Month",
      amount: `+${newPharmacistsThisMonth}`,
      discription: "New registrations this month",
      icon: CreditCard,
    },
    {
      label: "Pending Approvals",
      amount: `${pharmacists.filter((user) => user.status === "Pending").length}`,
      discription: "Awaiting approval",
      icon: DollarSign,
    },
  ];
};

// Function to transform user data into SalesProps with pharmacist status
const transformUserToSales = async (users: User[]): Promise<SalesProps[]> => {
  const pharmacists = users.filter((user) => user.role === "pharmacien"); // Filter only pharmacists
  const sortedUsers = pharmacists
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const salesDataPromises = sortedUsers.map(async (user) => {
    let etat = false; // Default to false if no pharmacist data
    try {
      const pharmacien: Pharmacien = await fetchPharmacien(user.id);
      etat = pharmacien.etat;
    } catch (error) {
      console.error(`Error fetching pharmacist data for user ${user.id}:`, error);
    }
    return {
      name: `${user.prenom} ${user.nom}`,
      email: user.email,
      image: user.image || "",
      etat: etat,
    };
  });

  return Promise.all(salesDataPromises);
};

// Navbar (DefaultDemo)
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

// Main Component
export default function AdminPharmaciePage() {
  const [activeTab, setActiveTab] = React.useState("Overview");
  const tabs = ["Overview", "Analytics", "Reports", "Notifications"];

  // Fetch users with Tanstack Query
  const { data: users = [], isLoading: isUsersLoading, error: usersError } = useQuery<User[]>({
    queryKey: ["pharmacists"],
    queryFn: fetchUsers,
  });

  // Fetch recent sales data (transformed with pharmacist status)
  const { data: recentSalesData = [], isLoading: isSalesLoading, error: salesError } = useQuery<SalesProps[]>({
    queryKey: ["recentSales", users],
    queryFn: () => transformUserToSales(users),
    enabled: !!users.length, // Only run when users are fetched
  });

  // Calculate card data
  const cardData = React.useMemo(() => calculateCardData(users), [users]);

  if (isUsersLoading || isSalesLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{
              scale: [1, 2, 2, 1, 1],
              rotate: [0, 0, 180, 180, 0],
              borderRadius: ["0%", "0%", "50%", "50%", "0%"],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.2, 0.5, 0.8, 1],
              repeat: Infinity,
              repeatDelay: 1,
            }}
            style={box}
          />
        </div>
      </AppLayout>
    );
  }

  if (usersError || salesError) {
    return (
      <div>
        Error fetching data: {(usersError as Error)?.message || (salesError as Error)?.message}
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 mb-6">
        {/* Welcome Message */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Welcome, Administrator!
            </h1>
          </div>
        </div>

        <div className="flex gap-4 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-2 text-sm font-medium",
                activeTab === tab
                  ? "text-[#2c2cbd] border-b-2 border-[#2d2dc1]"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </div>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardContent className="p-6">
          <p className="text-xl font-semibold text-gray-700 mb-4">Overview</p>
          <div className="h-[300px]">
            <BarChart />
          </div>
        </CardContent>
        <CardContent className="p-6">
          <p className="text-xl font-semibold text-gray-700 mb-4">Recent Registrations</p>
          <p className="text-sm text-gray-400 mb-4">
            {recentSalesData.length} new pharmacists registered recently.
          </p>
          <div className="space-y-4">
            {recentSalesData.map((sale, index) => (
              <SalesCard
                key={index}
                name={sale.name}
                email={sale.email}
                image={sale.image}
                etat={sale.etat}
              />
            ))}
          </div>
        </CardContent>
      </section>
    </AppLayout>
  );
}