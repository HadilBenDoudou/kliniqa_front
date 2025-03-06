"use client";
import React from "react";
import dynamic from 'next/dynamic';
const MapComponent = dynamic(() => import('./signup'), { ssr: false });
export default function signup() {
  return (
    <MapComponent />
  );
}
