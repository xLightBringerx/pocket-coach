import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Trainers from "./pages/Trainers";
import TrainerDetail from "./pages/TrainerDetail";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Dashboard from "./pages/Dashboard";
import BookService from "./pages/BookService";
import MyBookings from "./pages/MyBookings";
import RescheduleBooking from "./pages/RescheduleBooking";
import Onboarding from "./pages/Onboarding";
import Plan from "./pages/Plan";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/trainers/:id" element={<TrainerDetail />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />

        {/* Logged-in users only */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<MyBookings />} />
        </Route>

        {/* Clients only */}
        <Route element={<ProtectedRoute roles={["client"]} />}>
          <Route path="/book/:serviceId" element={<BookService />} />
          <Route path="/bookings/:id/reschedule" element={<RescheduleBooking />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/plan" element={<Plan />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}