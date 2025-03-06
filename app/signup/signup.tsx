"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { signupUser } from "../../lib/services/auth/authService";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { signupSchema } from "../../lib/validation/schemas";
import { z } from "zod";
import { Step1 } from "./steps/Step1";
import { Step2 } from "./steps/Step2";
import { Step3 } from "./steps/Step3";
import { Step4 } from "./steps/Step4";
import { validateStep } from "../../lib/helpers";
import { AlertComponent } from "@/components/AlertComponent";
import LogoAndAddress from "../logo-address/LogoAndAddress";

const SignupForm = ({ className, ...props }: React.ComponentProps<"div">) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    utilisateur: {
      email: "",
      password: "",
      nom: "",
      prenom: "",
      telephone: "",
      image: null as File | null,
      role: "utilisateur" as "utilisateur" | "pharmacien",
    },
    adresse: {
      num_street: "",
      street: "",
      city: "",
      postal_code: "",
      country: "",
      longitude: "",
      latitude: "",
    },
    pharmacien: {
      cartePro: null as File | null,
      diplome: null as File | null,
      assurancePro: null as File | null,
    },
    pharmacie: {
      nom: "",
      docPermis: null as File | null,
      docAutorisation: null as File | null,
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      setSuccess(data.data.message);
      setGeneralError(null);
      setTimeout(() => router.push("/login"), 1500);
    },
    onError: (error: any) => {
      setGeneralError(`Registration failed: ${error.response?.data?.error || error.message}`);
      setSuccess(null);
    },
  });

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "pharmacien" || roleParam === "utilisateur") {
      setFormData((prev) => ({
        ...prev,
        utilisateur: { ...prev.utilisateur, role: roleParam },
      }));
    }
  }, [searchParams]);

  const nextStep = () => {
    if (!validateStep(step, formData, formData.utilisateur.role, setErrors)) {
      setGeneralError("Please correct the errors in this step.");
      return;
    }
    setGeneralError(null);
    setStep((prev) => Math.min(prev + 1, formData.utilisateur.role === "pharmacien" ? 4 : 2));
  };

  const prevStep = () => {
    setGeneralError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const prepareFormData = (): FormData => {
    const formDataToSend = new FormData();
    Object.entries(formData.utilisateur).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        formDataToSend.append("utilisateur.image", value);
      } else if (value && typeof value === "string") {
        formDataToSend.append(`utilisateur.${key}`, value);
      }
    });
    Object.entries(formData.adresse).forEach(([key, value]) => {
      formDataToSend.append(`adresse.${key}`, value || "");
    });
    if (formData.utilisateur.role === "pharmacien") {
      Object.entries(formData.pharmacien).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(`pharmacien.${key}`, value);
        }
      });
      Object.entries(formData.pharmacie).forEach(([key, value]) => {
        if (key === "nom" && value) {
          formDataToSend.append(`pharmacie.${key}`, value);
        } else if (value instanceof File) {
          formDataToSend.append(`pharmacie.${key}`, value);
        }
      });
    }
    return formDataToSend;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setGeneralError("Please accept the terms and conditions.");
      return;
    }

    try {
      signupSchema.parse({
        utilisateur: {
          ...formData.utilisateur,
          image: formData.utilisateur.image?.name || "",
        },
        adresse: formData.adresse,
        pharmacien: {
          cartePro: formData.pharmacien.cartePro?.name || "",
          diplome: formData.pharmacien.diplome?.name || "",
          assurancePro: formData.pharmacien.assurancePro?.name || "",
        },
        pharmacie: {
          nom: formData.pharmacie.nom,
          docPermis: formData.pharmacie.docPermis?.name || "",
          docAutorisation: formData.pharmacie.docAutorisation?.name || "",
        },
      });

      signupMutation.mutate(prepareFormData());
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          const path = e.path.join(".");
          newErrors[path] = e.message;
        });
        setErrors(newErrors);
        setGeneralError("Please correct the errors in the form.");
      }
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = "http://localhost:3000/signup/google";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <LogoAndAddress />  
      
      <div
        className={cn(
          "w-full max-w-md flex flex-col gap-6 mt-[30px] p-6 bg-white rounded-lg shadow-lg",
          className
        )}
        {...props}
      > <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-2xl font-bold">Welcome to Kliniqa </h1>
      <p className="text-balance text-sm text-muted-foreground">Enter your email below to signup to your account</p>
    </div>
        <form onSubmit={handleSubmit}>
          <AlertComponent
            variant="success"
            title="Success"
            description={success || ""}
            isVisible={!!success}
          />
          <AlertComponent
            variant="error"
            title="Error"
            description={generalError || ""}
            isVisible={!!generalError}
          />
          <AlertComponent
            variant="info"
            title="Loading"
            description="Processing your registration..."
            isVisible={signupMutation.isPending}
          />

          {/* Step Progress Bar */}
          <div className="relative mb-6">
            <div className="flex justify-between text-xs mb-4">
              {[1, 2, 3, 4].map((s) => (
                <span key={s} className={step === s ? "text-primary" : "text-muted-foreground"}>
                  Step {s}
                </span>
              ))}
            </div>
            <div className="relative h-1 bg-muted-foreground">
              <div
                className="absolute top-0 left-0 h-full bg-primary"
                style={{ width: `${(step - 1) * 33.33}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <Step1
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              passwordVisible={passwordVisible}
              setPasswordVisible={setPasswordVisible}
            />
          )}
          {step === 2 && (
            <Step2 formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />
          )}
          {step === 3 && formData.utilisateur.role === "pharmacien" && (
            <Step3 formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />
          )}
          {step === 4 && formData.utilisateur.role === "pharmacien" && (
            <Step4 formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />
          )}

          <div className="text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="underline underline-offset-4">
              Sign in
            </a>
          </div>
          <div className="space-y-4 mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignUp}>
              <Mail className="mr-2 h-5 w-5" /> Google
            </Button>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <label htmlFor="terms">
                I agree to the{" "}
                <a href="/terms" className="text-blue-600">
                  Terms and Conditions
                </a>
              </label>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" disabled={step === 1} onClick={prevStep}>
                Previous
              </Button>
              <Button
                disabled={(step === 4 && !acceptedTerms) || signupMutation.isPending}
                type={step === 4 ? "submit" : "button"}
                onClick={step === 4 ? undefined : nextStep}
              >
                {step === 4 ? "Submit" : "Next"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;