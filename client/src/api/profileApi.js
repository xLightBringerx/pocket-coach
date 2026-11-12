import api from "./client";

export async function saveProfile(data) {
  const res = await api.put("/users/me/profile", data);
  return res.data.user;
}

export async function uploadPhoto(photo) {
  const res = await api.put("/users/me/photo", { photo });
  return res.data.user;
}

export async function removePhoto() {
  const res = await api.delete("/users/me/photo");
  return res.data.user;
}