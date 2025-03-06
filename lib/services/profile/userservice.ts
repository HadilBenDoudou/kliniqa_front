import apiClient from "../../api-client";

// Interfaces pour les entités
export interface User {
  id: number;
  supabase_user_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  image: string;
  role: string;
  created_at: string;
  updated_at: string | null;
  adresse?: Adresse;
}

export interface Adresse {
  adresse: string;
  city: string;
  id: number;
  latitude: number | null;
  longitude: number | null;
  num_street: string;
  postal_code: string;
  street: string;
  utilisateur_id: number;
  userId: number;
  country: string;
}

export interface Pharmacien {
  cartePro: string; // URL ou chemin du fichier
  diplome: string;
  assurancePro: string;
  etat: boolean;
}

export interface Pharmacy {
  nom: string;
  docPermis: string; // URL ou chemin du fichier
  docAutorisation: string; // URL ou chemin du fichier
}

// Types spécifiques pour les données partielles envoyées au backend
export interface UtilisateurData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  image?: string;
  role: string;
}

export interface AdresseData {
  num_street: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PharmacienData {
  cartePro?: string;
  diplome?: string;
  assurancePro?: string;
  etat: boolean;
}

export interface PharmacieData {
  nom: string;
  docPermis?: string;
  docAutorisation?: string;
}

// Interfaces pour les réponses API
interface BaseApiResponse {
  success: boolean;
  data: any;
  message: string;
}

interface ApiResponse {
  success: boolean;
  data: { user: User };
  message: string;
}

interface PharmacienApiResponse {
  success: boolean;
  data: { pharmacien: Pharmacien };
  message: string;
}

interface PharmacyApiResponse {
  success: boolean;
  data: { pharmacie: Pharmacy };
  message: string;
}
// Interfaces for API responses
interface UpdateApiResponse {
  success: boolean;
  data?: User; // Updated to handle `data` as User directly or wrapped differently
  user?: User; // Added to handle if backend returns `user` directly
  message?: string;
}
// Récupérer les données de l'utilisateur
export async function fetchUserById(userId: number): Promise<User> {
  try {
    if (isNaN(userId) || userId <= 0) {
      throw new Error("Invalid userId provided");
    }

    const response = await apiClient.get<ApiResponse>(`/users/users/${userId}`);
    console.log("API Response (fetchUserById):", {
      status: response.status,
      data: response.data,
    });

    if (!response.data || !response.data.success) {
      throw new Error(`Failed to fetch user data: ${response.data?.message || "Unknown error"}`);
    }

    const userData = response.data.data.user;
    if (!userData) {
      throw new Error("No user data found in API response");
    }

    let adresse: Adresse | undefined;
    if (!userData.adresse) {
      try {
        const adresseResponse = await fetchAdresse(userId);
        adresse = adresseResponse;
      } catch (adresseError) {
        console.error("Error fetching address in fetchUserById:", adresseError);
        adresse = undefined;
      }
    } else {
      adresse = userData.adresse;
    }

    return {
      id: userData.id,
      supabase_user_id: userData.supabase_user_id || "",
      nom: userData.nom || "",
      prenom: userData.prenom || "",
      email: userData.email || "",
      telephone: userData.telephone || "",
      image: userData.image || "",
      role: userData.role || "",
      created_at: userData.created_at || "",
      updated_at: userData.updated_at || null,
      adresse: adresse,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error instanceof Error ? error : new Error("Unknown error fetching user");
  }
}

// Récupérer les données de l'adresse
export async function fetchAdresse(userId: number): Promise<Adresse> {
  try {
    if (isNaN(userId) || userId <= 0) {
      throw new Error("Invalid userId provided");
    }

    const response = await apiClient.get<BaseApiResponse>(`/users/users/adresse/${userId}`);
    console.log("Adresse API Response (fetchAdresse):", {
      status: response.status,
      data: response.data,
    });

    if (!response.data || !response.data.success) {
      throw new Error(`Failed to fetch address data: ${response.data?.message || "Unknown error"}`);
    }

    const adresseData = response.data.data;

    if (!adresseData || typeof adresseData !== "object" || Object.keys(adresseData).length === 0) {
      throw new Error("No address data found in API response");
    }

    let addressDataToUse = adresseData;
    if (adresseData.adresse && typeof adresseData.adresse === "object") {
      addressDataToUse = adresseData.adresse;
    }

    const data: Adresse = {
      adresse: addressDataToUse.adresse || "",
      city: addressDataToUse.city || "",
      id: addressDataToUse.id || 0,
      latitude: addressDataToUse.latitude || null,
      longitude: addressDataToUse.longitude || null,
      num_street: addressDataToUse.num_street || "",
      postal_code: addressDataToUse.postal_code || "",
      street: addressDataToUse.street || "",
      utilisateur_id: addressDataToUse.utilisateur_id || userId,
      userId: userId,
      country: addressDataToUse.country || "",
    };

    return data;
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error instanceof Error ? error : new Error("Unknown error fetching address");
  }
}

// Récupérer les données du pharmacien
export async function fetchPharmacien(userId: number): Promise<Pharmacien> {
  try {
    if (isNaN(userId) || userId <= 0) {
      throw new Error("Invalid userId provided");
    }

    const response = await apiClient.get<PharmacienApiResponse>(`/users/users/pharmacien/${userId}`);
    console.log("Pharmacien API Response (fetchPharmacien):", {
      status: response.status,
      data: response.data,
    });

    if (!response.data || !response.data.success) {
      throw new Error(`Failed to fetch pharmacist data: ${response.data?.message || "Unknown error"}`);
    }

    const pharmacienData = response.data.data.pharmacien;

    if (!pharmacienData) {
      throw new Error("No pharmacist data found in API response");
    }

    return {
      cartePro: pharmacienData.cartePro || "",
      diplome: pharmacienData.diplome || "",
      assurancePro: pharmacienData.assurancePro || "",
      etat: pharmacienData.etat ?? false,
    };
  } catch (error) {
    console.error("Error fetching pharmacist:", error);
    throw error instanceof Error ? error : new Error("Unknown error fetching pharmacist");
  }
}

// Récupérer les données de la pharmacie
export async function fetchPharmacy(userId: number): Promise<Pharmacy> {
  try {
    if (isNaN(userId) || userId <= 0) {
      throw new Error("Invalid userId provided");
    }

    const response = await apiClient.get<PharmacyApiResponse>(`/users/users/pharmacie/${userId}`);
    console.log("Pharmacy API Response (fetchPharmacy):", {
      status: response.status,
      data: response.data,
    });

    if (!response.data || !response.data.success) {
      throw new Error(`Failed to fetch pharmacy data: ${response.data?.message || "Unknown error"}`);
    }

    const pharmacyData = response.data.data.pharmacie;

    if (!pharmacyData) {
      throw new Error("No pharmacy data found in API response");
    }

    return {
      nom: pharmacyData.nom || "",
      docPermis: pharmacyData.docPermis || "",
      docAutorisation: pharmacyData.docAutorisation || "",
    };
  } catch (error) {
    console.error("Error fetching pharmacy:", error);
    throw error instanceof Error ? error : new Error("Unknown error fetching pharmacy");
  }
}

// Mettre à jour les données de l'utilisateur via /users/edit/:id
// Update user profile
export async function updateUserProfile(
  userId: number,
  data: {
    utilisateurData: Partial<UtilisateurData>;
    adresseData: Partial<AdresseData>;
    pharmacienData: Partial<PharmacienData>;
    pharmacieData: Partial<PharmacieData>;
  }
): Promise<User> {
  try {
    if (isNaN(userId) || userId <= 0) {
      throw new Error("Invalid userId provided");
    }

    const response = await apiClient.put<UpdateApiResponse>(
      `/users/users/edit/${userId}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    console.log("Update response (updateUserProfile):", {
      status: response.status,
      data: response.data,
    });

    if (!response.data || !response.data.success) {
      throw new Error(`Failed to update user profile: ${response.data?.message || "Unknown error"}`);
    }

    // Handle different possible response structures
    let updatedUser: User;
    if (response.data.data) {
      updatedUser = response.data.data as User;
    } else if (response.data.user) {
      updatedUser = response.data.user as User;
    } else {
      throw new Error("No updated user data returned from API");
    }

    // Ensure adresse is included if present in the response
    if (response.data.data?.adresse || response.data.user?.adresse) {
      updatedUser.adresse = response.data.data?.adresse || response.data.user?.adresse;
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error instanceof Error && (error as any).response && (error as any).response.data) {
      console.error("Backend validation errors:", (error as any).response.data);
      throw new Error(`Update user profile error: ${JSON.stringify((error as any).response.data)}`);
    }
    throw error instanceof Error ? error : new Error("Unknown error updating user profile");
  }
} 
interface DeleteApiResponse {
  success: boolean;
  message?: string;
}
// Nouvelle fonction pour supprimer un utilisateur
export async function deleteUser(userId: number): Promise<void> {
  try {
    if (isNaN(userId) || userId <= 0) {
      throw new Error("Invalid userId provided");
    }

    const response = await apiClient.delete<DeleteApiResponse>(`/users/users/delete/${userId}`);
    console.log("Delete response (deleteUser):", {
      status: response.status,
      data: response.data,
    });

    if (!response.data || !response.data.success) {
      throw new Error(`Failed to delete user: ${response.data?.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error instanceof Error ? error : new Error("Unknown error deleting user");
  }
}