import api from "./client";

export async function fetchCurrentPlan() {
  const res = await api.get("/plans/current");
  return res.data.plan; // null if there's no plan yet
}

export async function generatePlan() {
  const res = await api.post("/plans/generate");
  return res.data.plan;
}