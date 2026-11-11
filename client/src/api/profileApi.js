import api from "./client";

export async function saveProfile(data) {
  const res = await api.put("/users/me/profile", data);
  return res.data.user;
}