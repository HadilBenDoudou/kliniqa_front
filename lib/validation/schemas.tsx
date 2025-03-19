import { z } from "zod";

export const passwordSchema = z.string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Doit contenir une majuscule")
  .regex(/[a-z]/, "Doit contenir une minuscule")
  .regex(/\d/, "Doit contenir un chiffre")
  .regex(/[\W_]/, "Doit contenir un caractère spécial");

export const adresseSchema = z.object({
  num_street: z.string().min(1, "Numéro de rue requis"),
  street: z.string().min(1, "Nom de rue requis"),
  city: z.string().min(1, "Ville requise"),
  postal_code: z.string().min(1, "Code postal requis"),
  country: z.string().min(1, "Pays requis"),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
});

export const pharmacienSchema = z.object({
  utilisateur_id: z.number().optional(),
  cartePro: z.string().min(5, "Carte professionnelle requise"),
  diplome: z.string().min(5, "Diplôme requis"),
  assurancePro: z.string().optional(),
});

export const pharmacieValidator = z.object({
  nom: z.string().min(2, "Le nom de la pharmacie doit contenir au moins 2 caractères"),
  docPermis: z.string().min(5, "Le document du permis est requis"),
  docAutorisation: z.string().min(5, "Le document d'autorisation est requis"),
  adresse_id: z.number().optional(),
  pharmacien_id: z.number().optional(),
});

export const parapharmacieValidator = z.object({
  nom: z.string().min(2, "Le nom de la parapharmacie doit contenir au moins 2 caractères"),
  docPermis: z.string().min(5, "Le document du permis est requis"),
  docAutorisation: z.string().min(5, "Le document d'autorisation est requis"),
  image: z.string().min(5, "L'image est requise"),
});

export const signupSchema = z.object({
  utilisateur: z.object({
    email: z.string().email({ message: "Email invalide" }).min(1),
    password: passwordSchema,
    nom: z.string().min(2),
    prenom: z.string().min(2),
    telephone: z.string().regex(/^\+\d{8,15}$/, "Numéro de téléphone invalide (doit commencer par + et contenir entre 8 et 15 chiffres)"),
    image: z.string().optional(),
    role: z.enum(["utilisateur", "pharmacien", "parapharmacie"]),
  }),
  adresse: adresseSchema.optional(),
  pharmacien: pharmacienSchema.optional(),
  pharmacie: pharmacieValidator.optional(),
  parapharmacie: parapharmacieValidator.optional(),
});

export const signInSchema = z.object({
  email: z.string().email().min(1),
  password: passwordSchema,
});

export const resetRequestSchema = z.object({
  email: z.string().email(),
});

export const resetVerifySchema = z.object({
  userId: z.number(),
  otp: z.string().length(6),
  newPassword: passwordSchema,
});

export const signupWithGmailSchema = z.object({
  nom: z.string().min(1, "First name is required"),
  prenom: z.string().min(1, "Last name is required"),
  telephone: z.string().min(1, "Phone number is required"),
  image: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  adresse: z.object({
    num_street: z.string().min(1, "Street number is required"),
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    postal_code: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  pharmacien: z.object({
    cartePro: z.string().min(1, "Professional card is required"),
    diplome: z.string().min(1, "Diploma is required"),
  }),
  pharmacie: z.object({
    nom: z.string().min(1, "Pharmacy name is required"),
    docPermis: z.string().min(1, "Permit document is required"),
    docAutorisation: z.string().min(1, "Authorization document is required"),
  }),
  parapharmacie: z.object({
    nom: z.string().min(1, "Parapharmacy name is required"),
    docPermis: z.string().min(1, "Permit document is required"),
    docAutorisation: z.string().min(1, "Authorization document is required"),
    image: z.string().min(1, "Image document is required"),
  }),
});