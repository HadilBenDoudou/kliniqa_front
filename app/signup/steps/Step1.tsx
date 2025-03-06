import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import TelephoneInput from "@/components/TelephoneInput";
import { FileUpload } from "../../../components/FileUpload";
import { validateField } from "../../../lib/helpers";

interface Step1Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  passwordVisible: boolean;
  setPasswordVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Step1: React.FC<Step1Props> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  passwordVisible,
  setPasswordVisible,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name.split(".")[1];
    const value = e.target.value;
    setFormData((prev: any) => ({
      ...prev,
      utilisateur: { ...prev.utilisateur, [field]: value },
    }));
    validateField("utilisateur", field, value, setErrors);
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      utilisateur: { ...prev.utilisateur, telephone: value },
    }));
    validateField("utilisateur", "telephone", value, setErrors);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: any) => ({
        ...prev,
        utilisateur: { ...prev.utilisateur, image: file },
      }));
      validateField("utilisateur", "image", file.name, setErrors);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev: any) => ({
        ...prev,
        utilisateur: { ...prev.utilisateur, image: file },
      }));
      validateField("utilisateur", "image", file.name, setErrors);
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev: any) => ({
      ...prev,
      utilisateur: { ...prev.utilisateur, image: null },
    }));
    setErrors((prev) => ({ ...prev, "utilisateur.image": "" }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nom">Name</Label>
        <Input
          id="nom"
          name="utilisateur.nom"
          value={formData.utilisateur.nom}
          onChange={handleChange}
        />
        {errors["utilisateur.nom"] && (
          <p className="text-red-500 text-sm">{errors["utilisateur.nom"]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="prenom">Surname</Label>
        <Input
          id="prenom"
          name="utilisateur.prenom"
          value={formData.utilisateur.prenom}
          onChange={handleChange}
        />
        {errors["utilisateur.prenom"] && (
          <p className="text-red-500 text-sm">{errors["utilisateur.prenom"]}</p>
        )}
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
        {errors["utilisateur.email"] && (
          <p className="text-red-500 text-sm">{errors["utilisateur.email"]}</p>
        )}
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
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {passwordVisible ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {errors["utilisateur.password"] && (
          <p className="text-red-500 text-sm">{errors["utilisateur.password"]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="telephone">Phone</Label>
        <TelephoneInput
          id="telephone"
          value={formData.utilisateur.telephone}
          onChange={handlePhoneChange}
        />
        {errors["utilisateur.telephone"] && (
          <p className="text-red-500 text-sm">{errors["utilisateur.telephone"]}</p>
        )}
      </div>
      <FileUpload
        id="image"
        label="Profile Photo"
        file={formData.utilisateur.image}
        accept="image/*"
        onFileChange={handleFileChange}
        onDrop={handleDrop}
        onRemove={handleRemoveFile}
        error={errors["utilisateur.image"]}
      />
    </motion.div>
  );
};