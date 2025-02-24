"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import GeocoderControl from "leaflet-control-geocoder";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Eye, EyeOff, Github, Mail, X } from "lucide-react";
import { Alert, AlertContent, AlertTitle, AlertDescription } from "@/components/ui/alert";

const signupSchema = z.object({
  utilisateur: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    nom: z.string().min(1),
    prenom: z.string().min(1),
    telephone: z.string().min(8),
    image: z.string().optional(),
    role: z.enum(["utilisateur", "pharmacien"]),
  }),
  adresse: z.object({
    num_street: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().min(1),
    longitude: z.string().optional(),
    latitude: z.string().optional(),
  }),
  pharmacien: z.object({
    cartePro: z.string().optional(),
    diplome: z.string().optional(),
    assurancePro: z.string().optional(),
  }),
  pharmacie: z.object({
    nom: z.string().min(1),
    docPermis: z.string().optional(),
    docAutorisation: z.string().optional(),
  }),
});

const positionIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const SignupForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    utilisateur: {
      email: "",
      password: "",
      nom: "",
      prenom: "",
      telephone: "",
      image: "",
      role: "utilisateur",
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
      cartePro: "",
      diplome: "",
      assurancePro: "",
    },
    pharmacie: {
      nom: "",
      docPermis: "",
      docAutorisation: "",
    },
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const [step, setStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
  };

  const { mutate } = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axios.post("http://localhost:3000/register", data);
      return response.data;
    },
    onError: (err: any) => {
      console.error("Error:", err);
      setAlert({ type: "error", message: `Registration failed: ${err.message}` });
    },
    onSuccess: (data) => {
      console.log("User registered successfully", data);
      setAlert({ type: "success", message: "Registration successful!" });
      setTimeout(() => router.push("/login"), 1500);
    },
  });

  // Si un rôle est passé en query (par exemple ?role=pharmacien), on le définit par défaut
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && (roleParam === "pharmacien" || roleParam === "utilisateur")) {
      setFormData((prev) => ({
        ...prev,
        utilisateur: {
          ...prev.utilisateur,
          role: roleParam,
        },
      }));
    }
  }, [searchParams]);

 // Gestionnaire pour les inputs de type file
 const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: string,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Ici, nous stockons simplement le nom du fichier.
      // Vous pouvez adapter pour lire le contenu ou l'envoyer via FormData.
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: file.name,
        },
      }));
    }
  };


  const validateStep = () => {
    if (step === 1) {
      const { email, password, nom, prenom, telephone } = formData.utilisateur;
      if (!email || !password || !nom || !prenom || !telephone) return false;
    } else if (step === 2) {
      const { num_street, street, city, postal_code, country } = formData.adresse;
      if (!num_street || !street || !city || !postal_code || !country) return false;
    } else if (step === 3 && formData.utilisateur.role === "pharmacien") {
      const { cartePro, diplome, assurancePro } = formData.pharmacien;
      if (!cartePro || !diplome || !assurancePro) return false;
    } else if (step === 4 && formData.utilisateur.role === "pharmacien") {
      const { nom } = formData.pharmacie;
      if (!nom) return false;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) {
      setAlert({
        type: "error",
        message:
          "Veuillez compléter tous les champs obligatoires de cette étape avant de continuer.",
      });
      return;
    }
    setAlert(null);
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setAlert(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleAcceptTerms = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptedTerms(e.target.checked);
  };

  useEffect(() => {
    if (step === 2) {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
      const mapContainer = document.getElementById("map");
      if (mapContainer && (mapContainer as any)._leaflet_id) {
        delete (mapContainer as any)._leaflet_id;
      }
      const initialMap = L.map("map").setView([48.8566, 2.3522], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(initialMap);
      const geocoder = new GeocoderControl();
      initialMap.addControl(geocoder);
      mapRef.current = initialMap;
      initialMap.on("click", function (e: L.LeafletMouseEvent) {
        const { lat, lng } = e.latlng;
        setFormData((prev) => ({
          ...prev,
          adresse: {
            ...prev.adresse,
            latitude: lat.toString(),
            longitude: lng.toString(),
          },
        }));
        if (marker) {
          initialMap.removeLayer(marker);
        }
        const newMarker = L.marker([lat, lng], { icon: positionIcon }).addTo(initialMap);
        setMarker(newMarker);
        newMarker.bindPopup(
          `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`
        ).openPopup();
      });
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [step]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const [section, field] = name.split(".") as [string, string];
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };
// On récupère le rôle depuis l'URL et on l'applique au formulaire
useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && (roleParam === "pharmacien" || roleParam === "utilisateur")) {
      setFormData((prev) => ({
        ...prev,
        utilisateur: {
          ...prev.utilisateur,
          role: roleParam, // On met à jour le rôle
        },
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setAlert({ type: "error", message: "Veuillez accepter les conditions générales." });
      return;
    }
    setValidationErrors([]);
    try {
      signupSchema.parse(formData);
      mutate(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err.errors.map((error) => error.message);
        setValidationErrors(messages);
        setAlert({ type: "error", message: "Validation error: " + messages.join(", ") });
      }
    }
  };

  const redirectToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="flex h-screen">
<div className="w-full md:w-1/2 flex items-center justify-center bg-white">
<form onSubmit={handleSubmit} className="w-full max-w-md">
          {alert && (
            <Alert
              variant={alert.type === "error" ? "error" : "success"}
              size="lg"
              isNotification
              layout="complex"
              action={
                <Button
                  variant="ghost"
                  className="group -my-1.5 -me-2 size-8 p-0 hover:bg-transparent"
                  aria-label="Close notification"
                  onClick={() => setAlert(null)}
                >
                  <X
                    size={16}
                    strokeWidth={2}
                    className="opacity-60 transition-opacity group-hover:opacity-100"
                  />
                </Button>
              }
              className="mb-4"
            >
              <AlertContent>
                <AlertTitle>
                  {alert.type === "error" ? "Erreur" : "Succès"}
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </AlertContent>
            </Alert>
          )}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6"
            >
 <div className="text-center space-y-2">
            <h1 className="text-xl font-bold tracking-tighter">Welcome back</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>            {step === 1 && (
              <><div className="space-y-2">
              <Label htmlFor="nom">Name</Label>
              <Input
                id="nom"
                name="utilisateur.nom"
                type="text"
                value={formData.utilisateur.nom}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Surname</Label>
              <Input
                id="prenom"
                name="utilisateur.prenom"
                type="text"
                value={formData.utilisateur.prenom}
                onChange={handleChange}
              />
            </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="utilisateur.email"
                    type="email"
                    value={formData.utilisateur.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="utilisateur.password"
                      type={passwordVisible ? "text" : "password"}
                      value={formData.utilisateur.password}
                      onChange={handleChange}
                    />
                    <div
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    >
                      {passwordVisible ? <EyeOff /> : <Eye />}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telephone">Phone</Label>
                  <Input
                    id="telephone"
                    name="utilisateur.telephone"
                    type="text"
                    value={formData.utilisateur.telephone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Profile Photo</Label>
                  <Input 
                    id="image" 
                    name="utilisateur.image" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, "utilisateur", "image")} 
                  />
                </div>
               
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold">Address Information</h2>
                <div className="space-y-2">
                  <Label htmlFor="num_street">Street Number</Label>
                  <Input
                    id="num_street"
                    name="adresse.num_street"
                    type="text"
                    value={formData.adresse.num_street}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    name="adresse.street"
                    type="text"
                    value={formData.adresse.street}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="adresse.city"
                    type="text"
                    value={formData.adresse.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    name="adresse.postal_code"
                    type="text"
                    value={formData.adresse.postal_code}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="adresse.country"
                    type="text"
                    value={formData.adresse.country}
                    onChange={handleChange}
                  />
                </div>
                <div id="map" style={mapContainerStyle}></div>
              </>
            )}
            {step === 3 && formData.utilisateur.role === "pharmacien" && (
              <>
                <h2 className="text-xl font-semibold">Pharmacist Information</h2>
                <div className="space-y-2">
                  <Label htmlFor="cartePro">
                    Professional Card (Image/PDF)
                  </Label>
                  <Input
                    id="cartePro"
                    name="pharmacien.cartePro"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, "pharmacien", "cartePro")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diplome">Diploma (Image/PDF)</Label>
                  <Input
                    id="diplome"
                    name="pharmacien.diplome"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, "pharmacien", "diplome")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assurancePro">
                    Professional Insurance (Image/PDF)
                  </Label>
                  <Input
                    id="assurancePro"
                    name="pharmacien.assurancePro"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      handleFileChange(e, "pharmacien", "assurancePro")
                    }
                  />
                </div>
              </>
            )}
            {step === 4 && formData.utilisateur.role === "pharmacien" && (
              <>
                <h2 className="text-xl font-semibold">Pharmacy Information</h2>
                <div className="space-y-2">
                  <Label htmlFor="nom_pharmacie">Pharmacy Name</Label>
                  <Input
                    id="nom_pharmacie"
                    name="pharmacie.nom"
                    type="text"
                    value={formData.pharmacie.nom}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docPermis">License Document</Label>
                  <Input
                    id="docPermis"
                    name="pharmacie.docPermis"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, "pharmacie", "docPermis")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docAutorisation">
                    Authorization Document
                  </Label>
                  <Input
                    id="docAutorisation"
                    name="pharmacie.docAutorisation"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      handleFileChange(e, "pharmacie", "docAutorisation")
                    }
                  />
                </div>
              </>
            )}
             <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="w-full flex items-center justify-center">
                        <Github className="mr-2 h-5 w-5" />
                        GitHub
                      </Button>
                      <Button variant="outline" className="w-full flex items-center justify-center">
                        <Mail className="mr-2 h-5 w-5" />
                        Google
                      </Button>
                    </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={handleAcceptTerms}
                  id="terms"
                />
                <label htmlFor="terms">
                  I agree to the{" "}
                  <a href="/terms" className="text-blue-600">
                    Terms and Conditions
                  </a>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" disabled={step === 1} onClick={prevStep}>
                Previous
              </Button>
              <Button
                disabled={step === 4 && !acceptedTerms}
                type={step === 4 ? "submit" : "button"}
                onClick={step === 4 ? undefined : nextStep}
              >
                {step === 4 ? "Submit" : "Next"}
              </Button>
            </div>
          </motion.div>
        </form>
      </div>
      <div className="hidden md:flex w-1/2 bg-black bg-cover items-center justify-center">
      <div className="space-y-4 text-center text-white">
        <h2 className="text-3xl font-bold flex justify-center items-center">
  <img src="/logo/logo copy.png" alt="Join Us!" />
</h2>

          <p className="text-lg">Create your account to access our services.</p>
          <div className="flex justify-center gap-6 mt-6">
            <a
              href="https://github.com"
              target="_blank"
              className="text-xl text-gray-300 hover:text-gray-400"
            >
              <Github />
            </a>
            <a
              href="mailto:support@example.com"
              className="text-xl text-gray-300 hover:text-gray-400"
            >
              <Mail />
            </a>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-300">
              Already a member?{" "}
              <a onClick={redirectToLogin} className="text-blue-400 cursor-pointer">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
