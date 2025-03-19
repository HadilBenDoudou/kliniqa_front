import React from "react";
import { motion } from "framer-motion";
import { FileUpload } from "../../../components/FileUpload";
import { validateField } from "../../../lib/helpers";

interface Step3ParapharmacieProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const Step3Parapharmacie: React.FC<Step3ParapharmacieProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      parapharmacie: { ...prev.parapharmacie, [name]: value },
    }));
    validateField("parapharmacie", name, value, setErrors);
  };

  const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`Selected file for parapharmacie.${field}:`, file.name, file);
      setFormData((prev: any) => ({
        ...prev,
        parapharmacie: { ...prev.parapharmacie, [field]: file },
      }));
      validateField("parapharmacie", field, file.name, setErrors);
    }
  };

  const handleDrop = (field: string) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      console.log(`Dropped file for parapharmacie.${field}:`, file.name, file);
      setFormData((prev: any) => ({
        ...prev,
        parapharmacie: { ...prev.parapharmacie, [field]: file },
      }));
      validateField("parapharmacie", field, file.name, setErrors);
    }
  };

  const handleRemoveFile = (field: string) => () => {
    setFormData((prev: any) => ({
      ...prev,
      parapharmacie: { ...prev.parapharmacie, [field]: null },
    }));
    setErrors((prev) => ({ ...prev, [`parapharmacie.${field}`]: "" }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h2 className="text-xl font-semibold">Parapharmacie Information</h2>
      <div>
        <label htmlFor="nom" className="block text-sm font-medium">
          Parapharmacie Name
        </label>
        <input
          type="text"
          id="nom"
          name="nom"
          value={formData.parapharmacie.nom}
          onChange={handleInputChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
        {errors["parapharmacie.nom"] && (
          <p className="text-red-500 text-sm">{errors["parapharmacie.nom"]}</p>
        )}
      </div>
      <FileUpload
        id="docPermis"
        label="Permit Document"
        file={formData.parapharmacie.docPermis}
        accept="image/*,application/pdf"
        onFileChange={handleFileChange("docPermis")}
        onDrop={handleDrop("docPermis")}
        onRemove={handleRemoveFile("docPermis")}
        error={errors["parapharmacie.docPermis"]}
      />
      <FileUpload
        id="docAutorisation"
        label="Authorization Document"
        file={formData.parapharmacie.docAutorisation}
        accept="image/*,application/pdf"
        onFileChange={handleFileChange("docAutorisation")}
        onDrop={handleDrop("docAutorisation")}
        onRemove={handleRemoveFile("docAutorisation")}
        error={errors["parapharmacie.docAutorisation"]}
      />
      <FileUpload
        id="image"
        label="Parapharmacie Image"
        file={formData.parapharmacie.image}
        accept="image/*"
        onFileChange={handleFileChange("image")}
        onDrop={handleDrop("image")}
        onRemove={handleRemoveFile("image")}
        error={errors["parapharmacie.image"]}
      />
    </motion.div>
  );
};