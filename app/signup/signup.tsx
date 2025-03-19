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
import { Step3Parapharmacie } from "./steps/Step3Parapharmacie";
import { validateStep } from "../../lib/helpers";
import { AlertComponent } from "@/components/AlertComponent";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";
import { TermsDialog } from "@/components/ui/terme-et-condition/terme";

const RefreshIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-blue-600"
  >
    <path
      d="M12 4V1L8 5L12 9V6C15.31 6 18 8.69 18 12C18 13.01 17.75 13.97 17.3 14.83L18.76 16.29C19.54 15.11 20 13.7 20 12C20 7.58 16.42 4 12 4ZM6 12C6 10.99 6.25 10.03 6.7 9.17L5.24 7.71C4.46 8.89 4 10.3 4 12C4 16.42 7.58 20 12 20V23L16 19L12 15V18C8.69 18 6 15.31 6 12Z"
      fill="currentColor"
    />
  </svg>
);

interface SignupFormProps {
  className?: string;
  [key: string]: any;
}

const SignupForm = ({ className, ...props }: SignupFormProps) => {
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
      role: "utilisateur" as "utilisateur" | "pharmacien" | "parapharmacie",
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
    parapharmacie: {
      nom: "",
      docPermis: null as File | null,
      docAutorisation: null as File | null,
      image: null as File | null,
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const signupMutation = useMutation({
    mutationFn: (formData: FormData) => signupUser(formData, recaptchaToken ?? undefined),
    onSuccess: (data) => {
      setSuccess(data.data.message);
      setGeneralError(null);
      setTimeout(() => router.push("/login"), 1500);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || "An unknown error occurred";
      setGeneralError(`Registration failed: ${errorMessage}`);
      setSuccess(null);
      console.error("Signup error:", error);
    },
  });

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "pharmacien" || roleParam === "utilisateur" || roleParam === "parapharmacie") {
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
    setStep((prev) =>
      Math.min(
        prev + 1,
        formData.utilisateur.role === "pharmacien"
          ? 4
          : formData.utilisateur.role === "parapharmacie"
          ? 3
          : 2
      )
    );
  };

  const prevStep = () => {
    setGeneralError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const prepareFormData = (): FormData => {
    const formDataToSend = new FormData();
    const { utilisateur, adresse, pharmacien, pharmacie, parapharmacie } = formData;

    Object.entries(utilisateur).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        formDataToSend.append(`utilisateur.${key}`, value);
      } else if (value && typeof value === "string") {
        formDataToSend.append(`utilisateur.${key}`, value);
      }
    });

    Object.entries(adresse).forEach(([key, value]) => {
      formDataToSend.append(`adresse.${key}`, value || "");
    });

    if (utilisateur.role === "pharmacien") {
      Object.entries(pharmacien).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(`pharmacien.${key}`, value);
        }
      });
      Object.entries(pharmacie).forEach(([key, value]) => {
        if (key === "nom" && value) {
          formDataToSend.append(`pharmacie.${key}`, value);
        } else if (value instanceof File) {
          formDataToSend.append(`pharmacie.${key}`, value);
        }
      });
    } else if (utilisateur.role === "parapharmacie") {
      Object.entries(parapharmacie).forEach(([key, value]) => {
        if (key === "nom" && value) {
          formDataToSend.append(`parapharmacie.${key}`, value);
        } else if (value instanceof File) {
          formDataToSend.append(`parapharmacie.${key}`, value);
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

    const finalStep = formData.utilisateur.role === "pharmacien" ? 4 : formData.utilisateur.role === "parapharmacie" ? 3 : 2;
    if (step === finalStep) {
      if (!recaptchaToken) {
        setGeneralError("Please verify that you are not a robot.");
        return;
      }

      try {
        const dataToValidate = {
          utilisateur: {
            ...formData.utilisateur,
            image: formData.utilisateur.image?.name || "",
          },
          adresse: formData.adresse,
          pharmacien: formData.utilisateur.role === "pharmacien" ? {
            cartePro: formData.pharmacien.cartePro?.name || "",
            diplome: formData.pharmacien.diplome?.name || "",
            assurancePro: formData.pharmacien.assurancePro?.name || "",
          } : undefined,
          pharmacie: formData.utilisateur.role === "pharmacien" ? {
            nom: formData.pharmacie.nom,
            docPermis: formData.pharmacie.docPermis?.name || "",
            docAutorisation: formData.pharmacie.docAutorisation?.name || "",
          } : undefined,
          parapharmacie: formData.utilisateur.role === "parapharmacie" ? {
            nom: formData.parapharmacie.nom,
            docPermis: formData.parapharmacie.docPermis?.name || "",
            docAutorisation: formData.parapharmacie.docAutorisation?.name || "",
            image: formData.parapharmacie.image?.name || "",
          } : undefined,
        };

        console.log("Data to validate:", dataToValidate);
        signupSchema.parse(dataToValidate);

        signupMutation.mutate(prepareFormData());
      } catch (err) {
        if (err instanceof z.ZodError) {
          const newErrors: Record<string, string> = {};
          err.errors.forEach((e) => {
            const path = e.path.join(".");
            newErrors[path] = e.message;
          });
          console.log("Validation errors:", newErrors);
          setErrors(newErrors);
          setGeneralError("Please correct the errors in the form.");
        }
      }
    } else {
      nextStep();
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = "http://localhost:3000/signup/google";
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (!token) {
      setGeneralError("reCAPTCHA verification failed. Please try again.");
    }
  };

  // Détermine l'image à afficher en fonction du rôle
  const imageSrc = formData.utilisateur.role === "parapharmacie" ? "/logo/parapharmacie.jpg" : "/logo/localication-Photoroom.jpg";

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white">
        <div
          className={cn(
            "w-full max-w-md flex flex-col gap-6 mt-[30px] p-6 bg-white rounded-lg shadow-lg",
            className
          )}
          {...props}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Welcome to Kliniqa</h1>
            <p className="text-balance text-sm text-muted-foreground">
              Enter your email below to signup to your account
            </p>
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

            <div className="relative mb-6">
              <div className="flex justify-between text-xs mb-4">
                {[1, 2, 3, 4].map((s) =>
                  s <= (formData.utilisateur.role === "pharmacien" ? 4 : formData.utilisateur.role === "parapharmacie" ? 3 : 2) ? (
                    <span key={s} className={step === s ? "text-primary" : "text-muted-foreground"}>
                      Step {s}
                    </span>
                  ) : null
                )}
              </div>
              <div className="relative h-1 bg-muted-foreground">
                <div
                  className="absolute top-0 left-0 h-full bg-primary"
                  style={{
                    width: `${
                      (step - 1) *
                      (formData.utilisateur.role === "pharmacien" ? 33.33 : formData.utilisateur.role === "parapharmacie" ? 50 : 100)
                    }%`,
                  }}
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
            {step === 3 && formData.utilisateur.role === "parapharmacie" && (
              <Step3Parapharmacie formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />
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
                  I agree to the <TermsDialog onAgree={() => setAcceptedTerms(true)} />
                </label>
              </div>

              {(step === (formData.utilisateur.role === "pharmacien" ? 4 : formData.utilisateur.role === "parapharmacie" ? 3 : 2)) && (
                <div className="flex items-center justify-center">
                  <ReCAPTCHA
                    sitekey="6Lcoi-8qAAAAANnYo0MyW6HvEI-g0t4X2Tj5IdaD"
                    onChange={handleRecaptchaChange}
                    size="normal"
                    theme="light"
                  />
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" disabled={step === 1} onClick={prevStep}>
                  Previous
                </Button>
                <Button
                  disabled={
                    (step === (formData.utilisateur.role === "pharmacien" ? 4 : formData.utilisateur.role === "parapharmacie" ? 3 : 2) &&
                      (!acceptedTerms || !recaptchaToken)) ||
                    signupMutation.isPending
                  }
                  type="submit"
                >
                  {step === (formData.utilisateur.role === "pharmacien" ? 4 : formData.utilisateur.role === "parapharmacie" ? 3 : 2)
                    ? "Submit"
                    : "Next"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 relative">
        <Image
          src={imageSrc} // Utilisation de la variable dynamique
          alt="Signup Illustration"
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />
      </div>
    </div>
  );
};

export default SignupForm;