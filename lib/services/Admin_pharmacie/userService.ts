// lib/services/userService.ts
import apiClient from '../../api-client';
// Define the User interface 
interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  image: string | null; // From varchar("image", { length: 500 })
  role: string; // From varchar("role", { length: 50 }).notNull()
  created_at: string; // From timestamp("created_at").defaultNow()
  updated_at: string | null; // From timestamp("updated_at")
  status?: "Active" | "Inactive" | "Pending"; // Optional, if in DB  
}
// Define the expected response structure from the API
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
  return response.data.data.users;
};