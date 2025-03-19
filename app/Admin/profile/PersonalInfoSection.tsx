"use client";
import React, { useState } from "react";
import { User } from "@/lib/services/profile/userservice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { utilisateurSchema } from "../../../lib/validation/validationSchemas";
import TelephoneInput from "@/components/TelephoneInput";

interface PersonalInfoSectionProps {
  user: User;
  isEditing: boolean;
  onEditToggle: () => void;
  formData: {
    email: string;
    telephone: string;
  };
  onInputChange: (field: string, value: string | File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PersonalInfoSection({
  user,
  isEditing,
  onEditToggle,
  formData,
  onInputChange,
  onSubmit,
}: PersonalInfoSectionProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInput = (field: string, value: string) => {
    let newValue = value;

    if (field === "telephone") {
      newValue = value.replace(/[^\d+]/g, "");
      if (!newValue.startsWith("+")) {
        newValue = "+" + newValue.replace(/^\+/, "");
      }
    }

    onInputChange(field, newValue);

    try {
      const partialSchema = utilisateurSchema.pick({ [field]: true } as Partial<
        Record<keyof typeof formData, true>
      >);
      partialSchema.parse({ [field]: newValue });
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessage = err.errors.find((e) => e.path[0] === field)?.message || "";
        setErrors((prev) => ({ ...prev, [field]: errorMessage }));
      }
    }
    console.log("Errors after handleInput:", errors);
  };

  const validateForm = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data before validation:", formData);
    console.log("Errors before validation:", errors);
    try {
      const schema = utilisateurSchema.pick({ telephone: true });
      schema.parse(formData);
      setErrors({});
      console.log("Validation passed, submitting:", formData);
      onSubmit(e);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        err.errors.forEach((error) => {
          newErrors[error.path[0]] = error.message;
        });
        setErrors(newErrors);
        console.log("Validation errors:", newErrors);
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex justify-between items-center">
        Personal Information
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
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <Label htmlFor="telephone">Phone</Label>
              <TelephoneInput
                id="telephone"
                value={formData.telephone}
                onChange={(value) => handleInput("telephone", value)}
                required
                disabled={false}
                className="mt-1 block w-full"
              />
              {errors.telephone && <p className="text-red-600 text-sm mt-1">{errors.telephone}</p>}
            </div>
          </div>
          <Button
            type="submit"
            disabled={Object.keys(errors).length > 0}
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            Save Changes
          </Button>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">First Name</p>
            <p className="text-md text-gray-800 dark:text-white">{user.prenom || "Non spécifié"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Name</p>
            <p className="text-md text-gray-800 dark:text-white">{user.nom || "Non spécifié"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
            <p className="text-md text-gray-800 dark:text-white">{user.email || "Email non disponible"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            <p className="text-md text-gray-800 dark:text-white">{user.telephone || "Numéro non spécifié"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Bio</p>
            <p className="text-md text-gray-800 dark:text-white">{user.role || "Description non spécifiée"}</p>
          </div>
        </div>
      )}
    </div>
  );
}