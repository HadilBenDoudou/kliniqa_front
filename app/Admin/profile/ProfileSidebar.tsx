"use client";
import React, { useState } from "react";
import { User, deleteUser } from "@/lib/services/profile/userservice";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ProfileSidebarProps {
  user: User;
}

interface AlertModalProps {
  open: boolean;
  type: "success" | "error" | "confirm";
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ open, type, message, onClose, onConfirm }) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {type === "success" ? "Success!" : type === "error" ? "Error" : "Confirm Deletion"}
          </AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {type !== "success" && (
            <AlertDialogCancel onClick={onClose}>
              {type === "error" ? "Try Again" : "Cancel"}
            </AlertDialogCancel>
          )}
          {type !== "error" && (
            <AlertDialogAction onClick={onConfirm}>
              {type === "success" ? "OK" : "Confirm"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export function ProfileSidebar({ user }: ProfileSidebarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [alertState, setAlertState] = useState<{
    open: boolean;
    type: "success" | "error" | "confirm";
    message: string;
  }>({
    open: false,
    type: "confirm",
    message: "",
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteUser(user.id),
    onSuccess: () => {
      console.log("Account deleted successfully");
      // Nettoyer immédiatement les données locales
      localStorage.removeItem("userId");
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Invalider les requêtes pour éviter les relances inutiles
      queryClient.removeQueries({ queryKey: ["user", user.id] });
      queryClient.removeQueries({ queryKey: ["adresse", user.id] });
      queryClient.removeQueries({ queryKey: ["pharmacien", user.id] });
      queryClient.removeQueries({ queryKey: ["pharmacie", user.id] });

      // Afficher l'alerte de succès
      setAlertState({
        open: true,
        type: "success",
        message: "Your account has been successfully deleted. You will be redirected to login.",
      });
    },
    onError: (error) => {
      console.error("Error deleting account:", error);
      setAlertState({
        open: true,
        type: "error",
        message: "Failed to delete account. Please try again.",
      });
    },
  });

  const handleDeleteAccount = () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authToken="))
      ?.split("=")[1];
    console.log("Token before delete attempt:", token);
    setAlertState({
      open: true,
      type: "confirm",
      message: "Are you sure you want to delete your account? This action cannot be undone.",
    });
  };

  const handleConfirmDelete = () => {
    deleteAccountMutation.mutate();
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const handleCloseAlert = () => {
    if (alertState.type === "success") {
      // Rediriger immédiatement après la fermeture de l'alerte de succès
      router.push("/login");
    }
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 md:mb-0 md:mr-6 p-4">
      <div className="mb-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Team</p>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          {user.email || "team.hello@com"}
        </p>
      </div>
      <nav className="space-y-2">
        <a
          href="/admin/admin-pharmacie"
          className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <span className="mr-2">🏠</span> Home
        </a>
        <a
          href="#"
          className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <span className="mr-2">💳</span> Payment
        </a>
        <a
          href="#"
          className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <span className="mr-2">🔔</span> Notifications
        </a>
        <button
          onClick={handleDeleteAccount}
          disabled={deleteAccountMutation.isPending}
          className="w-full flex items-center text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 text-sm py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="mr-2">❌</span>
          {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
        </button>
      </nav>

      <AlertModal
        open={alertState.open}
        type={alertState.type}
        message={alertState.message}
        onClose={handleCloseAlert}
        onConfirm={alertState.type === "confirm" ? handleConfirmDelete : handleCloseAlert}
      />
    </div>
  );
}