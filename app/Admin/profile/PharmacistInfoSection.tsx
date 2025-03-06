"use client";
import React, { useState, useCallback } from "react";
import { User, Pharmacien } from "@/lib/services/profile/userservice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { pharmacienOptionnelSchema } from "../../../lib/validation/validationSchemas";

interface PharmacistInfoSectionProps {
  user: User;
  isEditing: boolean;
  onEditToggle: () => void;
  formData: {
    pharmacien: {
      cartePro: File | null;
      diplome: string | File | null;
      assurancePro: string | File | null;
      etat: boolean;
    };
  };
  onInputChange: (field: string, value: string | File | null | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  pharmacien?: Pharmacien;
}

export function PharmacistInfoSection({
  user,
  isEditing,
  onEditToggle,
  formData,
  onInputChange,
  onSubmit,
  pharmacien,
}: PharmacistInfoSectionProps) {
  const [dragOver, setDragOver] = useState<{ [key: string]: boolean }>({
    cartePro: false,
    diplome: false,
    assurancePro: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, field: string) => {
    e.preventDefault();
    setDragOver((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleDragLeave = useCallback((field: string) => {
    setDragOver((prev) => ({ ...prev, [field]: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, field: string) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (field === "cartePro" && file.type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, [field]: "Seul le format PDF est accepté" }));
        return;
      }
      onInputChange(`pharmacien.${field}`, file);
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    setDragOver((prev) => ({ ...prev, [field]: false }));
  }, [onInputChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (field === "cartePro" && file.type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, [field]: "Seul le format PDF est accepté" }));
        return;
      }
      onInputChange(`pharmacien.${field}`, file);
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCancelFile = (field: string) => {
    onInputChange(`pharmacien.${field}`, null);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToValidate = {
        cartePro: formData.pharmacien.cartePro ? formData.pharmacien.cartePro.name : pharmacien?.cartePro,
        diplome: formData.pharmacien.diplome instanceof File ? formData.pharmacien.diplome.name : pharmacien?.diplome,
        assurancePro: formData.pharmacien.assurancePro instanceof File ? formData.pharmacien.assurancePro.name : pharmacien?.assurancePro,
      };
      pharmacienOptionnelSchema.parse(dataToValidate);
      setErrors({});
      onSubmit(e);
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

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex justify-between items-center">
        Pharmacist Information
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
              <Label htmlFor="pharmacien.cartePro">Professional Card (PDF)</Label>
              <div
                onDragOver={(e) => handleDragOver(e, "cartePro")}
                onDragLeave={() => handleDragLeave("cartePro")}
                onDrop={(e) => handleDrop(e, "cartePro")}
                className={`mt-1 p-4 border-2 border-dashed rounded-md text-center ${
                  dragOver.cartePro ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
              >
                {formData.pharmacien.cartePro ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{formData.pharmacien.cartePro.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelFile("cartePro")}
                      className="text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : pharmacien?.cartePro ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Current file</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelFile("cartePro")}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Drag and drop PDF here or click to upload</p>
                )}
                <Input
                  id="pharmacien.cartePro"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, "cartePro")}
                  className="hidden"
                />
                <label
                  htmlFor="pharmacien.cartePro"
                  className="cursor-pointer text-blue-600 hover:underline mt-2 block"
                >
                  Choose File
                </label>
              </div>
              {errors.cartePro && <p className="text-red-600 text-sm mt-1">{errors.cartePro}</p>}
              {pharmacien?.cartePro && !formData.pharmacien.cartePro && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Current file: <a href={pharmacien.cartePro} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">View</a>
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="pharmacien.diplome">Degree</Label>
              <div
                onDragOver={(e) => handleDragOver(e, "diplome")}
                onDragLeave={() => handleDragLeave("diplome")}
                onDrop={(e) => handleDrop(e, "diplome")}
                className={`mt-1 p-4 border-2 border-dashed rounded-md text-center ${
                  dragOver.diplome ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
              >
                {formData.pharmacien.diplome instanceof File ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{formData.pharmacien.diplome.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelFile("diplome")}
                      className="text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : pharmacien?.diplome && typeof pharmacien.diplome === "string" ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Current file</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelFile("diplome")}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Drag and drop file here or click to upload</p>
                )}
                <Input
                  id="pharmacien.diplome"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => handleFileChange(e, "diplome")}
                  className="hidden"
                />
                <label
                  htmlFor="pharmacien.diplome"
                  className="cursor-pointer text-blue-600 hover:underline mt-2 block"
                >
                  Choose File
                </label>
              </div>
              {errors.diplome && <p className="text-red-600 text-sm mt-1">{errors.diplome}</p>}
              {pharmacien?.diplome && typeof pharmacien.diplome === "string" && !formData.pharmacien.diplome && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Current file: <a href={pharmacien.diplome} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">View</a>
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="pharmacien.assurancePro">Professional Insurance</Label>
              <div
                onDragOver={(e) => handleDragOver(e, "assurancePro")}
                onDragLeave={() => handleDragLeave("assurancePro")}
                onDrop={(e) => handleDrop(e, "assurancePro")}
                className={`mt-1 p-4 border-2 border-dashed rounded-md text-center ${
                  dragOver.assurancePro ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
              >
                {formData.pharmacien.assurancePro instanceof File ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{formData.pharmacien.assurancePro.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelFile("assurancePro")}
                      className="text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : pharmacien?.assurancePro && typeof pharmacien.assurancePro === "string" ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Current file</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelFile("assurancePro")}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Drag and drop file here or click to upload</p>
                )}
                <Input
                  id="pharmacien.assurancePro"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => handleFileChange(e, "assurancePro")}
                  className="hidden"
                />
                <label
                  htmlFor="pharmacien.assurancePro"
                  className="cursor-pointer text-blue-600 hover:underline mt-2 block"
                >
                  Choose File
                </label>
              </div>
              {errors.assurancePro && <p className="text-red-600 text-sm mt-1">{errors.assurancePro}</p>}
              {pharmacien?.assurancePro && typeof pharmacien.assurancePro === "string" && !formData.pharmacien.assurancePro && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Current file: <a href={pharmacien.assurancePro} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">View</a>
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="pharmacien.etat">Status</Label>
              <p className="mt-1 text-md text-gray-800 dark:text-white">
                {formData.pharmacien.etat ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <Button
            type="submit"
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            Save Changes
          </Button>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Professional Card</p>
            <p className="text-md text-gray-800 dark:text-white">
              {pharmacien?.cartePro ? (
                <a href={pharmacien.cartePro} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  View Card
                </a>
              ) : (
                "Not provided"
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Degree</p>
            <p className="text-md text-gray-800 dark:text-white">
              {pharmacien?.diplome ? (
                <a href={pharmacien.diplome} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  View Degree
                </a>
              ) : (
                "Not provided"
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Professional Insurance</p>
            <p className="text-md text-gray-800 dark:text-white">
              {pharmacien?.assurancePro ? (
                <a href={pharmacien.assurancePro} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  View Insurance
                </a>
              ) : (
                "Not provided"
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-md text-gray-800 dark:text-white">{formData.pharmacien.etat ? "Active" : "Inactive"}</p>
          </div>
        </div>
      )}
    </div>
  );
}