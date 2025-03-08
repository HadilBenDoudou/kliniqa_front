"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import LoginForm from "@/components/login-form";
import { loginUser } from "@/lib/services/auth/authService";
import AlertModal from "@/components/AlertModal";
import LogoAndAddress from "../logo-address/LogoAndAddress";

export default function LoginPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState<"success" | "error" | null>(null);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log("Full login response:", data);
      const userId = data.data?.userID;
      const accessToken = data.data?.session?.session.access_token;
      console.log("accessToken response:", accessToken);

      if (data.success && userId && accessToken) {
        localStorage.setItem("userId", userId.toString());
        // Supprimer 'secure' en local pour éviter les problèmes avec http://localhost
        document.cookie = `authToken=${accessToken}; path=/; samesite=strict`;
        console.log("Cookie après définition:", document.cookie);
        setDialogMessage("Welcome back to Kliniqa! We're excited to have you with us. Click 'Continue' to access your dashboard.");
        setDialogType("success");
        setShowDialog(true);
      } else {
        setDialogMessage(data.data?.message || "Oops! Something went wrong during login. Please try again.");
        setDialogType("error");
        setShowDialog(true);
      }
    },
    onError: (error) => {
      console.log("Login error:", error);
      const err = error as any;
      setDialogMessage(err.response?.data?.message || "Oops! Something went wrong during login. Please try again.");
      setDialogType("error");
      setShowDialog(true);
    },
  });

  const handleDialogAction = () => {
    console.log("Handle dialog action - dialogType:", dialogType);
    if (dialogType === "success") {
      console.log("Redirecting to /admin/admin-pharmacie");
      router.push("/admin/admin-pharmacie");
    }
    setShowDialog(false);
  };

  const handleLogin = () => {
    mutation.mutate({ email, password });
  };

  return (
    <div>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <LogoAndAddress />
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm
                onLoginSuccess={handleLogin}
                onLoginError={(message) => console.log(message)}
                isLoading={mutation.isPending}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
              />
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <img
            src="/logo/pha2-Photoroom (1).jpg"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>

      <AlertModal
        open={showDialog}
        type={dialogType || "error"}
        message={dialogMessage}
        onClose={() => setShowDialog(false)}
        onConfirm={handleDialogAction}
      />
    </div>
  );
}