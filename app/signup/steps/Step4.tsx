import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { FileUpload } from "../../../components/FileUpload";
import { validateField } from "../../../lib/helpers";

interface Step4Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const Step4: React.FC<Step4Props> = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name.split(".")[1];
    const value = e.target.value;
    setFormData((prev: any) => ({
      ...prev,
      pharmacie: { ...prev.pharmacie, [field]: value },
    }));
    validateField("pharmacie", field, value, setErrors);
  };

  const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: any) => ({
        ...prev,
        pharmacie: { ...prev.pharmacie, [field]: file },
      }));
      validateField("pharmacie", field, file.name, setErrors);
    }
  };

  const handleDrop = (field: string) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      setFormData((prev: any) => ({
        ...prev,
        pharmacie: { ...prev.pharmacie, [field]: file },
      }));
      validateField("pharmacie", field, file.name, setErrors);
    }
  };

  const handleRemoveFile = (field: string) => () => {
    setFormData((prev: any) => ({
      ...prev,
      pharmacie: { ...prev.pharmacie, [field]: null },
    }));
    setErrors((prev) => ({ ...prev, [`pharmacie.${field}`]: "" }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h2 className="text-xl font-semibold">Pharmacy Information</h2>
      <div className="space-y-2">
        <Label htmlFor="nom_pharmacie">Pharmacy Name</Label>
        <Input 
          id="nom_pharmacie" 
          name="pharmacie.nom" 
          value={formData.pharmacie?.nom || ""} 
          onChange={handleChange} 
        />
        {errors["pharmacie.nom"] && <p className="text-red-500 text-sm">{errors["pharmacie.nom"]}</p>}
      </div>
      <FileUpload
        id="docPermis"
        label="License Document"
        file={formData.pharmacie?.docPermis}
        accept="image/*,application/pdf"
        onFileChange={handleFileChange("docPermis")}
        onDrop={handleDrop("docPermis")}
        onRemove={handleRemoveFile("docPermis")}
        error={errors["pharmacie.docPermis"]}
      />
      <FileUpload
        id="docAutorisation"
        label="Authorization Document"
        file={formData.pharmacie?.docAutorisation}
        accept="image/*,application/pdf"
        onFileChange={handleFileChange("docAutorisation")}
        onDrop={handleDrop("docAutorisation")}
        onRemove={handleRemoveFile("docAutorisation")}
        error={errors["pharmacie.docAutorisation"]}
      />
    </motion.div>
  );
};
