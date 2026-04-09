import api from "@/utils/axios";

export const uploadImages = async (files, folder = "rpar") => {
  if (!files || files.length === 0) {
    return [];
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const res = await api.post(`/uploads/images?folder=${encodeURIComponent(folder)}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data.images || [];
};
