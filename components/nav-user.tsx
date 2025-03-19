"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserById, User, fetchPharmacien, Pharmacien } from "@/lib/services/profile/userservice";
import { LogOut, ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutUser } from "@/lib/services/auth/authService";

// CSS styles for the animated loading bar
const loadingBarStyles = `
  .loading-bar-container {
    width: 100%;
    height: 4px;
    background-color: #e5e7eb; /* gray-200 */
    border-radius: 2px;
    overflow: hidden;
    margin-left: 8px;
  }
  .loading-bar {
    height: 100%;
    background-color: #4b5563; /* gray-600 */
    animation: loading 2s infinite ease-in-out;
  }
  @keyframes loading {
    0% { width: 0%; }
    50% { width: 80%; }
    100% { width: 0%; }
  }
`;

export function NavUser() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<number | null>(null);

  // Fetch userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log("Stored userId:", storedUserId);
    if (storedUserId) {
      const parsedId = Number(storedUserId);
      setUserId(parsedId > 0 ? parsedId : null);
    }
  }, []);

  // Fetch user data
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: userId ? ["user", userId] : ["user"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is null");
      return fetchUserById(userId);
    },
    enabled: !!userId && userId > 0,
    retry: 1,
  });

  // Fetch pharmacist data (only if role is "pharmacien")
  const { data: pharmacien, isLoading: pharmacienLoading, error: pharmacienError } = useQuery<Pharmacien>({
    queryKey: userId && user?.role === "pharmacien" ? ["pharmacien", userId] : ["pharmacien"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is null");
      return fetchPharmacien(userId);
    },
    enabled: !!userId && userId > 0 && user?.role === "pharmacien",
    retry: 1,
  });

  const handleLogout = async () => {
    try {
      console.log("Attempting logout...");
      await logoutUser();
      console.log("Logout successful");

      localStorage.removeItem("userId");
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUserId(null);
      queryClient.clear(); // Clear query cache on logout
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("userId");
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUserId(null);
      queryClient.clear();
      router.push("/login");
    }
  };

  const handleProfile = () => {
    router.push("/admin/profile");
  };

  console.log("User data in NavUser:", user);
  console.log("Pharmacien data in NavUser:", pharmacien);

  if (!userId) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200"
            onClick={() => router.push("/login")}
          >
            <LogOut className="size-5" />
            <span className="text-sm font-medium">Log in</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (userLoading || (user?.role === "pharmacien" && pharmacienLoading)) {
    return (
      <>
        <style>{loadingBarStyles}</style>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="flex items-center gap-2 text-gray-600 shadow-md">
              <Avatar className="h-8 w-8 shadow-sm">
                <AvatarFallback className="bg-gray-200 text-gray-600">L</AvatarFallback>
              </Avatar>
              <div className="loading-bar-container">
                <div className="loading-bar"></div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </>
    );
  }

  if (userError || (user?.role === "pharmacien" && pharmacienError)) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="text-red-600 hover:text-red-800 shadow-md hover:shadow-lg transition-shadow duration-200"
            onClick={handleLogout}
          >
            <span className="text-sm font-medium">Error loading data - Click to logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="text-red-600 hover:text-red-800 shadow-md hover:shadow-lg transition-shadow duration-200"
            onClick={handleLogout}
          >
            <span className="text-sm font-medium">No user data - Click to logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const getInitials = () => {
    return user.nom && user.prenom
      ? `${user.nom[0]}${user.prenom[0]}`.toUpperCase()
      : "?";
  };

  // Check if user is a pharmacien with etat false
  const isInvalidPharmacien = user.role === "pharmacien" && pharmacien && !pharmacien.etat;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={`flex items-center gap-2 rounded-md p-2 transition-colors duration-200 shadow-md hover:shadow-lg ${
                isInvalidPharmacien
                  ? "bg-red-100 text-red-900 hover:bg-red-200 data-[state=open]:bg-red-200 data-[state=open]:text-red-900"
                  : "hover:bg-gray-100 data-[state=open]:bg-gray-200 data-[state=open]:text-gray-900"
              }`}
            >
              <Avatar className="h-8 w-8 shadow-sm">
                {user.image ? (
                  <AvatarImage src={user.image} alt={`${user.nom} ${user.prenom}`} className="rounded-full" />
                ) : (
                  <AvatarFallback
                    className={isInvalidPharmacien ? "bg-red-200 text-red-800" : "bg-blue-100 text-blue-800"}
                  >
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 text-left">
                <span
                  className={`block text-sm font-medium truncate ${
                    isInvalidPharmacien ? "text-red-900" : "text-gray-900"
                  }`}
                >
                  {user.nom && user.prenom ? `${user.nom} ${user.prenom}` : "User"}
                </span>
                <span
                  className={`block text-xs truncate ${
                    isInvalidPharmacien ? "text-red-700" : "text-gray-500"
                  }`}
                >
                  {isInvalidPharmacien ? "Invalid Account - Must Validate Account" : user.email || "No email available"}
                </span>
              </div>
              <ChevronsUpDown className={`ml-2 size-4 ${isInvalidPharmacien ? "text-red-700" : "text-gray-500"}`} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-md shadow-lg bg-white border border-gray-200"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel
              className={`p-2 text-sm font-medium shadow-inner ${
                isInvalidPharmacien ? "bg-red-50 text-red-900" : "text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 shadow-sm">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={`${user.nom} ${user.prenom}`} className="rounded-full" />
                  ) : (
                    <AvatarFallback
                      className={isInvalidPharmacien ? "bg-red-200 text-red-800" : "bg-blue-100 text-blue-800"}
                    >
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <span
                    className={`block text-sm font-medium ${
                      isInvalidPharmacien ? "text-red-900" : "text-gray-900"
                    }`}
                  >
                    {user.nom && user.prenom ? `${user.nom} ${user.prenom}` : "User"}
                  </span>
                  <span
                    className={`block text-xs ${
                      isInvalidPharmacien ? "text-red-700" : "text-gray-500"
                    }`}
                  >
                    {isInvalidPharmacien ? "Invalid Account" : user.email || "No email available"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-gray-200" />
            <DropdownMenuItem
              onClick={handleProfile}
              className="p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors shadow-sm hover:shadow-md"
            >
              <span className="mr-2 size-4">👤</span>
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-gray-200" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors shadow-sm hover:shadow-md"
            >
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}