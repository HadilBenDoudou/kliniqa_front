"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

const initialNotifications = [
  { id: 1, user: "Chris Tompson", action: "commented on", target: "your post", timestamp: "15 min", unread: true },
  { id: 2, user: "Emma Davis", action: "liked", target: "your photo", timestamp: "45 min", unread: true },
];

function NotificationButton() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative rounded-xl bg-white p-3 shadow-md transition-all hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Open notifications"
        >
          <Bell size={20} strokeWidth={2} className="text-gray-800 dark:text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 right-0 min-w-5 rounded-full bg-red-500 px-2 text-white shadow-md">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-xl bg-white p-3 shadow-lg dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
          <button className="text-xs font-medium text-blue-600 hover:underline">Tout lire</button>
        </div>
        <div className="mt-2 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>{notification.user}</strong> {notification.action} <strong>{notification.target}</strong>.
                <div className="text-xs text-gray-500">{notification.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationButton;
