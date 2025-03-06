"use client"; // Add this directive since we're using client-side features
import { useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Import Next.js hooks
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { GalleryVerticalEnd } from "lucide-react";
import TelephoneInput from "./TelephoneInput";
import axios from "axios"; // Import axios

// Types pour les données du formulaire
type Utilisateur = {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
  image: string;
  role: "utilisateur" | "pharmacien"; // Restrict role to specific values
};

type Adresse = {
  num_street: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  longitude: string;
  latitude: string;
};

type Pharmacien = {
  cartePro: File | null;
  diplome: File | null;
  assurancePro: File | null;
};

type Pharmacie = {
  nom: string;
  docPermis: File | null;
  docAutorisation: File | null;
};

type FormData = {
  utilisateur: Utilisateur;
  adresse: Adresse;
  pharmacien: Pharmacien;
  pharmacie: Pharmacie;
};

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    utilisateur: {
      email: "",
      password: "",
      nom: "",
      prenom: "",
      telephone: "",
      image: "",
      role: "utilisateur", // Default role
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
      cartePro: null,
      diplome: null,
      assurancePro: null,
    },
    pharmacie: {
      nom: "",
      docPermis: null,
      docAutorisation: null,
    },
  });
  const [error, setError] = useState<string | null>(null); // For error handling
  const [success, setSuccess] = useState<string | null>(null); // For success message

  const id = useId();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get role from URL on component mount
  useState(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "utilisateur" || roleParam === "pharmacien") {
      setFormData((prev) => ({
        ...prev,
        utilisateur: {
          ...prev.utilisateur,
          role: roleParam,
        },
      }));
    }
  });

  const handleChange = <T extends keyof FormData>(
    e: React.ChangeEvent<HTMLInputElement>,
    section: T,
    field: keyof FormData[T]
  ) => {
    const value = e.target.type === "file" ? e.target.files?.[0] || null : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      utilisateur: {
        ...prev.utilisateur,
        telephone: value,
      },
    }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare form data for submission (handling files might require FormData)
    const dataToSend = new FormData();
    Object.entries(formData.utilisateur).forEach(([key, value]) => {
      dataToSend.append(`utilisateur[${key}]`, value);
    });
    Object.entries(formData.adresse).forEach(([key, value]) => {
      dataToSend.append(`adresse[${key}]`, value);
    });
    Object.entries(formData.pharmacien).forEach(([key, value]) => {
      if (value instanceof File) {
        dataToSend.append(`pharmacien[${key}]`, value);
      } else {
        dataToSend.append(`pharmacien[${key}]`, value || "");
      }
    });
    Object.entries(formData.pharmacie).forEach(([key, value]) => {
      if (value instanceof File) {
        dataToSend.append(`pharmacie[${key}]`, value);
      } else {
        dataToSend.append(`pharmacie[${key}]`, value || "");
      }
    });

    try {
      const response = await axios.post("http://localhost:3000/register", dataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Registration successful!");
      setError(null);
      console.log("Response:", response.data);
      // Redirect to login or another page after success
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const labelClassName =
    "origin-start absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground";

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="sr-only">Acme Inc.</span>
          </a>
          <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="underline underline-offset-4">
              Sign in
            </a>
          </div>
        </div>
      </div>

      {/* Display success or error messages */}
      {success && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="relative mb-6">
          <div className="flex justify-between text-xs mb-4">
            <span className={step === 1 ? "text-primary" : "text-muted-foreground"}>
              Step 1
            </span>
            <span className={step === 2 ? "text-primary" : "text-muted-foreground"}>
              Step 2
            </span>
            <span className={step === 3 ? "text-primary" : "text-muted-foreground"}>
              Step 3
            </span>
            <span className={step === 4 ? "text-primary" : "text-muted-foreground"}>
              Step 4
            </span>
          </div>
          <div className="relative h-1 bg-muted-foreground">
            <div
              className="absolute top-0 left-0 h-full bg-primary"
              style={{ width: `${(step - 1) * 33.33}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="grid gap-6">
            <div className="group relative">
              <label htmlFor={`${id}-email`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Email</span>
              </label>
              <Input
                id={`${id}-email`}
                type="email"
                value={formData.utilisateur.email}
                onChange={(e) => handleChange(e, "utilisateur", "email")}
                required
                placeholder=""
              />
            </div>
            <div className="group relative">
              <label htmlFor={`${id}-password`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Password</span>
              </label>
              <Input
                id={`${id}-password`}
                type="password"
                value={formData.utilisateur.password}
                onChange={(e) => handleChange(e, "utilisateur", "password")}
                required
                placeholder=""
              />
            </div>
            <div className="group relative">
              <label htmlFor={`${id}-nom`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Nom</span>
              </label>
              <Input
                id={`${id}-nom`}
                type="text"
                value={formData.utilisateur.nom}
                onChange={(e) => handleChange(e, "utilisateur", "nom")}
                required
                placeholder=""
              />
            </div>
            <div className="group relative">
              <label htmlFor={`${id}-prenom`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Prénom</span>
              </label>
              <Input
                id={`${id}-prenom`}
                type="text"
                value={formData.utilisateur.prenom}
                onChange={(e) => handleChange(e, "utilisateur", "prenom")}
                required
                placeholder=""
              />
            </div>
            <TelephoneInput
              id={`${id}-telephone`}
              value={formData.utilisateur.telephone}
              onChange={handlePhoneChange}
              required
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <div className="group relative">
              <label htmlFor={`${id}-street`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Street</span>
              </label>
              <Input
                id={`${id}-street`}
                type="text"
                value={formData.adresse.street}
                onChange={(e) => handleChange(e, "adresse", "street")}
                required
                placeholder=""
              />
            </div>
            <div className="group relative">
              <label htmlFor={`${id}-city`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">City</span>
              </label>
              <Input
                id={`${id}-city`}
                type="text"
                value={formData.adresse.city}
                onChange={(e) => handleChange(e, "adresse", "city")}
                required
                placeholder=""
              />
            </div>
            <div className="group relative">
              <label htmlFor={`${id}-postal_code`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Postal Code</span>
              </label>
              <Input
                id={`${id}-postal_code`}
                type="text"
                value={formData.adresse.postal_code}
                onChange={(e) => handleChange(e, "adresse", "postal_code")}
                required
                placeholder=""
              />
            </div>
            <div className="group relative">
              <label htmlFor={`${id}-country`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Country</span>
              </label>
              <Input
                id={`${id}-country`}
                type="text"
                value={formData.adresse.country}
                onChange={(e) => handleChange(e, "adresse", "country")}
                required
                placeholder=""
              />
            </div>
          </div>
        )}

        {step === 3 && formData.utilisateur.role === "pharmacien" && (
          <div className="grid gap-6">
            <div className="group relative">
              <label htmlFor={`${id}-cartePro`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Carte Pro</span>
              </label>
              <Input
                id={`${id}-cartePro`}
                type="file"
                onChange={(e) => handleChange(e, "pharmacien", "cartePro")}
                required
              />
            </div>
            <div className="group relative">
              <label htmlFor={`${id}-diplome`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Diplôme</span>
              </label>
              <Input
                id={`${id}-diplome`}
                type="file"
                onChange={(e) => handleChange(e, "pharmacien", "diplome")}
                required
              />
            </div>
            <div className="group relative">
              <label htmlFor={`${id}-assurancePro`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Assurance Pro</span>
              </label>
              <Input
                id={`${id}-assurancePro`}
                type="file"
                onChange={(e) => handleChange(e, "pharmacien", "assurancePro")}
                required
              />
            </div>
          </div>
        )}

        {step === 4 && formData.utilisateur.role === "pharmacien" && (
          <div className="grid gap-6">
            <div className="group relative">
              <label htmlFor={`${id}-pharmacie_nom`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Pharmacy Name</span>
              </label>
              <Input
                id={`${id}-pharmacie_nom`}
                type="text"
                value={formData.pharmacie.nom}
                onChange={(e) => handleChange(e, "pharmacie", "nom")}
                required
                placeholder=""
              />
            </div>
            <div className="group relative">
              <label htmlFor={`${id}-docPermis`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Permis Doc</span>
              </label>
              <Input
                id={`${id}-docPermis`}
                type="file"
                onChange={(e) => handleChange(e, "pharmacie", "docPermis")}
                required
              />
            </div>
            <div className="group relative">
              <label htmlFor={`${id}-docAutorisation`} className={labelClassName}>
                <span className="inline-flex bg-background px-2">Authorization Doc</span>
              </label>
              <Input
                id={`${id}-docAutorisation`}
                type="file"
                onChange={(e) => handleChange(e, "pharmacie", "docAutorisation")}
                required
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button type="button" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {step < 4 ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="submit">Submit</Button>
          )}
        </div>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button variant="outline" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                fill="currentColor"
              />
            </svg>
            Continue with Apple
          </Button>
          <Button variant="outline" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </Button>
        </div>
      </form>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}