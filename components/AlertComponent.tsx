// components/AlertComponent.tsx
import React from "react";
import { Alert, AlertContent, AlertTitle, AlertDescription } from "@/components/ui/alert";

type AlertVariant = "success" | "error" | "info";

interface AlertComponentProps {
  variant: AlertVariant;
  title: string;
  description: string;
  isVisible: boolean;
}

export const AlertComponent: React.FC<AlertComponentProps> = ({
  variant,
  title,
  description,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <Alert variant={variant} className="mb-4">
      <AlertContent>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </AlertContent>
    </Alert>
  );
};