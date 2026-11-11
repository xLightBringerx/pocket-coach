import api from "./client";

export async function fetchCategories() {
  const res = await api.get("/categories");
  return res.data.categories;
}

export async function fetchTrainers(goal) {
  // params become ?goal=athletic on the URL
  const res = await api.get("/trainers", { params: goal ? { goal } : {} });
  return res.data.trainers;
}

export async function fetchTrainer(id) {
  const res = await api.get(`/trainers/${id}`);
  return res.data; // { trainer, services }
}

export async function fetchServices({ category, goal } = {}) {
  const params = {};
  if (category) params.category = category;
  if (goal) params.goal = goal;
  const res = await api.get("/services", { params });
  return res.data.services;
}

export async function fetchService(id) {
  const res = await api.get(`/services/${id}`);
  return res.data.service;
}