"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/ui/administrateur/AppLayout";
import {
  fetchUserById,
  fetchPharmacien,
  fetchPharmacy,
  updateUserProfile,
  User,
  Pharmacien,
  Pharmacy,
  Adresse,
} from "../../../../../../../lib/services/profile/userservice";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogOut } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function EditPharmacist() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const userId = params.id ? Number(params.id) : null;

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    console.log("URL userId:", userId);
    const storedUserId = localStorage.getItem("userId");
    console.log("Authenticated userId from localStorage:", storedUserId);
    if (userId === null || isNaN(userId) || userId <= 0) {
      console.error("Invalid userId from URL:", params.id);
      setUpdateStatus({ success: false, message: "Invalid user ID in URL" });
      router.push("/admin/admin-pharmacie/pharmacie-user");
    }
  }, [userId, params.id, router]);

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: userId ? ["user", userId] : ["user"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is null");
      return fetchUserById(userId);
    },
    enabled: !!userId && userId > 0,
    retry: 1,
  });

  const { data: pharmacien, isLoading: pharmacienLoading } = useQuery<Pharmacien>({
    queryKey: userId ? ["pharmacien", userId] : ["pharmacien"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is null");
      return fetchPharmacien(userId);
    },
    enabled: !!userId && userId > 0,
    retry: 1,
  });

  const { data: pharmacie, isLoading: pharmacieLoading } = useQuery<Pharmacy>({
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
      setImagePreview(user.image || null);
    }
    if (pharmacien) {
      setFormData((prev) => ({
        ...prev,
        pharmacien: {
          cartePro: null,
          diplome: null,
          assurancePro: null,
          etat: pharmacien.etat ?? false,
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
    if (field === "image" && value instanceof File) {
      setImagePreview(URL.createObjectURL(value));
    }
  }, []);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (isEditing) {
          setFormData((prev) => ({
            ...prev,
            adresse: {
              ...prev.adresse,
              latitude: e.latlng.lat,
              longitude: e.latlng.lng,
            },
          }));
        }
      },
    });
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setUpdateStatus({ success: false, message: "User ID is missing" });
      return;
    }

    const utilisateur: Partial<any> = {};
    const adresse: Partial<any> = {};
    const pharmacien: Partial<any> = {};
    const pharmacie: Partial<any> = {};

    if (formData.nom !== user?.nom) utilisateur.nom = formData.nom;
    if (formData.prenom !== user?.prenom) utilisateur.prenom = formData.prenom;
    if (formData.telephone !== user?.telephone) utilisateur.telephone = formData.telephone;
    if (formData.image) utilisateur.image = formData.image;

    if (user?.adresse) {
      if (formData.adresse.num_street && formData.adresse.num_street !== user.adresse.num_street)
        adresse.num_street = formData.adresse.num_street;
      if (formData.adresse.street && formData.adresse.street !== user.adresse.street)
        adresse.street = formData.adresse.street;
      if (formData.adresse.city && formData.adresse.city !== user.adresse.city)
        adresse.city = formData.adresse.city;
      if (formData.adresse.postal_code && formData.adresse.postal_code !== user.adresse.postal_code)
        adresse.postal_code = formData.adresse.postal_code;
      if (formData.adresse.country && formData.adresse.country !== user.adresse.country)
        adresse.country = formData.adresse.country;
      if (formData.adresse.latitude && formData.adresse.latitude !== user.adresse.latitude)
        adresse.latitude = formData.adresse.latitude?.toString();
      if (formData.adresse.longitude && formData.adresse.longitude !== user.adresse.longitude)
        adresse.longitude = formData.adresse.longitude?.toString();
    }

    if (formData.pharmacien.cartePro) pharmacien.cartePro = formData.pharmacien.cartePro;
    if (formData.pharmacien.diplome) pharmacien.diplome = formData.pharmacien.diplome;
    if (formData.pharmacien.assurancePro) pharmacien.assurancePro = formData.pharmacien.assurancePro;
    pharmacien.etat = formData.pharmacien.etat;

    if (formData.pharmacie.nom && formData.pharmacie.nom !== pharmacie?.nom) pharmacie.nom = formData.pharmacie.nom;
    if (formData.pharmacie.docPermis) pharmacie.docPermis = formData.pharmacie.docPermis;
    if (formData.pharmacie.docAutorisation) pharmacie.docAutorisation = formData.pharmacie.docAutorisation;

    const payload: any = { utilisateur, pharmacien, pharmacie };
    if (Object.keys(adresse).length > 0) {
      payload.adresse = adresse;
    }

    console.log("Payload to send:", payload);

    try {
      const updatedUser = await updateUserProfile(userId, payload);
      setUpdateStatus({ success: true, message: "Profile updated successfully!" });
      setIsEditing(false);

      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["pharmacien", userId] });
      queryClient.invalidateQueries({ queryKey: ["pharmacie", userId] });

      setFormData((prev) => ({
        ...prev,
        nom: updatedUser.nom,
        prenom: updatedUser.prenom,
        email: updatedUser.email,
        telephone: updatedUser.telephone,
        role: updatedUser.role,
        adresse: updatedUser.adresse || prev.adresse,
        pharmacien: { ...prev.pharmacien, etat: pharmacien?.etat ?? prev.pharmacien.etat },
        pharmacie: { ...prev.pharmacie, nom: pharmacie?.nom || prev.pharmacie.nom },
      }));
      setImagePreview(updatedUser.image || null);
    } catch (error) {
      console.error("Update failed:", error);
      setUpdateStatus({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update profile",
      });
    }
  };

  if (userLoading || pharmacienLoading || pharmacieLoading) {
    return <AppLayout><div>Loading profile...</div></AppLayout>;
  }

  if (userError) {
    return (
      <AppLayout>
        <div>
          <p>Error loading profile: {userError.message}</p>
          <Button onClick={() => router.push("/login")}>
            <LogOut /> Logout
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!user) return <AppLayout><div>No user data available.</div></AppLayout>;

  const fullName = `${formData.nom} ${formData.prenom}` || "User";
  const defaultPosition: [number, number] = [
    formData.adresse.latitude || user.adresse?.latitude || 51.505,
    formData.adresse.longitude || user.adresse?.longitude || -0.09,
  ];

  return (
    <AppLayout>
      <div className="flex items-center justify-between bg-blue-50 p-6 rounded-t-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {fullName}</h1>
        <div>
          <Image
            src={imagePreview || user.image || "/default-profile.png"}
            alt={`${fullName}'s profile`}
            width={50}
            height={50}
            className="rounded-full object-cover border-2 border-blue-200 cursor-pointer"
            onClick={() => isEditing && document.getElementById("imageInput")?.click()}
          />
          {isEditing && (
            <input
              id="imageInput"
              type="file"
              onChange={(e) => handleInputChange("image", e.target.files?.[0] || null)}
              accept="image/*"
              className="hidden"
            />
          )}
        </div>
      </div>

      <div className="p-6 bg-white rounded-b-lg shadow-md">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/admin-pharmacie/pharmacie-user")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
          <div className="flex space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">Pharmacist Details</h1>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white hover:bg-blue-600">
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  {isEditing ? (
                    <>
                      <Input
                        value={formData.nom}
                        onChange={(e) => handleInputChange("nom", e.target.value)}
                        placeholder="Last Name"
                      />
                      <Input
                        value={formData.prenom}
                        onChange={(e) => handleInputChange("prenom", e.target.value)}
                        placeholder="First Name"
                        className="mt-2"
                      />
                    </>
                  ) : (
                    <p className="mt-1 text-lg">{fullName}</p>
                  )}
                </div>
                <div>
                  <Label>Telephone</Label>
                  {isEditing ? (
                    <Input
                      value={formData.telephone}
                      onChange={(e) => handleInputChange("telephone", e.target.value)}
                    />
                  ) : (
                    <p className="mt-1 text-lg">{formData.telephone || "N/A"}</p>
                  )}
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="mt-1 text-lg">{formData.role || "N/A"}</p>
                </div>
                <div>
                  <Label>Country</Label>
                  {isEditing ? (
                    <Input
                      value={formData.adresse.country}
                      onChange={(e) => handleInputChange("adresse.country", e.target.value)}
                    />
                  ) : (
                    <p className="mt-1 text-lg">{formData.adresse.country || "N/A"}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
              <div>
                <Label>Email Address</Label>
                <p className="mt-1 text-lg">{formData.email}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Address</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={formData.adresse.num_street}
                    onChange={(e) => handleInputChange("adresse.num_street", e.target.value)}
                    placeholder="Number and Street"
                  />
                  <Input
                    value={formData.adresse.street}
                    onChange={(e) => handleInputChange("adresse.street", e.target.value)}
                    placeholder="Street"
                  />
                  <Input
                    value={formData.adresse.city}
                    onChange={(e) => handleInputChange("adresse.city", e.target.value)}
                    placeholder="City"
                  />
                  <Input
                    value={formData.adresse.postal_code}
                    onChange={(e) => handleInputChange("adresse.postal_code", e.target.value)}
                    placeholder="Postal Code"
                  />
                  <div className="h-64">
                    <MapContainer center={defaultPosition} zoom={13} style={{ height: "100%", width: "100%" }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker position={defaultPosition} />
                      <MapClickHandler />
                    </MapContainer>
                  </div>
                  <div className="flex space-x-4">
                    <div>
                      <Label>Latitude</Label>
                      <Input
                        value={formData.adresse.latitude || ""}
                        onChange={(e) => handleInputChange("adresse.latitude", e.target.value)}
                        placeholder="Latitude"
                      />
                    </div>
                    <div>
                      <Label>Longitude</Label>
                      <Input
                        value={formData.adresse.longitude || ""}
                        onChange={(e) => handleInputChange("adresse.longitude", e.target.value)}
                        placeholder="Longitude"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-lg">
                    {user.adresse
                      ? `${user.adresse.num_street} ${user.adresse.street}, ${user.adresse.city}, ${user.adresse.postal_code}, ${user.adresse.country}`
                      : "N/A"}
                  </p>
                  {(user.adresse?.latitude || user.adresse?.longitude) && (
                    <div className="h-64 mt-4">
                      <MapContainer center={defaultPosition} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <Marker position={defaultPosition} />
                      </MapContainer>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Pharmacist Details</h2>
              {pharmacien ? (
                <ul className="list-disc pl-5 space-y-4">
                  <li>
                    <span className="font-medium">Carte Pro:</span>{" "}
                    {isEditing ? (
                      <div>
                        <input
                          type="file"
                          onChange={(e) => handleInputChange("pharmacien.cartePro", e.target.files?.[0] || null)}
                          className="border p-2 rounded"
                        />
                        {pharmacien.cartePro && (
                          <a href={pharmacien.cartePro} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2 block">
                            View Current File
                          </a>
                        )}
                      </div>
                    ) : pharmacien.cartePro ? (
                      <a href={pharmacien.cartePro} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        View File
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </li>
                  <li>
                    <span className="font-medium">Diplôme:</span>{" "}
                    {isEditing ? (
                      <div>
                        <input
                          type="file"
                          onChange={(e) => handleInputChange("pharmacien.diplome", e.target.files?.[0] || null)}
                          className="border p-2 rounded"
                        />
                        {pharmacien.diplome && (
                          <a href={pharmacien.diplome} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2 block">
                            View Current File
                          </a>
                        )}
                      </div>
                    ) : pharmacien.diplome ? (
                      <a href={pharmacien.diplome} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        View File
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </li>
                  <li>
                    <span className="font-medium">Assurance Pro:</span>{" "}
                    {isEditing ? (
                      <div>
                        <input
                          type="file"
                          onChange={(e) => handleInputChange("pharmacien.assurancePro", e.target.files?.[0] || null)}
                          className="border p-2 rounded"
                        />
                        {pharmacien.assurancePro && (
                          <a href={pharmacien.assurancePro} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2 block">
                            View Current File
                          </a>
                        )}
                      </div>
                    ) : pharmacien.assurancePro ? (
                      <a href={pharmacien.assurancePro} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        View File
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </li>
                  <li>
                    <span className="font-medium">Status:</span> {pharmacien.etat ? "Active" : "Inactive"}
                  </li>
                </ul>
              ) : (
                <p>N/A</p>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Pharmacy Details</h2>
              {pharmacie ? (
                <ul className="list-disc pl-5 space-y-4">
                  <li>
                    <span className="font-medium">Name:</span>{" "}
                    {isEditing ? (
                      <Input
                        value={formData.pharmacie.nom}
                        onChange={(e) => handleInputChange("pharmacie.nom", e.target.value)}
                        placeholder="Pharmacy Name"
                      />
                    ) : (
                      pharmacie.nom || "N/A"
                    )}
                  </li>
                  <li>
                    <span className="font-medium">Doc Permis:</span>{" "}
                    {isEditing ? (
                      <div>
                        <input
                          type="file"
                          onChange={(e) => handleInputChange("pharmacie.docPermis", e.target.files?.[0] || null)}
                          className="border p-2 rounded"
                        />
                        {pharmacie.docPermis && (
                          <a href={pharmacie.docPermis} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2 block">
                            View Current File
                          </a>
                        )}
                      </div>
                    ) : pharmacie.docPermis ? (
                      <a href={pharmacie.docPermis} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        View File
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </li>
                  <li>
                    <span className="font-medium">Doc Autorisation:</span>{" "}
                    {isEditing ? (
                      <div>
                        <input
                          type="file"
                          onChange={(e) => handleInputChange("pharmacie.docAutorisation", e.target.files?.[0] || null)}
                          className="border p-2 rounded"
                        />
                        {pharmacie.docAutorisation && (
                          <a href={pharmacie.docAutorisation} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2 block">
                            View Current File
                          </a>
                        )}
                      </div>
                    ) : pharmacie.docAutorisation ? (
                      <a href={pharmacie.docAutorisation} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        View File
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </li>
                </ul>
              ) : (
                <p>N/A</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-500 text-white hover:bg-green-600">
                Save Changes
              </Button>
            </div>
          )}
        </form>

        {updateStatus && (
          <div className={`mt-4 p-4 rounded ${updateStatus.success ? "bg-green-100" : "bg-red-100"}`}>
            <p>{updateStatus.message}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}