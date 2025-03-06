// services/authService.ts

interface BaseApiResponse {
  success: boolean;
  message?: string;
}
import apiClient from '../../api-client'; 
interface AuthResponse {
  success: boolean;
  data: {
    message: string;
    userId?: number;
    token?: string;
  };
}
export const signupUser = async (formData: FormData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
export const requestPasswordReset = async (email: string) => {
  const response = await apiClient.post<{ success: boolean; data: { message: string; userId: number } }>(
    "/auth/generate-otp", 
    { email }
  );
  return response.data;
};
export const verifyResetPassword = async (userId: number, otp: string, newPassword: string) => {
  const response = await apiClient.post("/auth/reset-password", {
    userId,
    otp,
    newPassword,
  });
  return response.data;
};
export const loginUser = async ({ email, password }: { email: string; password: string }) => {
  const response = await apiClient.post<{ success: boolean; data: {
    session: any; message: string; userId: number 
} }>(
    "/auth/login",
    { email, password } 
  );
  return response.data;
};

// Déconnexion de l'utilisateur via l'API /logout
export async function logoutUser(): Promise<void> {
  try {
    const response = await apiClient.post<BaseApiResponse>("/auth/logout");
    console.log("Logout API Response:", {
      status: response.status,
      data: response.data,
    });

    if (!response.data || !response.data.success) {
      throw new Error(`Failed to logout: ${response.data?.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error during logout:", error);
    throw error instanceof Error ? error : new Error("Unknown error during logout");
  }
}