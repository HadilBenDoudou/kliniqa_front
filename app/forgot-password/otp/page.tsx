"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { verifyResetPassword } from "../../../lib/services/auth/authService";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import LogoAndAddress from "../../logo-address/LogoAndAddress";
import AlertModal from "@/components/AlertModal";
import { validatePassword } from "../../../lib/validation/passwordValidation";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [requirements, setRequirements] = useState({
    lowercase: false,
    uppercase: false,
    number: false,
    minLength: false,
  });
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const [dialogMessage, setDialogMessage] = useState("");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setRequirements(validatePassword(pwd));
  };

  const isFormValid =
    otp.length === 6 &&
    requirements.lowercase &&
    requirements.uppercase &&
    requirements.number &&
    requirements.minLength;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Missing user ID.");
      return verifyResetPassword(Number(userId), otp, password);
    },
    onSuccess: () => {
      setDialogType("success");
      setDialogMessage("Password reset successfully!");
      setShowDialog(true);
    },
    onError: (error: any) => {
      setDialogType("error");
      setDialogMessage(error.response?.data?.message || "Something went wrong. Please try again.");
      setShowDialog(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const handleDialogAction = () => {
    setShowDialog(false);
    if (dialogType === "success") {
      router.push("/login");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="min-h-screen flex flex-col">
        <LogoAndAddress />
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold tracking-tighter">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter the code sent to your email to reset your password.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">OTP Code</Label>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {Array.from({ length: 3 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                {Array.from({ length: 3 }).map((_, i) => (
                  <InputOTPSlot key={i + 3} index={i + 3} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="text-sm text-gray-500">
            {["lowercase", "uppercase", "number", "minLength"].map((req) => (
              <div key={req} className="flex items-center">
                {requirements[req as keyof typeof requirements] ? (
                  <Check className="text-green-500" />
                ) : (
                  <X className="text-red-500" />
                )}
                <span>
                  {req === "lowercase"
                    ? "One lowercase letter"
                    : req === "uppercase"
                    ? "One uppercase letter"
                    : req === "number"
                    ? "One number"
                    : "Minimum 8 characters"}
                </span>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={!isFormValid || mutation.isPending}>
            {mutation.isPending ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>

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
