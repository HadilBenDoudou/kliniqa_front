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

interface AlertModalProps {
  open: boolean;
  type: "success" | "error";
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  
}

const AlertModal: React.FC<AlertModalProps> = ({ open, type, message, onClose, onConfirm }) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{type === "success" ? "Success!" : "Error"}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            {type === "error" ? "Try Again" : "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {type === "error" ? "Ok" : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertModal;
