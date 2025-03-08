
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CardProps = {
  label: string;
  icon: LucideIcon;
  amount: string;
  discription: string; 
};

export default function Card({ label, icon: Icon, amount, discription }: CardProps) {
  return (
    <CardContent>
      <section className="flex justify-between items-center gap-2">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <Icon className="h-5 w-5 text-gray-400" />
      </section>
      <section className="flex flex-col gap-1 mt-2">
        <h2 className="text-2xl font-bold text-gray-900">{amount}</h2>
        <p className="text-xs text-gray-500">{discription}</p>
      </section>
    </CardContent>
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border border-gray-200 p-5 shadow-md bg-white hover:shadow-lg transition-shadow duration-300",
        className
      )}
    />
  );
}