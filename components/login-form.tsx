// src/components/LoginForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "react-feather";
import { loginSchema } from "../lib/validation/loginSchema";

export default function LoginForm({
  onLoginSuccess,
  onLoginError,
  isLoading,
  email,
  setEmail,
  password,
  setPassword,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form"> & {
  onLoginSuccess: () => void;
  onLoginError: (errorMessage: string) => void;
  isLoading: boolean;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormErrors({});

    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      setFormErrors({
        email: errors.email?._errors[0] || "",
        password: errors.password?._errors[0] || "",
      });
      return;
    }

    onLoginSuccess();
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your email below to login to your account</p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={formErrors.email ? "true" : "false"}
          />
          {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
        </div>
        <div className="grid gap-2">
          <div className="flex flex-col gap-2 relative">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-invalid={formErrors.password ? "true" : "false"}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
            <p className="text-center text-sm">
              <a href="/forgot-password" className="underline underline-offset-4">
                Mot de passe oublié ?
              </a>
            </p>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </div>
      <div className="text-center text-sm">
        <p>
          Don{"'"}t have an account?{" "}
          <a href="/signup" className="underline underline-offset-4">Sign up</a>
        </p>
      </div>
    </form>
  );
}
