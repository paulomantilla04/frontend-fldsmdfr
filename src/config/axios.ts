import axios from "axios";

export const getApiWithToken = async () => {
  let api;

  const token = localStorage.getItem("token");

  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
    Accept: "/",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers,
    withCredentials: true,
  });

  return api;
};
