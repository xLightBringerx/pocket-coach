import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { fetchMe, loginUser, registerUser } from "../api/authApi";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // If a token is saved, we're "loading" until we check it with the API
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

  // On first load, ask the API who the saved token belongs to
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    fetchMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("token")) // expired or invalid token
      .finally(() => setLoading(false));
  }, []);

  function saveSession({ token, user }) {
    localStorage.setItem("token", token);
    setUser(user);
    return user;
  }

  async function login(email, password) {
    return saveSession(await loginUser({ email, password }));
  }

  async function register(data) {
    return saveSession(await registerUser(data));
  }

  // Replace the logged-in user's details (e.g. after onboarding)
  function updateUser(nextUser) {
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}