"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import LoginForm from "@/components/login-form";
import { loginUser } from "@/lib/services/auth/authService";
import { fetchUserById } from "@/lib/services/profile/userservice";
import AlertModal from "@/components/AlertModal";
import LogoAndAddress from "../logo-address/LogoAndAddress";

export default function LoginPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState<"success" | "error" | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      console.log("Full login response:", data);
      const userId = data.data?.userID;
      const accessToken = data.data?.session?.session.access_token;

      if (data.success && userId && accessToken) {
        localStorage.setItem("userId", userId.toString());
        document.cookie = `authToken=${accessToken}; path=/; samesite=lax`;

        try {
          const user = await fetchUserById(userId);
          console.log("Fetched user details:", user);
          // Use the role from fetched user data, not JWT
          const role = user.role || "utilisateur"; // Fallback to "utilisateur" if role is missing
          setUserRole(role);
          setUserName(`${user.nom} ${user.prenom}`);
          setDialogMessage("Welcome back to Kliniqa! Click 'Continue' to access your dashboard.");
          setDialogType("success");
          setShowDialog(true);
        } catch (error) {
          console.error("Error fetching user details:", error);
          setDialogMessage("Oops! Something went wrong while fetching your details. Please try again.");
          setDialogType("error");
          setShowDialog(true);
        }
      } else {
        setDialogMessage(data.data?.message || "Oops! Something went wrong during login. Please try again.");
        setDialogType("error");
        setShowDialog(true);
      }
    },
    onError: (error) => {
      const err = error as any;
      setDialogMessage(err.response?.data?.message || "Oops! Something went wrong during login. Please try again.");
      setDialogType("error");
      setShowDialog(true);
    },
  });

  const handleDialogAction = () => {
    if (dialogType === "success" && userRole && userName) {
      const encodedUserName = encodeURIComponent(userName);
      switch (userRole.toLowerCase()) {
        case "admin":
          router.push(`/admin/administrateur?userName=${encodedUserName}`);
          break;
        case "utilisateur":
          router.push(`/home?userName=${encodedUserName}`);
          break;
        case "pharmacien":
          router.push(`/admin/pharmacien?userName=${encodedUserName}`);
          break;
        case "parapharmacien":
          router.push(`/parapharmacien?userName=${encodedUserName}`);
          break;
        default:
          console.log("Unknown role, redirecting to home:", userRole);
          router.push(`/home?userName=${encodedUserName}`);
          break;
      }
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
            src="/logo/logologin.jpg"
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