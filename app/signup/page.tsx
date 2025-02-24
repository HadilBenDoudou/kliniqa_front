"use client";
import React from "react";
import dynamic from 'next/dynamic';
import { QueryClientWrapper } from "../QueryClientProvider";

const MapComponent = dynamic(() => import('./signup'), { ssr: false });

export default function signup() {
  return (
    
    <QueryClientWrapper >
    <MapComponent />
  </QueryClientWrapper>
  );
}
