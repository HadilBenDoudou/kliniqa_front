"use client";
import React from "react";
import dynamic from 'next/dynamic';
const Profile = dynamic(() => import('./profile'), { ssr: false });
export default function signup() {
  return (
    <Profile />
  );
}
