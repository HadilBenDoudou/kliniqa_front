import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import GeocoderControl from "leaflet-control-geocoder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { validateField } from "../../../lib/helpers";

const positionIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Step2Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const Step2: React.FC<Step2Props> = ({ formData, setFormData, errors, setErrors }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerStyle = { width: "100%", height: "400px" };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name.split(".")[1];
    const value = e.target.value;
    setFormData((prev: any) => ({
      ...prev,
      adresse: { ...prev.adresse, [field]: value },
    }));
    validateField("adresse", field, value, setErrors);
  };

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map").setView([48.8566, 2.3522], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      const geocoder = new GeocoderControl();
      map.addControl(geocoder);
      mapRef.current = map;

      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setFormData((prev: any) => ({
          ...prev,
          adresse: { ...prev.adresse, latitude: lat.toString(), longitude: lng.toString() },
        }));
        if (markerRef.current) map.removeLayer(markerRef.current);
        const newMarker = L.marker([lat, lng], { icon: positionIcon }).addTo(map);
        markerRef.current = newMarker;
        newMarker.bindPopup(`Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`).openPopup();
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h2 className="text-xl font-semibold">Address Information</h2>
      <div className="space-y-2">
        <Label htmlFor="num_street">Street Number</Label>
        <Input id="num_street" name="adresse.num_street" value={formData.adresse.num_street} onChange={handleChange} />
        {errors["adresse.num_street"] && <p className="text-red-500 text-sm">{errors["adresse.num_street"]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="street">Street</Label>
        <Input id="street" name="adresse.street" value={formData.adresse.street} onChange={handleChange} />
        {errors["adresse.street"] && <p className="text-red-500 text-sm">{errors["adresse.street"]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input id="city" name="adresse.city" value={formData.adresse.city} onChange={handleChange} />
        {errors["adresse.city"] && <p className="text-red-500 text-sm">{errors["adresse.city"]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="postal_code">Postal Code</Label>
        <Input id="postal_code" name="adresse.postal_code" value={formData.adresse.postal_code} onChange={handleChange} />
        {errors["adresse.postal_code"] && <p className="text-red-500 text-sm">{errors["adresse.postal_code"]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input id="country" name="adresse.country" value={formData.adresse.country} onChange={handleChange} />
        {errors["adresse.country"] && <p className="text-red-500 text-sm">{errors["adresse.country"]}</p>}
      </div>
      <div id="map" style={mapContainerStyle} />
    </motion.div>
  );
};