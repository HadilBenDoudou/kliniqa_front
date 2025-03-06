"use client";
import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdresse, Adresse, User } from "@/lib/services/profile/userservice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import L from "leaflet";
import GeocoderControl from "leaflet-control-geocoder";
import { z } from "zod";
import { adresseSchema } from "../../../lib/validation/validationSchemas"; // Assurez-vous que le chemin est correct

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface AddressSectionProps {
  user: User;
  isEditing: boolean;
  onEditToggle: () => void;
  formData: {
    adresse: {
      num_street: string;
      street: string;
      city: string;
      postal_code: string;
      country: string;
      latitude: number | null;
      longitude: number | null;
    };
  };
  onInputChange: (field: string, value: string | File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  updateFormData: (adresse: Adresse) => void;
}

const Geocoder: React.FC<{ onGeocode: (latlng: L.LatLng) => void }> = ({ onGeocode }) => {
  const map = useMap();
  useEffect(() => {
    const geocoder = new GeocoderControl({ defaultMarkGeocode: false });
    geocoder.on("markgeocode", (e) => {
      const latlng = e.geocode.center;
      map.setView(latlng, 13);
      onGeocode(latlng);
    });
    map.addControl(geocoder);
    return () => {
      map.removeControl(geocoder);
    };
  }, [map, onGeocode]);
  return null;
};

const LocationMarker: React.FC<{ onLocationChange: (lat: number, lng: number) => void }> = ({ onLocationChange }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setPosition(e.latlng);
    onLocationChange(lat, lng);
  };
  useMapEvents({ click: handleMapClick });
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return position === null ? null : <Marker position={position} />;
};

