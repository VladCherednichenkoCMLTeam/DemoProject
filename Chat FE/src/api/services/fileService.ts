import { FileResponse } from "@/types";
import axiosInstance from "../axiosInstance";

export const uploadFiles = async (files: File[]): Promise<FileResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await axiosInstance.post<FileResponse>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
