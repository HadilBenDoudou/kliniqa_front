"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/ui/administrateur/AppLayout";
import {
  fetchUserById,
  fetchPharmacien,
  fetchPharmacy,
  validatePharmacist,
  User,
  Pharmacien,
  Pharmacy,
  Adresse,
} from "../../../../../../lib/services/profile/userservice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// AlertModal Component
interface AlertModalProps {
  open: boolean;
  type: "success" | "error";
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ open, type, message, onClose, onConfirm }) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{type === "success" ? "Success!" : "Error"}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            {type === "error" ? "Try Again" : "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm || onClose}>
            {type === "error" ? "Ok" : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

type UserWithDetails = User & {
  adresse?: Adresse;
  pharmacien?: Pharmacien;
  pharmacy?: Pharmacy;
};

// Define the loading box style
const box = {
  width: 20,
  height: 20,
  backgroundColor: "#2d2dc1",
  borderRadius: 5,
};

export default function PharmacistDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const userId = params.userId as string;

  // State for AlertModal
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [showMap, setShowMap] = useState(true); // New state to control map visibility

  // Fetch user data
  const { data: userData, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(parseInt(userId, 10)),
    enabled: !!userId,
  });

  // Fetch pharmacist data
  const { data: pharmacienData, isLoading: pharmacienLoading, error: pharmacienError } = useQuery<Pharmacien>({
    queryKey: ["pharmacien", userId],
    queryFn: () => fetchPharmacien(parseInt(userId, 10)),
    enabled: !!userId,
  });

  // Fetch pharmacy data
  const { data: pharmacyData, isLoading: pharmacyLoading, error: pharmacyError } = useQuery<Pharmacy>({
    queryKey: ["pharmacy", userId],
    queryFn: () => fetchPharmacy(parseInt(userId, 10)),
    enabled: !!userId,
  });

  // Mutation to validate pharmacist status
  const validateMutation = useMutation({
    mutationFn: ({ userId, etat }: { userId: number; etat: boolean }) =>
      validatePharmacist(userId, etat),
    onMutate: async ({ userId, etat }) => {
      await queryClient.cancelQueries({ queryKey: ["pharmacien", userId.toString()] });
      await queryClient.cancelQueries({ queryKey: ["users"] });

      const previousPharmacien = queryClient.getQueryData<Pharmacien>(["pharmacien", userId.toString()]);
      const previousUsers = queryClient.getQueryData<User[]>(["users"]);

      queryClient.setQueryData(["pharmacien", userId.toString()], (old: Pharmacien | undefined) => {
        if (!old) return old;
        return { ...old, etat };
      });

      queryClient.setQueryData(["users"], (old: User[] | undefined) => {
        if (!old) return old;
        return old.map((user) =>
          user.id === userId ? { ...user, status: etat ? "Active" : "Inactive" } : user
        );
      });

      return { previousPharmacien, previousUsers };
    },
    onError: (err, { userId }, context) => {
      queryClient.setQueryData(["pharmacien", userId.toString()], context?.previousPharmacien);
      queryClient.setQueryData(["users"], context?.previousUsers);
      console.error("Error validating pharmacist:", err);
      setAlertType("error");
      setAlertMessage("Failed to update pharmacist status: " + (err instanceof Error ? err.message : "Unknown error"));
      setAlertOpen(true);
      setShowMap(true); // Ensure map remains visible on error
    },
    onSuccess: (_, { userId, etat }) => {
      queryClient.invalidateQueries({ queryKey: ["pharmacien", userId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setAlertType("success");
      setAlertMessage(`Pharmacist status successfully updated to ${etat ? "Active" : "Inactive"}!`);
      setAlertOpen(true);
      setShowMap(false); // Hide map when success alert is shown
    },
  });

  const isLoading = userLoading || pharmacienLoading || pharmacyLoading;
  const error = userError || pharmacienError || pharmacyError;

  const userDetails: UserWithDetails | null = userData
    ? {
        ...userData,
        pharmacien: pharmacienData || undefined,
        pharmacy: pharmacyData || undefined,
      }
    : null;

  const handleEtatChange = (checked: boolean) => {
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      setAlertType("error");
      setAlertMessage("Invalid user ID. Cannot update status.");
      setAlertOpen(true);
      return;
    }
    validateMutation.mutate({ userId: parsedUserId, etat: checked });
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    setShowMap(true); // Show map again when alert is closed
  };

  // Default coordinates for the map (fallback: London)
  const defaultPosition: [number, number] = [51.505, -0.09];

  // Use address coordinates if available, otherwise fallback to default
  const position: [number, number] = userDetails?.adresse?.latitude && userDetails?.adresse?.longitude
    ? [userDetails.adresse.latitude, userDetails.adresse.longitude]
    : defaultPosition;

  if (isLoading) {
    return (
      <AppLayout>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Pharmacist Details</h1>
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{
              scale: [1, 2, 2, 1, 1],
              rotate: [0, 0, 180, 180, 0],
              borderRadius: ["0%", "0%", "50%", "50%", "0%"],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.2, 0.5, 0.8, 1],
              repeat: Infinity,
              repeatDelay: 1,
            }}
            style={box}
          />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Pharmacist Details</h1>
        <div className="text-center text-red-500">
          Error: {(error instanceof Error ? error.message : "Failed to fetch user details")}
        </div>
      </AppLayout>
    );
  }

  if (!userDetails) {
    return (
      <AppLayout>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Pharmacist Details</h1>
        <div className="text-center text-gray-500">No details available</div>
      </AppLayout>
    );
  }

  const fullName = `${userDetails.nom} ${userDetails.prenom}` || "Amanda";

  // Generate abbreviation from email
  const emailParts = userDetails.email.split("@");
  const abbreviation = emailParts.length === 2 && emailParts[0] && emailParts[1]
    ? `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase()
    : userDetails.email.length >= 2
      ? userDetails.email.slice(0, 2).toUpperCase()
      : "??";

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-50 p-6 rounded-t-lg shadow-md">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {fullName}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative w-[50px] h-[50px]">
            {userDetails.image ? (
              <>
                <Image
                  src={userDetails.image}
                  alt={`${fullName}'s profile`}
                  width={50}
                  height={50}
                  className="rounded-full object-cover border-2 border-blue-200 hover:border-blue-400 transition duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = "block";
                    (e.currentTarget.nextSibling as HTMLElement).style.display = "none";
                  }}
                />
                <div
                  className="w-[50px] h-[50px] flex items-center justify-center rounded-full text-white text-lg font-semibold border-2 border-blue-200 hover:border-blue-400 transition duration-300 absolute top-0 left-0"
                  style={{ backgroundColor: "#2d2dc1", display: "none" }}
                >
                  {abbreviation}
                </div>
              </>
            ) : (
              <div
                className="w-[50px] h-[50px] flex items-center justify-center rounded-full text-white text-lg font-semibold border-2 border-blue-200 hover:border-blue-400 transition duration-300"
                style={{ backgroundColor: "#2d2dc1" }}
              >
                {abbreviation}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 bg-white rounded-b-lg shadow-md">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/administrateur/pharmacie-user")}
            className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition duration-200"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacist Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Personal Information */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="mt-1 text-lg text-gray-900">{fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">User Name</label>
                <p className="mt-1 text-lg text-gray-900">{userDetails.supabase_user_id || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Telephone</label>
                <p className="mt-1 text-lg text-gray-900">{userDetails.telephone || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Role</label>
                <p className="mt-1 text-lg text-gray-900">{userDetails.role || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="mt-1 text-lg text-gray-900">N/A</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Country</label>
                <p className="mt-1 text-lg text-gray-900">{userDetails.adresse?.country || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Column 2: Additional Information */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Gender</label>
                <p className="mt-1 text-lg text-gray-900">N/A</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Language</label>
                <p className="mt-1 text-lg text-gray-900">N/A</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Time Zone</label>
                <p className="mt-1 text-lg text-gray-900">N/A</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">My Email Address</label>
                <p className="mt-1 text-lg text-gray-900">{userDetails.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-8 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Address</h2>
            {userDetails.adresse ? (
              <div>
                <p className="text-lg text-gray-900 mb-4">
                  {userDetails.adresse.num_street} {userDetails.adresse.street}, {userDetails.adresse.city}, {userDetails.adresse.postal_code}, {userDetails.adresse.country}
                </p>
                {showMap && (
                  <div className="h-64 w-full">
                    <MapContainer
                      center={position}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                      className="rounded-lg"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={position}>
                        <Popup>
                          {userDetails.adresse.street}, {userDetails.adresse.city}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-lg text-gray-500 mb-4">N/A</p>
                {showMap && (
                  <div className="h-64 w-full">
                    <MapContainer
                      center={defaultPosition}
                      zoom={2}
                      style={{ height: "100%", width: "100%" }}
                      className="rounded-lg"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={defaultPosition}>
                        <Popup>Default Location (No address provided)</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Pharmacist Details</h2>
            {userDetails.pharmacien ? (
              <ul className="list-disc pl-5 space-y-2 text-gray-900">
                <li>
                  <span className="font-medium">Carte Pro:</span>{" "}
                  {userDetails.pharmacien.cartePro ? (
                    <a
                      href={userDetails.pharmacien.cartePro}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center space-x-1"
                    >
                      <span>View File</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </li>
                <li>
                  <span className="font-medium">Diplôme:</span>{" "}
                  {userDetails.pharmacien.diplome ? (
                    <a
                      href={userDetails.pharmacien.diplome}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center space-x-1"
                    >
                      <span>View File</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </li>
                <li>
                  <span className="font-medium">Assurance Pro:</span>{" "}
                  {userDetails.pharmacien.assurancePro ? (
                    <a
                      href={userDetails.pharmacien.assurancePro}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center space-x-1"
                    >
                      <span>View File</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </li>
                <li>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="etat-checkbox" className="text-gray-700 font-medium">
                      Status:
                    </Label>
                    <Checkbox
                      id="etat-checkbox"
                      checked={userDetails.pharmacien.etat}
                      onCheckedChange={(checked) => handleEtatChange(checked as boolean)}
                      disabled={validateMutation.isPending}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-lg text-gray-900">
                      {userDetails.pharmacien.etat ? "Active" : "Inactive"}
                    </span>
                    {validateMutation.isPending && (
                      <span className="text-gray-500 ml-2 animate-pulse">Updating...</span>
                    )}
                  </div>
                </li>
              </ul>
            ) : (
              <p className="text-lg text-gray-500">N/A</p>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Pharmacy Details</h2>
            {userDetails.pharmacy ? (
              <ul className="list-disc pl-5 space-y-2 text-gray-900">
                <li>
                  <span className="font-medium">Name:</span> {userDetails.pharmacy.nom || "N/A"}
                </li>
                <li>
                  <span className="font-medium">Doc Permis:</span>{" "}
                  {userDetails.pharmacy.docPermis ? (
                    <a
                      href={userDetails.pharmacy.docPermis}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center space-x-1"
                    >
                      <span>View File</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </li>
                <li>
                  <span className="font-medium">Doc Autorisation:</span>{" "}
                  {userDetails.pharmacy.docAutorisation ? (
                    <a
                      href={userDetails.pharmacy.docAutorisation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center space-x-1"
                    >
                      <span>View File</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </li>
                <li>
                  <span className="font-medium">Image Pharmacie:</span>{" "}
                  {userDetails.pharmacy.pharmacie_image ? (
                    <a
                      href={userDetails.pharmacy.pharmacie_image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center space-x-1"
                    >
                      <span>View File</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </li>
              </ul>
            ) : (
              <p className="text-lg text-gray-500">N/A</p>
            )}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        open={alertOpen}
        type={alertType}
        message={alertMessage}
        onClose={handleAlertClose}
      />
    </AppLayout>
  );
}