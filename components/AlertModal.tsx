"use client";
import React from "react";
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
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"; // Import icons

interface AlertModalProps {
  open: boolean;
  type: "success" | "error" | "warning";
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ open, type, message, onClose, onConfirm }) => {
  // Determine the icon, title, and button text based on the type
  const getModalConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle className="text-green-500" size={24} />,
          title: "Success!",
          cancelText: "Close",
          actionText: "Continue",
        };
      case "error":
        return {
          icon: <XCircle className="text-red-500" size={24} />,
          title: "Error",
          cancelText: "Try Again",
          actionText: "Ok",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="text-yellow-500" size={24} />,
          title: "Warning",
          cancelText: "Cancel",
          actionText: "Confirm",
        };
      default:
        return {
          icon: null,
          title: "Notification",
          cancelText: "Close",
          actionText: "Ok",
        };
    }
  };

  const { icon, title, cancelText, actionText } = getModalConfig();

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {icon}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{cancelText}</AlertDialogCancel>
          {onConfirm && (
            <AlertDialogAction onClick={onConfirm}>{actionText}</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertModal;