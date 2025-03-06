"use client";

import React from "react";
import AppLayout from "@/components/AppLayout";

export default function AdminPharmaciePage() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold">Admin Pharmacie Dashboard</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </AppLayout>
  );
}