import React from "react";
import { motion } from "framer-motion";
import { FileUpload } from "../../../components/FileUpload";
import { validateField } from "../../../lib/helpers";

interface Step3Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const Step3: React.FC<Step3Props> = ({ formData, setFormData, errors, setErrors }) => {
  const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`Selected file for pharmacien.${field}:`, file.name, file);
      setFormData((prev: any) => ({
        ...prev,
        pharmacien: { ...prev.pharmacien, [field]: file },
      }));
      validateField("pharmacien", field, file.name, setErrors);
    }
  };

  const handleDrop = (field: string) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      console.log(`Dropped file for pharmacien.${field}:`, file.name, file);
      setFormData((prev: any) => ({
        ...prev,
        pharmacien: { ...prev.pharmacien, [field]: file },
      }));
      validateField("pharmacien", field, file.name, setErrors);
    }
  };

  const handleRemoveFile = (field: string) => () => {
    setFormData((prev: any) => ({
      ...prev,
      pharmacien: { ...prev.pharmacien, [field]: null },
    }));
    setErrors((prev) => ({ ...prev, [`pharmacien.${field}`]: "" }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h2 className="text-xl font-semibold">Pharmacist Information</h2>
      <FileUpload
        id="cartePro"
        label="Professional Card"
        file={formData.pharmacien?.cartePro}
        accept="image/*,application/pdf"
        onFileChange={handleFileChange("cartePro")}
        onDrop={handleDrop("cartePro")}
        onRemove={handleRemoveFile("cartePro")}
        error={errors["pharmacien.cartePro"]}
      />
      <FileUpload
        id="diplome"
        label="Diploma"
        file={formData.pharmacien?.diplome}
        accept="image/*,application/pdf"
        onFileChange={handleFileChange("diplome")}
        onDrop={handleDrop("diplome")}
        onRemove={handleRemoveFile("diplome")}
        error={errors["pharmacien.diplome"]}
      />
      <FileUpload
        id="assurancePro"
        label="Professional Insurance"
        file={formData.pharmacien?.assurancePro}
        accept="image/*,application/pdf"
        onFileChange={handleFileChange("assurancePro")}
        onDrop={handleDrop("assurancePro")}
        onRemove={handleRemoveFile("assurancePro")}
        error={errors["pharmacien.assurancePro"]}
      />
    </motion.div>
  );
};