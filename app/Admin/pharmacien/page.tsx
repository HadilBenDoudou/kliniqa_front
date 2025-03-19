"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Card, { CardContent } from "@/components/ui/pharmacien/carddashoard";
import LineChart from "@/components/ui/LineChart";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import AppLayout from "@/components/ui/pharmacien/AppLayout";
import { useSearchParams } from "next/navigation";

// Define the box style for the loading animation
const box = {
  width: 20,
  height: 20,
  backgroundColor: "#2d2dc1",
  borderRadius: 5,
};

// Sample health data (mocked for now)
const fetchHealthData = async () => {
  return {
    bloodPressure: "110/96",
    heartRate: "105 BPM",
    temperature: "36°C",
    bloodCount: "9,871/ml",
  };
};

export default function HealthDashboardPage() {
  const searchParams = useSearchParams();
  const userName = searchParams.get("userName") || "User";

  const [activeTab, setActiveTab] = React.useState("Overview");
  const tabs = ["Overview", "Analytics", "Reports", "Notifications"];

  const {
    data: healthData,
    isLoading: isHealthDataLoading,
    error: healthDataError,
  } = useQuery({
    queryKey: ["healthData"],
    queryFn: fetchHealthData,
  });

  const healthCardData = React.useMemo(
    () => [
      {
        label: "Blood Pressure",
        amount: healthData?.bloodPressure || "N/A",
        description: "",
        imageSrc: "/card/blood-pressure_3389235.png",
      },
      {
        label: "Heart Rate",
        amount: healthData?.heartRate || "N/A",
        description: "",
        imageSrc: "/card/heart-rate_3486468.png",
      },
      {
        label: "Temperature",
        amount: healthData?.temperature || "N/A",
        description: "",
        imageSrc: "/card/celsius_4958671 (1).png",
      },
      {
        label: "Blood Count",
        amount: healthData?.bloodCount || "N/A",
        description: "",
        imageSrc: "/card/blood-group_8836702.png",
      },
    ],
    [healthData]
  );

  if (isHealthDataLoading) {
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

  if (healthDataError) {
    return (
      <div>
        Error fetching data: {(healthDataError as Error)?.message}
      </div>
    );
  }

  return (
    <AppLayout>
        <div>
      <h1 className="text-xl font-bold text-black">Good Morning, {userName}!</h1> {/* Reduced from text-2xl to text-xl */}
      <p className="text-xs mt-1 text-black">Let’s care with pharmacists</p> {/* Reduced from text-sm to text-xs and mt-2 to mt-1 */}
    </div>
      {/* Health Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {healthCardData.map((card, index) => (
          <Card
            key={index}
            label={card.label}
            amount={card.amount}
            description={card.description}
            imageSrc={card.imageSrc}
          />
        ))}
      </div>

      {/* Welcome Section and Calendar */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6 mt-6">
  <div
    className="w-full lg:w-2/3 text-white p-2 rounded-lg flex items-center bg-cover bg-center min-h-[5px]"
    style={{ 
      backgroundImage: "url('/pharmacie/Pharmacist-pana.svg')",
      backgroundSize: "90%", // Scales the background image to 50% of its original size
      backgroundRepeat: "no-repeat" // Prevents tiling if the image is smaller than the container
    }}
  >
    
  </div>


        <div className="w-full lg:w-1/3 p-4 bg-white shadow rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-semibold text-gray-700">December 2022</p>
            <div className="flex gap-2">
              <button className="text-gray-500"></button>
              <button className="text-gray-500"></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
              <div key={idx} className="text-gray-500 font-medium">
                {day}
              </div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
              <div
                key={date}
                className={cn(
                  "p-2 rounded-full",
                  date === 19 ? "bg-[#2d2dc1] text-white" : "text-gray-700" // Updated highlight color to #2d2dc1
                )}
              >
                {date}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Dentist: Dec 19, 2022 10:00</p>
            <p className="text-sm text-gray-500">Radiologist: Dec 19, 2022 14:00</p>
          </div>
        </div>
      </div>

      {/* Graph and Medicine Sections */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CardContent className="p-6 col-span-2">
          <p className="text-xl font-semibold text-gray-700 mb-4">
            Statistics of Your Health
          </p>
          <div className="h-[300px]">
            <LineChart />
          </div>
        </CardContent>

        <CardContent className="p-4">
          <p className="text-lg font-semibold text-gray-700 mb-4">Medicine</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2d2dc1]/10 rounded-full">
                <span className="text-[#2d2dc1]">2</span> {/* Updated colors */}
              </div>
              <div>
                <p className="text-sm font-medium">Paracetamol</p>
                <p className="text-xs text-gray-500">2 times pre day, eating</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2d2dc1]/10 rounded-full">
                <span className="text-[#2d2dc1]">2</span> {/* Updated colors */}
              </div>
              <div>
                <p className="text-sm font-medium">Antihistamine</p>
                <p className="text-xs text-gray-500">2 times pre day, eating</p>
              </div>
            </div>
            <button className="w-full mt-2 text-[#2d2dc1] text-sm font-medium hover:underline">
              View All
            </button>
          </div>
        </CardContent>
      </section>
    </AppLayout>
  );
}