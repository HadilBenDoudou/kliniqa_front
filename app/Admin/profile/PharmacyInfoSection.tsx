"use client";
import React, { useState, useCallback } from "react";
import { User } from "@/lib/services/profile/userservice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { pharmacieOptionnelleSchema } from "../../../lib/validation/validationSchemas";

interface PharmacyInfoSectionProps {
  user: User;
  isEditing: boolean;
  onEditToggle: () => void;
  formData: {
    pharmacie: {
      nom: string;
      docPermis: File | null;
      docAutorisation: File | null;
    };
  };
  onInputChange: (field: string, value: string | File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  pharmacie?: { nom: string; docPermis: string; docAutorisation: string };
}

export function PharmacyInfoSection({
  user,
  isEditing,
  onEditToggle,
  formData,
  onInputChange,
  onSubmit,
  pharmacie,
}: PharmacyInfoSectionProps) {
  const [dragOver, setDragOver] = useState<{ [key: string]: boolean }>({
    docPermis: false,
    docAutorisation: false,
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
    if (file && file.type === "application/pdf") {
      onInputChange(`pharmacie.${field}`, file);
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "Seul le format PDF est accepté" }));
    }
    setDragOver((prev) => ({ ...prev, [field]: false }));
  }, [onInputChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.type === "application/pdf") {
        onInputChange(`pharmacie.${field}`, file);
        setErrors((prev) => ({ ...prev, [field]: "" }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: "Seul le format PDF est accepté" }));
      }
    }
  };

  const handleCancelFile = (field: string) => {
    onInputChange(`pharmacie.${field}`, null);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onInputChange(`pharmacie.${name}`, value);

    try {
      const partialSchema = pharmacieOptionnelleSchema.pick({ [name]: true } as Partial<Record<keyof typeof formData.pharmacie, true>>);
      partialSchema.parse({ [name]: value });
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
      const dataToValidate = {
        nom: formData.pharmacie.nom,
        docPermis: formData.pharmacie.docPermis ? formData.pharmacie.docPermis.name : pharmacie?.docPermis,
        docAutorisation: formData.pharmacie.docAutorisation ? formData.pharmacie.docAutorisation.name : pharmacie?.docAutorisation,
      };
      pharmacieOptionnelleSchema.parse(dataToValidate);
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
        Pharmacy Information
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
              <Label htmlFor="pharmacie.nom">Pharmacy Name</Label>
              <Input
                id="pharmacie.nom"
                name="nom"
                type="text"
                value={formData.pharmacie.nom}
                onChange={handleInput}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.nom && <p className="text-red-600 text-sm mt-1">{errors.nom}</p>}
            </div>
            <div>
              <Label htmlFor="pharmacie.docPermis">Permit Document (PDF)</Label>
              <div
                onDragOver={(e) => handleDragOver(e, "docPermis")}
                onDragLeave={() => handleDragLeave("docPermis")}
                onDrop={(e) => handleDrop(e, "docPermis")}
                className={`mt-1 p-4 border-2 border-dashed rounded-md text-center ${
                  dragOver.docPermis ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
              >
                {formData.pharmacie.docPermis ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{formData.pharmacie.docPermis.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelFile("docPermis")}
                      className="text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : pharmacie?.docPermis ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Current file</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelFile("docPermis")}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Drag and drop PDF here or click to upload</p>
                )}
                <Input
                  id="pharmacie.docPermis"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, "docPermis")}
                  className="hidden"
                />
                <label
                  htmlFor="pharmacie.docPermis"
                  className="cursor-pointer text-blue-600 hover:underline mt-2 block"
                >
                  Choose File
                </label>
              </div>
              {errors.docPermis && <p className="text-red-600 text-sm mt-1">{errors.docPermis}</p>}
              {pharmacie?.docPermis && !formData.pharmacie.docPermis && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Current file: <a href={pharmacie.docPermis} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">View</a>
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="pharmacie.docAutorisation">Authorization Document (PDF)</Label>
              <div
                onDragOver={(e) => handleDragOver(e, "docAutorisation")}
                onDragLeave={() => handleDragLeave("docAutorisation")}
                onDrop={(e) => handleDrop(e, "docAutorisation")}
                className={`mt-1 p-4 border-2 border-dashed rounded-md text-center ${
                  dragOver.docAutorisation ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
              >
                {formData.pharmacie.docAutorisation ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{formData.pharmacie.docAutorisation.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelFile("docAutorisation")}
                      className="text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : pharmacie?.docAutorisation ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Current file</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelFile("docAutorisation")}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Drag and drop PDF here or click to upload</p>
                )}
                <Input
                  id="pharmacie.docAutorisation"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, "docAutorisation")}
                  className="hidden"
                />
                <label
                  htmlFor="pharmacie.docAutorisation"
                  className="cursor-pointer text-blue-600 hover:underline mt-2 block"
                >
                  Choose File
                </label>
              </div>
              {errors.docAutorisation && <p className="text-red-600 text-sm mt-1">{errors.docAutorisation}</p>}
              {pharmacie?.docAutorisation && !formData.pharmacie.docAutorisation && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Current file: <a href={pharmacie.docAutorisation} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">View</a>
                </p>
              )}
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Pharmacy Name</p>
            <p className="text-md text-gray-800 dark:text-white">{formData.pharmacie.nom || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Permit Document</p>
            <p className="text-md text-gray-800 dark:text-white">
              {pharmacie?.docPermis ? (
                <a href={pharmacie.docPermis} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  View Permit
                </a>
              ) : (
                "Not provided"
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Authorization Document</p>
            <p className="text-md text-gray-800 dark:text-white">
              {pharmacie?.docAutorisation ? (
                <a href={pharmacie.docAutorisation} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  View Authorization
                </a>
              ) : (
                "Not provided"
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}