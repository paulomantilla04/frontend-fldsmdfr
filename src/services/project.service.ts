import { getApiWithToken } from "@/config/axios";
import { Project, CreateProject, UpdateProject } from "@/interfaces";

export class ProjectService {
  async createProject(data: CreateProject): Promise<Project> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.post("/projects", data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get("/projects");
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getProjectById(id: number): Promise<Project> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateProject(id: number, data: UpdateProject): Promise<Project> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.put(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteProject(id: number): Promise<void> {
    try {
      const apiAxios = await getApiWithToken();
      await apiAxios.delete(`/projects/${id}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
