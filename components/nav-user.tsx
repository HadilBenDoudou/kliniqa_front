"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchUserById, User } from "@/lib/services/profile/userservice";
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

export function NavUser() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log("Stored userId:", storedUserId);
    if (storedUserId) {
      const parsedId = Number(storedUserId);
      setUserId(parsedId > 0 ? parsedId : null);
    }
  }, []);

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: userId ? ["user", userId] : ["user"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is null");
      return fetchUserById(userId);
    },
    enabled: !!userId && userId > 0,
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
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("userId");
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUserId(null);
      router.push("/login");
    }
  };

  const handleProfile = () => {
    router.push("/admin/profile");
  };

  console.log("User data in NavUser:", user);

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

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="text-gray-600 shadow-md">
            <Avatar className="h-8 w-8 shadow-sm">
              <AvatarFallback className="bg-gray-200 text-gray-600">L</AvatarFallback>
            </Avatar>
            <span className="ml-2 text-sm font-medium">Loading...</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (error || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="text-red-600 hover:text-red-800 shadow-md hover:shadow-lg transition-shadow duration-200"
            onClick={handleLogout}
          >
            <span className="text-sm font-medium">Error loading user - Click to logout</span>
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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100 transition-colors duration-200 data-[state=open]:bg-gray-200 data-[state=open]:text-gray-900 shadow-md hover:shadow-lg"
            >
              <Avatar className="h-8 w-8 shadow-sm">
                {user.image ? (
                  <AvatarImage src={user.image} alt={`${user.nom} ${user.prenom}`} className="rounded-full" />
                ) : (
                  <AvatarFallback className="bg-blue-100 text-blue-800">{getInitials()}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 text-left">
                <span className="block text-sm font-medium text-gray-900 truncate">
                  {user.nom && user.prenom ? `${user.nom} ${user.prenom}` : "Utilisateur"}
                </span>
                <span className="block text-xs text-gray-500 truncate">
                  {user.email || "Email non disponible"}
                </span>
              </div>
              <ChevronsUpDown className="ml-2 size-4 text-gray-500" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-md shadow-lg bg-white border border-gray-200"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-2 text-sm font-medium text-gray-900 shadow-inner">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 shadow-sm">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={`${user.nom} ${user.prenom}`} className="rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-800">{getInitials()}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <span className="block text-sm font-medium text-gray-900">
                    {user.nom && user.prenom ? `${user.nom} ${user.prenom}` : "Utilisateur"}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {user.email || "Email non disponible"}
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