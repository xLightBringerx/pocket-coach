import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
      <footer className="footer">
        <p>PocketCoach · General fitness guidance, not medical advice.</p>
      </footer>
    </div>
  );
}