// lib/context/NotificationContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Notification {
  id: number;
  user: string; // Full name (nom + prenom)
  action: string;
  target: string;
  timestamp: string;
  unread: boolean;
  image?: string; // Optional image URL or base64 string
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "unread">) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, user: "Chris Tompson", action: "commented on", target: "your post", timestamp: "15 min", unread: true },
    { id: 2, user: "Emma Davis", action: "liked", target: "your photo", timestamp: "45 min", unread: true },
  ]);

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "unread">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(), // Unique ID based on timestamp
      timestamp: "Just now",
      unread: true,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};