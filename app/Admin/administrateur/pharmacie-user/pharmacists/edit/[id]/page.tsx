"use client";
import React from "react";
import dynamic from 'next/dynamic';
const Edit = dynamic(() => import('./edit'), { ssr: false });
export default function edite() {
  return (
    <Edit />
  );
}
