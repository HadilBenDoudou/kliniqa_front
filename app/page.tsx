"use client";
import React from "react";
import { QueryClientWrapper } from './QueryClientProvider';
import Signup from './signup/page';
export default function Home() {
  return (
    <QueryClientWrapper>
    <Signup />
  </QueryClientWrapper>
  );
}
