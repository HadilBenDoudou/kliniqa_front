"use client";
import React, { useState } from "react";
import { User } from "@/lib/services/profile/userservice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { utilisateurSchema } from "@/lib/validation/validationSchemas";

interface MyProfileSectionProps {
  user: User;
  isEditing: boolean;
  onEditToggle: () => void;
  formData: {
    nom: string;
    prenom: string;
    telephone: string;
    role: string;
    image: File | null;
  };
  onInputChange: (field: string, value: string | File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function MyProfileSection({
  user,
  isEditing,
  onEditToggle,
  formData,
  onInputChange,
  onSubmit,
}: MyProfileSectionProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getInitials = () => {
    return user.nom && user.prenom ? `${user.nom[0]}${user.prenom[0]}`.toUpperCase() : "?";
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "telephone") {
      newValue = value.replace(/[^\d+]/g, "");
      if (!newValue.startsWith("+")) {
        newValue = "+" + newValue.replace(/^\+/, "");
      }
    }

    onInputChange(name, newValue);

    try {
      const partialSchema = utilisateurSchema.pick({ [name]: true } as Partial<
        Record<keyof typeof formData, true>
      >);
      partialSchema.parse({ [name]: newValue });
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessage = err.errors.find((e) => e.path[0] === name)?.message || "";
        setErrors((prev) => ({ ...prev, [name]: errorMessage }));
      }
    }
    console.log("Errors after handleInput:", errors);
  };

  const validateForm = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data before validation:", formData);
    console.log("Errors before validation:", errors);
    try {
      const schema = utilisateurSchema.pick({ nom: true, prenom: true, telephone: true });
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
        My Profile
        {!isEditing && (
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
          <div className="flex items-center space-x-4">
            <div className="relative">
              <label htmlFor="image" className="cursor-pointer">
                <Avatar className="w-20 h-20 shadow-md hover:shadow-lg transition-shadow duration-200">
                  {formData.image ? (
                    <AvatarImage
                      src={URL.createObjectURL(formData.image)}
                      alt={`${formData.nom} ${formData.prenom}`}
                      className="rounded-full object-cover"
                    />
                  ) : user.image ? (
                    <AvatarImage
                      src={user.image}
                      alt={`${user.nom} ${user.prenom}`}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-gray-800 bg-opacity-50 rounded-full">
                  <span className="text-white text-sm font-medium">Change</span>
                </div>
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => onInputChange("image", e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
            <div>
              <Label htmlFor="nom">Last Name</Label>
              <Input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleInput}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.nom && <p className="text-red-600 text-sm mt-1">{errors.nom}</p>}
            </div>
            <div>
              <Label htmlFor="prenom">First Name</Label>
              <Input
                id="prenom"
                name="prenom"
                type="text"
                value={formData.prenom}
                onChange={handleInput}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.prenom && <p className="text-red-600 text-sm mt-1">{errors.prenom}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              type="text"
              value={formData.role}
              readOnly
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm"
            />
          </div>
          <div>
            <Label htmlFor="telephone">Phone</Label>
            <Input
              id="telephone"
              name="telephone"
              type="tel"
              value={formData.telephone}
              onChange={handleInput}
              placeholder="+21612345678"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.telephone && <p className="text-red-600 text-sm mt-1">{errors.telephone}</p>}
            <p className="text-gray-500 text-sm mt-1">Ex: +12345678 (start with + followed by 8-15 digits)</p>
          </div>
          <Button
            type="submit"
            disabled={Object.keys(errors).length > 0}
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            onClick={onEditToggle}
            className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </Button>
        </form>
      ) : (
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 shadow-sm">
            {formData.image ? (
              <AvatarImage
                src={URL.createObjectURL(formData.image)}
                alt={`${formData.nom} ${formData.prenom}`}
                className="rounded-full object-cover"
              />
            ) : user.image ? (
              <AvatarImage
                src={user.image}
                alt={`${user.nom} ${user.prenom}`}
                className="rounded-full object-cover"
              />
            ) : (
              <AvatarFallback className="bg-blue-100 text-blue-800">{getInitials()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h4 className="text-md font-semibold text-gray-800 dark:text-white">
              {user.nom && user.prenom ? `${user.nom} ${user.prenom}` : "Utilisateur"}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.role || "Role non spécifié"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.telephone || "Téléphone non spécifié"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}