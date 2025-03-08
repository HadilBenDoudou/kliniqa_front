"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserById, fetchPharmacien, fetchPharmacy, User, Adresse, Pharmacien, Pharmacy, updateUserProfile, UtilisateurData, AdresseData, PharmacieData, PharmacienData } from "@/lib/services/profile/userservice";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppLayout from "@/components/AppLayout";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MyProfileSection } from "./MyProfileSection";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { AddressSection } from "./AddressSection";
import { PharmacistInfoSection } from "./PharmacistInfoSection";
import { PharmacyInfoSection } from "./PharmacyInfoSection";
import { ProfileSidebar } from "./ProfileSidebar";

export default function Profile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "",
    image: null as File | null,
    adresse: {
      num_street: "",
      street: "",
      city: "",
      postal_code: "",
      country: "",
      latitude: null as number | null,
      longitude: null as number | null,
    },
    pharmacien: {
      cartePro: null as File | null,
      diplome: null as File | null,
      assurancePro: null as File | null,
      etat: false,
    },
    pharmacie: {
      nom: "",
      docPermis: null as File | null,
      docAutorisation: null as File | null,
    },
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log("Stored userId in Profile:", storedUserId);
    if (storedUserId) {
      const parsedId = Number(storedUserId);
      if (isNaN(parsedId) || parsedId <= 0) {
        console.error("Invalid userId in localStorage:", storedUserId);
        setUserId(null);
      } else {
        setUserId(parsedId);
      }
    } else {
      console.error("No userId found in localStorage");
      setUserId(null);
    }
  }, []);

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: userId ? ["user", userId] : ["user"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is null");
      return fetchUserById(userId);
    },
    enabled: !!userId && userId > 0,
    retry: 1,
  });

  const { data: pharmacien, isLoading: pharmacienLoading, error: pharmacienError } = useQuery<Pharmacien>({
    queryKey: userId ? ["pharmacien", userId] : ["pharmacien"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is null");
      return fetchPharmacien(userId);
    },
    enabled: !!userId && userId > 0,
    retry: 1,
  });

  const { data: pharmacie, isLoading: pharmacieLoading, error: pharmacieError } = useQuery<Pharmacy>({
    queryKey: userId ? ["pharmacie", userId] : ["pharmacie"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is null");
      return fetchPharmacy(userId);
    },
    enabled: !!userId && userId > 0,
    retry: 1,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        telephone: user.telephone || "",
        role: user.role || "",
        image: null,
        adresse: user.adresse || {
          num_street: "",
          street: "",
          city: "",
          postal_code: "",
          country: "",
          latitude: null,
          longitude: null,
        },
      }));
    }
    if (pharmacien) {
      setFormData((prev) => ({
        ...prev,
        pharmacien: {
          ...prev.pharmacien,
          diplome: null,
          assurancePro: null,
          etat: pharmacien.etat ?? false,
          cartePro: null,
        },
      }));
    }
    if (pharmacie) {
      setFormData((prev) => ({
        ...prev,
        pharmacie: {
          nom: pharmacie.nom || "",
          docPermis: null,
          docAutorisation: null,
        },
      }));
    }
  }, [user, pharmacien, pharmacie]);

  const updateFormData = useCallback((newAdresse: Adresse) => {
    console.log("Updating formData with adresse:", newAdresse);
    setFormData((prev) => ({
      ...prev,
      adresse: {
        num_street: newAdresse.num_street || "",
        street: newAdresse.street || "",
        city: newAdresse.city || "",
        postal_code: newAdresse.postal_code || "",
        country: newAdresse.country || "",
        latitude: newAdresse.latitude || null,
        longitude: newAdresse.longitude || null,
      },
    }));
  }, []);

  const handleInputChange = useCallback((field: string, value: string | boolean | File | null) => {
    if (field.startsWith("adresse.")) {
      const subField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        adresse: { ...prev.adresse, [subField]: value as string },
      }));
    } else if (field.startsWith("pharmacien.")) {
      const subField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        pharmacien: { ...prev.pharmacien, [subField]: value as string | boolean | File | null },
      }));
    } else if (field.startsWith("pharmacie.")) {
      const subField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        pharmacie: { ...prev.pharmacie, [subField]: value as string | File | null },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value as string | File | null }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setUpdateStatus({ success: false, message: "User ID is missing" });
      return;
    }
  
    const utilisateurData: Partial<UtilisateurData> = {};
    const adresseData: Partial<AdresseData> = {};
    const pharmacienData: Partial<PharmacienData> = {};
    const pharmacieData: Partial<PharmacieData> = {};
  
    // Only include changed fields for utilisateurData
    if (formData.nom && formData.nom !== user?.nom) utilisateurData.nom = formData.nom;
    if (formData.prenom && formData.prenom !== user?.prenom) utilisateurData.prenom = formData.prenom;
    if (formData.email && formData.email !== user?.email) utilisateurData.email = formData.email;
    if (formData.telephone && formData.telephone !== user?.telephone) utilisateurData.telephone = formData.telephone;
    if (formData.role && formData.role !== user?.role) utilisateurData.role = formData.role;
    if (formData.image) utilisateurData.image = formData.image.name; // or use a method to convert the file to a string
  
    // Only include changed fields for adresseData
    if (formData.adresse.num_street && formData.adresse.num_street !== user?.adresse?.num_street) adresseData.num_street = formData.adresse.num_street;
    if (formData.adresse.street && formData.adresse.street !== user?.adresse?.street) adresseData.street = formData.adresse.street;
    if (formData.adresse.city && formData.adresse.city !== user?.adresse?.city) adresseData.city = formData.adresse.city;
    if (formData.adresse.postal_code && formData.adresse.postal_code !== user?.adresse?.postal_code) adresseData.postal_code = formData.adresse.postal_code;
    if (formData.adresse.country && formData.adresse.country !== user?.adresse?.country) adresseData.country = formData.adresse.country;
    if (formData.adresse.latitude && formData.adresse.latitude !== user?.adresse?.latitude) adresseData.latitude = formData.adresse.latitude.toString();
    if (formData.adresse.longitude && formData.adresse.longitude !== user?.adresse?.longitude) adresseData.longitude = formData.adresse.longitude.toString();
  
    // Only include changed fields for pharmacienData
    if (formData.pharmacien.cartePro) pharmacienData.cartePro = formData.pharmacien.cartePro.name; // or use a method to convert the file to a string
    if (formData.pharmacien.diplome) pharmacienData.diplome = formData.pharmacien.diplome.name;
    if (formData.pharmacien.assurancePro) pharmacienData.assurancePro = formData.pharmacien.assurancePro.name;
    if (formData.pharmacien.etat !== undefined && formData.pharmacien.etat !== pharmacien?.etat) pharmacienData.etat = formData.pharmacien.etat;
  
    // Only include changed fields for pharmacieData
    if (formData.pharmacie.nom && formData.pharmacie.nom !== pharmacie?.nom) pharmacieData.nom = formData.pharmacie.nom;
    if (formData.pharmacie.docPermis) pharmacieData.docPermis = formData.pharmacie.docPermis.name;
    if (formData.pharmacie.docAutorisation) pharmacieData.docAutorisation = formData.pharmacie.docAutorisation.name;
  
    const payload = {
      utilisateurData,
      adresseData,
      pharmacienData,
      pharmacieData,
    };
  
    console.log("Payload to send:", payload);
  
    try {
      const updatedUser = await updateUserProfile(userId, payload);
      setUpdateStatus({ success: true, message: "Profile updated successfully!" });
      setIsEditing(false);
  
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["adresse", userId] });
      queryClient.invalidateQueries({ queryKey: ["pharmacien", userId] });
      queryClient.invalidateQueries({ queryKey: ["pharmacie", userId] });
  
      setFormData((prev) => ({
        ...prev,
        nom: updatedUser.nom,
        prenom: updatedUser.prenom,
        email: updatedUser.email,
        telephone: updatedUser.telephone,
        role: updatedUser.role,
        image: null,
        adresse: updatedUser.adresse || prev.adresse,
        pharmacien: {
          ...prev.pharmacien,
          cartePro: null,
          diplome: null,
          assurancePro: null,
          etat: pharmacien?.etat ?? prev.pharmacien.etat,
        },
        pharmacie: {
          ...prev.pharmacie,
          nom: pharmacie?.nom || prev.pharmacie.nom,
          docPermis: null,
          docAutorisation: null,
        },
      }));
    } catch (error) {
      console.error("Update failed:", error);
      setUpdateStatus({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update profile",
      });
    }
  };
  if (userLoading || pharmacienLoading || pharmacieLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Error loading profile: {userError.message}. Please try logging in again.</p>
        <Button
          onClick={() => {
            localStorage.removeItem("userId");
            window.location.href = "/login";
          }}
          className="ml-4 bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <LogOut className="mr-2 size-4" /> Logout
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">No user data available. Please try logging in again.</p>
        <Button
          onClick={() => {
            localStorage.removeItem("userId");
            window.location.href = "/login";
          }}
          className="ml-4 bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <LogOut className="mr-2 size-4" /> Logout
        </Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppLayout>
        <SidebarInset>
          <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <ProfileSidebar user={user} />
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Account Settings</h2>
              {updateStatus && (
                <div className={`mb-4 p-4 rounded-md ${updateStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {updateStatus.message}
                </div>
              )}
              <div className="space-y-6">
                <MyProfileSection
                  user={user}
                  isEditing={isEditing}
                  onEditToggle={() => setIsEditing(!isEditing)}
                  formData={{
                    nom: formData.nom,
                    prenom: formData.prenom,
                    telephone: formData.telephone,
                    role: formData.role,
                    image: formData.image,
                  }}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                />
                <PersonalInfoSection
                  user={user}
                  isEditing={isEditing}
                  onEditToggle={() => setIsEditing(!isEditing)}
                  formData={{
                    email: formData.email,
                    telephone: formData.telephone,
                  }}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                />
                <AddressSection
                  user={user}
                  isEditing={isEditing}
                  onEditToggle={() => setIsEditing(!isEditing)}
                  formData={{
                    adresse: formData.adresse,
                  }}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  updateFormData={updateFormData}
                />
                <PharmacistInfoSection
                  user={user}
                  isEditing={isEditing}
                  onEditToggle={() => setIsEditing(!isEditing)}
                  formData={{
                    pharmacien: formData.pharmacien,
                  }}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  pharmacien={pharmacien}
                />
                <PharmacyInfoSection
                  user={user}
                  isEditing={isEditing}
                  onEditToggle={() => setIsEditing(!isEditing)}
                  formData={{
                    pharmacie: formData.pharmacie,
                  }}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  pharmacie={pharmacie}
                />
              </div>
            </div>
          </div>
        </SidebarInset>
      </AppLayout>
    </SidebarProvider>
  );
}