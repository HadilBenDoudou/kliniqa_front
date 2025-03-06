import { signupSchema } from "./validation/schemas";
import { z } from "zod";

export const validateField = (
  section: string,
  field: string,
  value: string,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  try {
    const schema = signupSchema.shape[section as keyof typeof signupSchema.shape];
    if (schema) {
      schema.parse({ [field]: value });
      setErrors((prev) => ({ ...prev, [`${section}.${field}`]: "" }));
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errorMessage = err.errors.find((e) => e.path[0] === field)?.message || "";
      setErrors((prev) => ({ ...prev, [`${section}.${field}`]: errorMessage }));
    }
  }
};

export const validateStep = (
  step: number,
  formData: any,
  role: "utilisateur" | "pharmacien",
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  const stepErrors: Record<string, string> = {};
  let isValid = true;

  if (step === 1) {
    const utilisateurSchema = signupSchema.shape.utilisateur;
    try {
      utilisateurSchema.parse({
        ...formData.utilisateur,
        image: formData.utilisateur.image ? formData.utilisateur.image.name : "",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((e) => {
          stepErrors[`utilisateur.${e.path[0]}`] = e.message;
        });
        isValid = false;
      }
    }
  } else if (step === 2) {
    const adresseSchema = signupSchema.shape.adresse;
    try {
      adresseSchema.parse(formData.adresse);
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((e) => {
          stepErrors[`adresse.${e.path[0]}`] = e.message;
        });
        isValid = false;
      }
    }
  } else if (step === 3 && role === "pharmacien") {
    const pharmacienSchema = signupSchema.shape.pharmacien;
    try {
      pharmacienSchema.parse({
        cartePro: formData.pharmacien.cartePro?.name || "",
        diplome: formData.pharmacien.diplome?.name || "",
        assurancePro: formData.pharmacien.assurancePro?.name || "",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((e) => {
          stepErrors[`pharmacien.${e.path[0]}`] = e.message;
        });
        isValid = false;
      }
    }
  } else if (step === 4 && role === "pharmacien") {
    const pharmacieSchema = signupSchema.shape.pharmacie;
    try {
      pharmacieSchema.parse({
        nom: formData.pharmacie.nom,
        docPermis: formData.pharmacie.docPermis?.name || "",
        docAutorisation: formData.pharmacie.docAutorisation?.name || "",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((e) => {
          stepErrors[`pharmacie.${e.path[0]}`] = e.message;
        });
        isValid = false;
      }
    }
  }

  setErrors(stepErrors);
  return isValid;
};