"use client";
import React from "react";

export default function LogoAndAddress() {
  return (
    <div className="flex items-center space-x-4 p-4 absolute top-0 left-0">
      <img src="/logo/logo.png" alt="Kliniqa Logo" className="h-10" />
      <span className="text-xs md:text-sm text-gray-500">
        Store Location: Lincoln-344, Illinois, Chicago, USA
      </span>
    </div>
  );
}
