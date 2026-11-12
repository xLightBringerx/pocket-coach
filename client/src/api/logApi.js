import api from "./client";

export async function fetchWeekLogs(weekStart) {
  const res = await api.get("/logs", { params: { weekStart } });
  return res.data.logs;
}

export async function logWorkout(data) {
  const res = await api.post("/logs/workout", data);
  return res.data.log;
}

export async function logMeal(data) {
  const res = await api.post("/logs/meal", data);
  return res.data.log;
}

export async function deleteLog(id) {
  await api.delete(`/logs/${id}`);
}