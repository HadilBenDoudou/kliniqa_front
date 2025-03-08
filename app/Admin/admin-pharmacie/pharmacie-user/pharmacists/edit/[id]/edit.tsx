"use client";

import React, { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  fetchUserById,
  fetchPharmacien,
  fetchPharmacy,
  validatePharmacist,
  updateUserProfile,
  User,
  Pharmacien,
  Pharmacy,
  Adresse,
  UtilisateurData,
  AdresseData,
  PharmacienData,
  PharmacieData,
} from "../../../../../../../lib/services/profile/userservice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import AlertModal from "@/components/AlertModal"; // Adjust path as needed

// Fix Leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type UserWithDetails = User & {
  adresse?: Adresse;
  pharmacien?: Pharmacien;
  pharmacy?: Pharmacy;
};

export default function EditPharmacist() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const userId = params.id as string;

  // State for editing mode and form data
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    utilisateurData: Partial<UtilisateurData>;
    adresseData: Partial<AdresseData>;
    pharmacienData: Partial<PharmacienData>;
    pharmacieData: Partial<PharmacieData>;
    files: {
      image?: File;
      cartePro?: File;
      diplome?: File;
      assurancePro?: File;
      docPermis?: File;
      docAutorisation?: File;
    };
  }>({
    utilisateurData: {},
    adresseData: {},
    pharmacienData: {},
    pharmacieData: {},
    files: {},
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for AlertModal
  const [alertState, setAlertState] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });

  // Fetch data
  const { data: userData, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(parseInt(userId, 10)),
    enabled: !!userId,
  });

  const { data: pharmacienData, isLoading: pharmacienLoading, error: pharmacienError } = useQuery<Pharmacien>({
    queryKey: ["pharmacien", userId],
    queryFn: () => fetchPharmacien(parseInt(userId, 10)),
    enabled: !!userId,
  });

  const { data: pharmacyData, isLoading: pharmacyLoading, error: pharmacyError } = useQuery<Pharmacy>({
    queryKey: ["pharmacy", userId],
    queryFn: () => fetchPharmacy(parseInt(userId, 10)),
    enabled: !!userId,
  });

  // Mutations
  const validateMutation = useMutation({
    mutationFn: ({ userId, etat }: { userId: number; etat: boolean }) => validatePharmacist(userId, etat),
    onMutate: async ({ userId, etat }) => {
      await queryClient.cancelQueries({ queryKey: ["pharmacien", userId.toString()] });
      const previousPharmacien = queryClient.getQueryData<Pharmacien>(["pharmacien", userId.toString()]);
      queryClient.setQueryData(["pharmacien", userId.toString()], (old: Pharmacien | undefined) =>
        old ? { ...old, etat } : old
      );
      return { previousPharmacien };
    },
    onError: (err, { userId }, context) => {
      queryClient.setQueryData(["pharmacien", userId.toString()], context?.previousPharmacien);
      setAlertState({
        open: true,
        type: "error",
        message: "Failed to update pharmacist status: " + (err instanceof Error ? err.message : "Unknown error"),
      });
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["pharmacien", userId.toString()] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      utilisateurData: Partial<UtilisateurData>;
      adresseData: Partial<AdresseData>;
      pharmacienData: Partial<PharmacienData>;
      pharmacieData: Partial<PharmacieData>;
      files: {
        image?: File;
        cartePro?: File;
        diplome?: File;
        assurancePro?: File;
        docPermis?: File;
        docAutorisation?: File;
      };
    }) => {
      const apiData = {
        utilisateurData: {
          nom: data.utilisateurData.nom || "",
          prenom: data.utilisateurData.prenom || "",
          email: data.utilisateurData.email || "",
          telephone: data.utilisateurData.telephone || "",
          role: data.utilisateurData.role || "",
          image: data.files.image ? data.files.image.name : data.utilisateurData.image,
        },
        adresseData: {
          num_street: data.adresseData.num_street || "",
          street: data.adresseData.street || "",
          city: data.adresseData.city || "",
          postal_code: data.adresseData.postal_code || "",
          country: data.adresseData.country || "",
          latitude: data.adresseData.latitude || "0",
          longitude: data.adresseData.longitude || "0",
        },
        pharmacienData: {
          cartePro: data.files.cartePro ? data.files.cartePro.name : data.pharmacienData.cartePro,
          diplome: data.files.diplome ? data.files.diplome.name : data.pharmacienData.diplome,
          assurancePro: data.files.assurancePro ? data.files.assurancePro.name : data.pharmacienData.assurancePro,
          etat: data.pharmacienData.etat ?? false,
        },
        pharmacieData: {
          nom: data.pharmacieData.nom || "",
          docPermis: data.files.docPermis ? data.files.docPermis.name : data.pharmacieData.docPermis,
          docAutorisation: data.files.docAutorisation
            ? data.files.docAutorisation.name
            : data.pharmacieData.docAutorisation,
        },
      };

      return updateUserProfile(parseInt(userId, 10), {
        ...apiData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["pharmacien", userId] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy", userId] });
      setIsEditing(false);
      setImagePreview(null);
      setAlertState({
        open: true,
        type: "success",
        message: "Profile updated successfully!",
      });
    },
    onError: (err) => {
      setAlertState({
        open: true,
        type: "error",
        message: "Failed to update profile: " + (err instanceof Error ? err.message : "Unknown error"),
      });
    },
  });

  const isLoading = userLoading || pharmacienLoading || pharmacyLoading;
  const error = userError || pharmacienError || pharmacyError;
  const userDetails: UserWithDetails | null = userData
    ? { ...userData, pharmacien: pharmacienData, pharmacy: pharmacyData }
    : null;

  const handleEtatChange = (checked: boolean) => {
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      setAlertState({
        open: true,
        type: "error",
        message: "Invalid user ID. Cannot update status.",
      });
      return;
    }
    validateMutation.mutate({ userId: parsedUserId, etat: checked });
  };

  const handleInputChange = (section: string, field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: typeof value === "string" ? value : value.toString(),
      },
    }));
  };

  const handleFileDrop = (field: keyof typeof formData.files, files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        files: {
          ...prev.files,
          [field]: file,
        },
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setFormData((prev) => ({
        ...prev,
        files: {
          ...prev.files,
          image: file,
        },
      }));
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (isEditing) {
          setFormData((prev) => ({
            ...prev,
            adresseData: {
              ...prev.adresseData,
              latitude: e.latlng.lat.toString(),
              longitude: e.latlng.lng.toString(),
            },
          }));
        }
      },
    });
    return null;
  };

  const handleSubmit = () => {
    updateMutation.mutate(formData);
  };

  const handleEditClick = () => {
    if (userDetails) {
      setFormData({
        utilisateurData: {
          nom: userDetails.nom,
          prenom: userDetails.prenom,
          email: userDetails.email,
          telephone: userDetails.telephone,
          role: userDetails.role,
          image: userDetails.image,
        },
        adresseData: {
          num_street: userDetails.adresse?.num_street || "",
          street: userDetails.adresse?.street || "",
          city: userDetails.adresse?.city || "",
          postal_code: userDetails.adresse?.postal_code || "",
          country: userDetails.adresse?.country || "",
          latitude: userDetails.adresse?.latitude?.toString() || "0",
          longitude: userDetails.adresse?.longitude?.toString() || "0",
        },
        pharmacienData: userDetails.pharmacien || {},
        pharmacieData: userDetails.pharmacy || {},
        files: {},
      });
    }
    setIsEditing(true);
  };

  const handleAlertClose = () => {
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  if (isLoading) return <AppLayout><div>Loading...</div></AppLayout>;
  if (error) return <AppLayout><div>Error: {(error instanceof Error ? error.message : "Failed to fetch data")}</div></AppLayout>;
  if (!userDetails) return <AppLayout><div>No details available</div></AppLayout>;

  const fullName = `${userDetails.nom} ${userDetails.prenom}` || "Amanda";
  const defaultPosition: [number, number] = [
    parseFloat(formData.adresseData.latitude || userDetails.adresse?.latitude?.toString() || "51.505") || 51.505,
    parseFloat(formData.adresseData.longitude || userDetails.adresse?.longitude?.toString() || "-0.09") || -0.09,
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-50 p-6 rounded-t-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {fullName}</h1>
        <div>
          {isEditing ? (
            <>
              <Image
                src={imagePreview || userDetails.image || "/default-profile.png"}
                alt={`${fullName}'s profile`}
                width={50}
                height={50}
                className="rounded-full object-cover border-2 border-blue-200 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </>
          ) : (
            <Image
              src={userDetails.image || "/default-profile.png"}
              alt={`${fullName}'s profile`}
              width={50}
              height={50}
              className="rounded-full object-cover border-2 border-blue-200"
            />
          )}
        </div>
      </div>

      {/* Main Content */}
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
              <Button onClick={handleEditClick} className="bg-blue-500 text-white hover:bg-blue-600">
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.utilisateurData.nom || ""}
                    onChange={(e) => handleInputChange("utilisateurData", "nom", e.target.value)}
                  />
                  <Input
                    value={formData.utilisateurData.prenom || ""}
                    onChange={(e) => handleInputChange("utilisateurData", "prenom", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Telephone</Label>
                  <Input
                    value={formData.utilisateurData.telephone || ""}
                    onChange={(e) => handleInputChange("utilisateurData", "telephone", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={formData.utilisateurData.role || ""} disabled />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={formData.adresseData.country || ""}
                    onChange={(e) => handleInputChange("adresseData", "country", e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <p className="mt-1 text-lg">{fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Telephone</label>
                  <p className="mt-1 text-lg">{userDetails.telephone || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Role</label>
                  <p className="mt-1 text-lg">{userDetails.role || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Country</label>
                  <p className="mt-1 text-lg">{userDetails.adresse?.country || "N/A"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <div>
              <label className="block text-sm font-medium">Email Address</label>
              {isEditing ? (
                <Input value={formData.utilisateurData.email || ""} disabled />
              ) : (
                <p className="mt-1 text-lg">{userDetails.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address and Pharmacist/Pharmacy Details */}
        <div className="mt-8 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Address</h2>
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={formData.adresseData.num_street || ""}
                  onChange={(e) => handleInputChange("adresseData", "num_street", e.target.value)}
                  placeholder="Number and Street"
                />
                <Input
                  value={formData.adresseData.street || ""}
                  onChange={(e) => handleInputChange("adresseData", "street", e.target.value)}
                  placeholder="Street"
                />
                <Input
                  value={formData.adresseData.city || ""}
                  onChange={(e) => handleInputChange("adresseData", "city", e.target.value)}
                  placeholder="City"
                />
                <Input
                  value={formData.adresseData.postal_code || ""}
                  onChange={(e) => handleInputChange("adresseData", "postal_code", e.target.value)}
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
                      value={formData.adresseData.latitude || ""}
                      onChange={(e) => handleInputChange("adresseData", "latitude", e.target.value)}
                      placeholder="Latitude"
                    />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input
                      value={formData.adresseData.longitude || ""}
                      onChange={(e) => handleInputChange("adresseData", "longitude", e.target.value)}
                      placeholder="Longitude"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-lg">
                  {userDetails.adresse
                    ? `${userDetails.adresse.num_street} ${userDetails.adresse.street}, ${userDetails.adresse.city}, ${userDetails.adresse.postal_code}, ${userDetails.adresse.country}`
                    : "N/A"}
                </p>
                {(userDetails.adresse?.latitude || userDetails.adresse?.longitude) && (
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
            {userDetails.pharmacien ? (
              <ul className="list-disc pl-5 space-y-4">
                <li>
                  <span className="font-medium">Carte Pro:</span>{" "}
                  {isEditing ? (
                    <div>
                      <div
                        className="border-2 border-dashed border-gray-300 p-4 text-center rounded-lg"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFileDrop("cartePro", e.dataTransfer.files);
                        }}
                      >
                        <input
                          type="file"
                          onChange={(e) => handleFileDrop("cartePro", e.target.files)}
                          className="hidden"
                          id="cartePro"
                        />
                        <label htmlFor="cartePro" className="cursor-pointer text-blue-500 hover:underline">
                          {formData.files.cartePro ? formData.files.cartePro.name : "Drag or click to upload"}
                        </label>
                      </div>
                      {userDetails.pharmacien.cartePro && (
                        <a href={userDetails.pharmacien.cartePro} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2 block">
                          View Current File
                        </a>
                      )}
                    </div>
                  ) : userDetails.pharmacien.cartePro ? (
                    <a href={userDetails.pharmacien.cartePro} target="_blank" rel="noopener noreferrer" className="text-blue-500">
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
                      <div
                        className="border-2 border-dashed border-gray-300 p-4 text-center rounded-lg"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFileDrop("diplome", e.dataTransfer.files);
                        }}
                      >
                        <input
                          type="file"
                          onChange={(e) => handleFileDrop("diplome", e.target.files)}
                          className="hidden"
                          id="diplome"
                        />
                        <label htmlFor="diplome" className="cursor-pointer text-blue-500 hover:underline">
                          {formData.files.diplome ? formData.files.diplome.name : "Drag or click to upload"}
                        </label>
                      </div>
                      {userDetails.pharmacien.diplome && (
                        <a href={userDetails.pharmacien.diplome} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2 block">
                          View Current File
                        </a>
                      )}
                    </div>
                  ) : userDetails.pharmacien.diplome ? (
                    <a href={userDetails.pharmacien.diplome} target="_blank" rel="noopener noreferrer" className="text-blue-500">
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
                      <div
                        className="border-2 border-dashed border-gray-300 p-4 text-center rounded-lg"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFileDrop("assurancePro", e.dataTransfer.files);
                        }}
                      >
                        <input
                          type="file"
                          onChange={(e) => handleFileDrop("assurancePro", e.target.files)}
                          className="hidden"
                          id="assurancePro"
                        />
                        <label htmlFor="assurancePro" className="cursor-pointer text-blue-500 hover:underline">
                          {formData.files.assurancePro ? formData.files.assurancePro.name : "Drag or click to upload"}
                        </label>
                      </div>
                      {userDetails.pharmacien.assurancePro && (
                        <a href={userDetails.pharmacien.assurancePro} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2 block">
                          View Current File
                        </a>
                      )}
                    </div>
                  ) : userDetails.pharmacien.assurancePro ? (
                    <a href={userDetails.pharmacien.assurancePro} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      View File
                    </a>
                  ) : (
                    "N/A"
                  )}
                </li>
                <li>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="etat-checkbox">Status:</Label>
                    <Checkbox
                      id="etat-checkbox"
                      checked={userDetails.pharmacien.etat}
                      onCheckedChange={handleEtatChange}
                      disabled={validateMutation.isPending || isEditing}
                    />
                    <span>{userDetails.pharmacien.etat ? "Active" : "Inactive"}</span>
                    {validateMutation.isPending && <span className="ml-2 animate-pulse">Updating...</span>}
                  </div>
                </li>
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Pharmacy Details</h2>
            {userDetails.pharmacy ? (
              <ul className="list-disc pl-5 space-y-4">
                <li>
                  <span className="font-medium">Name:</span>{" "}
                  {isEditing ? (
                    <Input
                      value={formData.pharmacieData.nom || ""}
                      onChange={(e) => handleInputChange("pharmacieData", "nom", e.target.value)}
                      placeholder="Pharmacy Name"
                    />
                  ) : (
                    userDetails.pharmacy.nom || "N/A"
                  )}
                </li>
                <li>
                  <span className="font-medium">Doc Permis:</span>{" "}
                  {isEditing ? (
                    <div>
                      <div
                        className="border-2 border-dashed border-gray-300 p-4 text-center rounded-lg"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFileDrop("docPermis", e.dataTransfer.files);
                        }}
                      >
                        <input
                          type="file"
                          onChange={(e) => handleFileDrop("docPermis", e.target.files)}
                          className="hidden"
                          id="docPermis"
                        />
                        <label htmlFor="docPermis" className="cursor-pointer text-blue-500 hover:underline">
                          {formData.files.docPermis ? formData.files.docPermis.name : "Drag or click to upload"}
                        </label>
                      </div>
                      {userDetails.pharmacy.docPermis && (
                        <a href={userDetails.pharmacy.docPermis} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2 block">
                          View Current File
                        </a>
                      )}
                    </div>
                  ) : userDetails.pharmacy.docPermis ? (
                    <a href={userDetails.pharmacy.docPermis} target="_blank" rel="noopener noreferrer" className="text-blue-500">
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
                      <div
                        className="border-2 border-dashed border-gray-300 p-4 text-center rounded-lg"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFileDrop("docAutorisation", e.dataTransfer.files);
                        }}
                      >
                        <input
                          type="file"
                          onChange={(e) => handleFileDrop("docAutorisation", e.target.files)}
                          className="hidden"
                          id="docAutorisation"
                        />
                        <label htmlFor="docAutorisation" className="cursor-pointer text-blue-500 hover:underline">
                          {formData.files.docAutorisation ? formData.files.docAutorisation.name : "Drag or click to upload"}
                        </label>
                      </div>
                      {userDetails.pharmacy.docAutorisation && (
                        <a href={userDetails.pharmacy.docAutorisation} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2 block">
                          View Current File
                        </a>
                      )}
                    </div>
                  ) : userDetails.pharmacy.docAutorisation ? (
                    <a href={userDetails.pharmacy.docAutorisation} target="_blank" rel="noopener noreferrer" className="text-blue-500">
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
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* AlertModal */}
      <AlertModal
        open={alertState.open}
        type={alertState.type}
        message={alertState.message}
        onClose={handleAlertClose}
        onConfirm={handleAlertClose} // For simplicity, both buttons close the modal; adjust as needed
      />
    </AppLayout>
  );
}