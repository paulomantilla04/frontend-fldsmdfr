import { getApiWithToken } from "@/config/axios";
import { Login, CreateUser, User, UpdateUser } from "@/interfaces";

export class UserService {
  async login(data: Login) {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.post("/login", data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async register(data: CreateUser) {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.post("/register", data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get("/users");
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateUser(id: number, data: UpdateUser): Promise<User> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      const apiAxios = await getApiWithToken();
      await apiAxios.delete(`/users/${id}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