export function AddressSection({
  user,
  isEditing,
  onEditToggle,
  formData,
  onInputChange,
  onSubmit,
  updateFormData,
}: AddressSectionProps) {
  const [userId, setUserId] = useState<number | null>(null);
  const [position, setPosition] = useState<[number, number] | null>(
    formData.adresse.latitude && formData.adresse.longitude
      ? [formData.adresse.latitude, formData.adresse.longitude]
      : null
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log("Stored userId in AddressSection:", storedUserId);
    if (storedUserId) {
      const parsedId = Number(storedUserId);
      setUserId(parsedId > 0 ? parsedId : null);
    }
  }, []);

  const { data: adresse, isLoading, error } = useQuery<Adresse, Error>({
    queryKey: userId ? ["adresse", userId] : ["adresse"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is null");
      return fetchAdresse(userId);
    },
    enabled: !!userId && userId > 0,
    retry: 1,
  });

  useEffect(() => {
    if (adresse) {
      updateFormData(adresse);
      if (adresse.latitude !== null && adresse.longitude !== null) {
        setPosition([adresse.latitude, adresse.longitude]);
      } else {
        setPosition(null);
      }
    }
  }, [adresse, updateFormData]);

  const handleGeocode = (latlng: L.LatLng) => {
    const newPosition: [number, number] = [latlng.lat, latlng.lng];
    setPosition(newPosition);
    onInputChange("adresse.latitude", latlng.lat.toString());
    onInputChange("adresse.longitude", latlng.lng.toString());
  };

  const handleLocationChange = (lat: number, lng: number) => {
    const newPosition: [number, number] = [lat, lng];
    setPosition(newPosition);
    onInputChange("adresse.latitude", lat.toString());
    onInputChange("adresse.longitude", lng.toString());
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onInputChange(`adresse.${name}`, value);

    // Validation en temps réel
    try {
      adresseSchema.parse({ ...formData.adresse, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessage = err.errors.find((e) => e.path[0] === name)?.message || "";
        setErrors((prev) => ({ ...prev, [name]: errorMessage }));
      }
    }
  };

  const validateForm = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      adresseSchema.parse(formData.adresse);
      setErrors({});
      onSubmit(e); // Appeler la soumission si la validation réussit
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        err.errors.forEach((error) => {
          newErrors[error.path[0]] = error.message;
        });
        setErrors(newErrors);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-md">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Address</h3>
        <p className="text-gray-600 dark:text-gray-300">Loading address...</p>
      </div>
    );
  }

  if (error || !adresse) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-md">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Address</h3>
        <p className="text-red-600 dark:text-red-400">Error loading address. Please try logging in again.</p>
      </div>
    );
  }

  const locationMessage = position
    ? `Position: Latitude ${position[0]}, Longitude ${position[1]}`
    : "Geographic position not available";

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex justify-between items-center">
        Address
        {isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditToggle}
            className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full shadow-sm hover:shadow-md"
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditToggle}
            className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full shadow-sm hover:shadow-md"
          >
            Edit
          </Button>
        )}
      </h3>
      {isEditing ? (
        <form onSubmit={validateForm} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adresse.country">Country</Label>
              <Input
                id="adresse.country"
                name="country"
                type="text"
                value={formData.adresse.country}
                onChange={handleInput}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
            </div>
            <div>
              <Label htmlFor="adresse.city">City / State</Label>
              <Input
                id="adresse.city"
                name="city"
                type="text"
                value={formData.adresse.city}
                onChange={handleInput}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
            </div>
            <div>
              <Label htmlFor="adresse.postal_code">Postal Code</Label>
              <Input
                id="adresse.postal_code"
                name="postal_code"
                type="text"
                value={formData.adresse.postal_code}
                onChange={handleInput}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.postal_code && <p className="text-red-600 text-sm mt-1">{errors.postal_code}</p>}
            </div>
            <div>
              <Label htmlFor="adresse.street">Street Address</Label>
              <Input
                id="adresse.street"
                name="street"
                type="text"
                value={`${formData.adresse.num_street} ${formData.adresse.street}`.trim()}
                onChange={(e) => {
                  const [num, ...street] = e.target.value.split(" ");
                  onInputChange("adresse.num_street", num || "");
                  onInputChange("adresse.street", street.join(" ") || "");
                  handleInput(e);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {(errors.num_street || errors.street) && (
                <p className="text-red-600 text-sm mt-1">{errors.num_street || errors.street}</p>
              )}
            </div>
            <div>
              <Label htmlFor="adresse.latitude">Latitude</Label>
              <Input
                id="adresse.latitude"
                name="latitude"
                type="text"
                value={formData.adresse.latitude?.toString() ?? ""}
                onChange={handleInput}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.latitude && <p className="text-red-600 text-sm mt-1">{errors.latitude}</p>}
            </div>
            <div>
              <Label htmlFor="adresse.longitude">Longitude</Label>
              <Input
                id="adresse.longitude"
                name="longitude"
                type="text"
                value={formData.adresse.longitude?.toString() ?? ""}
                onChange={handleInput}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.longitude && <p className="text-red-600 text-sm mt-1">{errors.longitude}</p>}
            </div>
          </div>
          {position && (
            <div className="h-64 w-full rounded-lg overflow-hidden mt-4">
              <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }} ref={mapRef}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Geocoder onGeocode={handleGeocode} />
                <LocationMarker onLocationChange={handleLocationChange} />
                <Marker position={position}>
                  <Popup>
                    Address: {`${formData.adresse.num_street} ${formData.adresse.street}, ${formData.adresse.city}, ${formData.adresse.country}`}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
          <Button
            type="submit"
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-shadow duration-200 mt-4"
          >
            Save Changes
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
              <p className="text-md text-gray-800 dark:text-white">{adresse.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
              <p className="text-md text-gray-800 dark:text-white">{adresse.country || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">City / State</p>
              <p className="text-md text-gray-800 dark:text-white">{adresse.city || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Postal Code</p>
              <p className="text-md text-gray-800 dark:text-white">{adresse.postal_code || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Street Address</p>
              <p className="text-md text-gray-800 dark:text-white">
                {`${adresse.num_street || ""} ${adresse.street || ""}`.trim() || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Latitude</p>
              <p className="text-md text-gray-800 dark:text-white">{position ? position[0] : "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Longitude</p>
              <p className="text-md text-gray-800 dark:text-white">{position ? position[1] : "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Utilisateur ID</p>
              <p className="text-md text-gray-800 dark:text-white">{adresse.utilisateur_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
              <p className="text-md text-gray-800 dark:text-white">{adresse.userId}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{locationMessage}</p>
          {position ? (
            <div className="h-64 w-full rounded-lg overflow-hidden">
              <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }} ref={mapRef}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Geocoder onGeocode={handleGeocode} />
                <LocationMarker onLocationChange={handleLocationChange} />
                <Marker position={position}>
                  <Popup>
                    Address: {`${adresse.num_street} ${adresse.street}, ${adresse.city}, ${adresse.country}`}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Map not available: no valid geographic coordinates.
            </p>
          )}
        </div>
      )}
    </div>
  );
}