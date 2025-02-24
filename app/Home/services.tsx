import React from "react";
import { Button } from "@/components/ui/button";

const ServicesSection = () => {
  const services = [
    { name: "Vaccine", image: "/icons/vaccine.png" },
    { name: "Clinic", image: "/icons/user3.png" },
    { name: "Self Care", image: "/icons/self-care.png" },
    { name: "Laboratory", image: "/icons/laboratory.png" },
    { name: "Treatment", image: "/icons/treatment.png" },
    { name: "Pet Health", image: "/icons/pet-health.png" },
    { name: "Symptoms", image: "/icons/symptoms.png" },
    { name: "Check Up", image: "/icons/check-up.png" },
  ];

  return (
    <section className="py-12 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900">Nos services</h2>
          <Button variant="ghost" className="mt-4 md:mt-0 text-[#2c2cbd] font-bold hover:bg-transparent">
  View All →
</Button>


        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="p-6 rounded-xl shadow-md transition-all text-center border border-gray-200 hover:bg-blue-600 hover:text-white cursor-pointer"
            >
              <img src={service.image} alt={service.name} className="h-12 w-12 mx-auto transition-all" />
              <h3 className="font-semibold mt-4">{service.name}</h3>
              <p className="text-sm mt-2 opacity-80">Lorem ipsum matkasse vir. Monogedade bevis</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
