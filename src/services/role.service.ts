import { getApiWithToken } from "@/config/axios";
import { Role, CreateRole } from "@/interfaces";

export class RoleService {
  async createRole(data: CreateRole): Promise<Role> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.post("/roles", data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get("/roles");
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getRoleById(id: number): Promise<Role> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateRole(id: number, data: Partial<Role>): Promise<Role> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.put(`/roles/${id}`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteRole(id: number): Promise<void> {
    try {
      const apiAxios = await getApiWithToken();
      await apiAxios.delete(`/roles/${id}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
