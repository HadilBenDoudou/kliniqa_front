import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Doit contenir une majuscule")
  .regex(/[a-z]/, "Doit contenir une minuscule")
  .regex(/\d/, "Doit contenir un chiffre")
  .regex(/[\W_]/, "Doit contenir un caractère spécial");

export const utilisateurSchema = z.object({
  email: z.string().email("Format d'email invalide").max(255).toLowerCase(),
  password: passwordSchema,
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(255),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").max(255),
  telephone: z
    .string()
    .regex(/^\+\d+$/, "Numéro de téléphone invalide (doit commencer par + et contenir entre 8 et 15 chiffres)")
    .min(9, "Le numéro doit contenir au moins 8 chiffres après le + (ex: +12345678)")
    .max(16, "Le numéro doit contenir au plus 15 chiffres après le + (ex: +123456789012345)"),
  image: z.string().max(500).optional().nullable(),
  role: z.enum(["utilisateur", "pharmacien", "parapharmacie"]),
});

// Rest of the file remains unchanged...
export const adresseSchema = z.object({
  num_street: z.string().min(1, "Numéro de rue requis").max(50),
  street: z.string().min(1, "Nom de rue requis").max(255),
  city: z.string().min(1, "Ville requise").max(100),
  postal_code: z.string().min(1, "Code postal requis").max(8),
  country: z.string().min(1, "Pays requis").max(100),
  longitude: z.string().max(50).optional().nullable(),
  latitude: z.string().max(50).optional().nullable(),
});

export const pharmacienOptionnelSchema = z
  .object({
    cartePro: z.string().min(5, "Carte professionnelle requise").max(255).optional(),
    diplome: z.string().min(5, "Diplôme requis").max(255).optional(),
    assurancePro: z.string().max(255).optional().nullable(),
    etat: z.boolean().optional(),
  })
  .partial();

export const pharmacieOptionnelleSchema = z
  .object({
    nom: z.string().min(2, "Le nom de la pharmacie est requis").max(255).optional(),
    docPermis: z.string().min(5, "Document permis requis").max(500).optional(),
    pharmacie_image: z.string().max(500).optional().nullable(),
    docAutorisation: z.string().min(5, "Document autorisation requis").max(500).optional(),
  })
  .partial();