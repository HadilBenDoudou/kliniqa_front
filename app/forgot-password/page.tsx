/* pages/ForgotPassword.tsx */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "../../lib/services/auth/authService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AlertModal from "@/components/AlertModal";
import LogoAndAddress from "../logo-address/LogoAndAddress";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      const { userId: fetchedUserId } = data.data;
      if (fetchedUserId) {
        setUserId(fetchedUserId);
        setDialogType("success");
        setDialogMessage("Check your email for the reset link!");
      } else {
        setDialogType("error");
        setDialogMessage("Failed to retrieve user ID from the response.");
      }
      setShowDialog(true);
    },
    onError: (error: any) => {
      console.error("Failed to send reset email:", error);
      setDialogType("error");
      setDialogMessage(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
      setShowDialog(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(email);
  };

  const handleDialogAction = () => {
    setShowDialog(false);
    if (dialogType === "success" && userId) {
      router.push(`/forgot-password/otp?userId=${userId}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
     <LogoAndAddress />  
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email below to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Remembered your password?{" "}
            <Link href="/login" className="underline" prefetch={false}>
              Go back to login
            </Link>
          </div>
        </CardContent>
      </Card>

      <AlertModal
        open={showDialog}
        type={dialogType}
        message={dialogMessage}
        onClose={() => setShowDialog(false)}
        onConfirm={handleDialogAction}
      />
    </div>
  );
}
