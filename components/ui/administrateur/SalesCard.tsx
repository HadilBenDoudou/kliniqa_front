import { cn } from "@/lib/utils";
import React, { useState } from "react";

export type SalesProps = {
  name: string;
  email: string;
  image: string; // User-provided image URL
  etat: boolean; // Pharmacist status (true = Active, false = Inactive)
};

export default function SalesCard(props: SalesProps) {
  const [imageError, setImageError] = useState(false);
  const dicebearUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${props.name}`;

  // Function to get initials from email
  const getEmailInitials = (email: string): string => {
    const localPart = email.split("@")[0]; // Get part before "@"
    const parts = localPart.split("."); // Split by dots (e.g., "john.doe")
    const initials = parts
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
    return initials.length > 2 ? initials.slice(0, 2) : initials; // Limit to 2 characters
  };

  const initials = getEmailInitials(props.email);

  return (
    <div
      className="flex items-center justify-between w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <section className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden shadow-inner">
          {props.image && !imageError ? (
            <img
              src={props.image}
              alt={`${props.name}'s avatar`}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover rounded-full"
            />
          ) : (
            <span className="text-gray-600 dark:text-gray-300 font-semibold text-xl">
              {initials}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
            {props.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
            {props.email}
          </p>
        </div>
      </section>
      <span
        className={cn(
          "px-2 py-1 rounded-full text-white text-xs font-medium shadow-sm transition-colors duration-200",
          props.etat ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
        )}
        aria-label={props.etat ? "Active status" : "Inactive status"}
      >
        {props.etat ? "Active" : "Inactive"}
      </span>
    </div>
  );
}