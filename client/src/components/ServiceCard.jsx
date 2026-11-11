import { Link } from "react-router-dom";
import { formatDuration, formatPrice } from "../utils/format";

// showTrainer is false on a trainer's own page, where the name is already shown
export default function ServiceCard({ service, showTrainer = true }) {
  return (
    <Link to={`/services/${service._id}`} className="card service-card">
      <span className="badge">{service.category?.name}</span>
      <h3>{service.title}</h3>
      {showTrainer && <p className="muted small">with {service.trainer?.user?.name}</p>}
      <p className="service-meta">
        <span>{formatDuration(service.durationMin)}</span>
        <strong>{formatPrice(service.price)}</strong>
      </p>
    </Link>
  );
}