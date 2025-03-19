import React from "react";
import { cn } from "@/lib/utils";

export type CardProps = {
  label: string;
  imageSrc?: string;
  amount: string;
  description: string;
};

export default function Card({ label, imageSrc, amount, description }: CardProps) {
  return (
    <CardContent>
      <section className="flex justify-between items-center gap-2">
        <p className="text-sm font-medium text-gray-600 group-hover:text-white transition-colors duration-300">
          {label}
        </p>
        {imageSrc && (
          <img
            src={imageSrc}
            alt={`${label} icon`}
            className="h-12 w-12" // Corrected to h-12 w-12 (valid Tailwind classes)
          />
        )}
      </section>
      <section className="flex flex-col gap-1 mt-2">
        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300">
          {amount}
        </h2>
        <p className="text-xs text-gray-500 group-hover:text-gray-200 transition-colors duration-300">
          {description}
        </p>
      </section>
    </CardContent>
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "group flex w-full flex-col gap-3 rounded-xl border border-gray-200 p-5 shadow-md bg-white hover:bg-[#2d2dc1] hover:shadow-lg transition-all duration-300",
        className
      )}
      {...props}
    />
  );
}