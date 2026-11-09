import api from "./client";

export async function registerUser(data) {
  const res = await api.post("/auth/register", data);
  return res.data; // { token, user }
}

export async function loginUser(data) {
  const res = await api.post("/auth/login", data);
  return res.data; // { token, user }
}

export async function fetchMe() {
  const res = await api.get("/auth/me");
  return res.data.user;
}