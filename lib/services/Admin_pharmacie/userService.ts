// lib/services/Admin_pharmacie/userService.ts
import apiClient from '../../api-client';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  image: string | null;
  role: string;
  created_at: string;
  updated_at: string | null;
  status?: "Active" | "Inactive" | "Pending";
}

interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
  };
}

export const fetchUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<UsersResponse>('/users/users');
  if (!response.data.success || !Array.isArray(response.data.data.users)) {
    throw new Error('Invalid response format from /users endpoint');
  }
  // Filtrer uniquement les utilisateurs ayant le rôle "pharmacien"
  const pharmacists = response.data.data.users.filter(
    user => user.role.toLowerCase() === 'pharmacien'
  );
  return pharmacists;
};