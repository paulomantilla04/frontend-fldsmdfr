import { getApiWithToken } from "@/config/axios";
import { Project, CreateProject, UpdateProject, ProjectFile } from "@/interfaces";

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

  async uploadProjectFiles(projectId: number, files: File[]): Promise<ProjectFile[]> {
    try {
      const apiAxios = await getApiWithToken();
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await apiAxios.post(
        `/projects/${projectId}/files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getProjectFiles(projectId: number): Promise<ProjectFile[]> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get(`/projects/${projectId}/files`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteProjectFile(projectId: number, fileId: number): Promise<void> {
    try {
      const apiAxios = await getApiWithToken();
      await apiAxios.delete(`/projects/${projectId}/files/${fileId}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async downloadProjectFile(projectId: number, fileId: number): Promise<Blob> {
    try {
      const apiAxios = await getApiWithToken();
      const response = await apiAxios.get(
        `/projects/${projectId}/files/${fileId}/download`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

