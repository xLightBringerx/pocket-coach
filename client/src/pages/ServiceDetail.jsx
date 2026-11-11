import { Link, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useApiData from "../hooks/useApiData";
import { fetchService } from "../api/catalogApi";
import { GOAL_LABELS, formatDuration, formatPrice } from "../utils/format";

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: service, error, loading } = useApiData(() => fetchService(id), id);

  if (loading) return <p className="page-message">Loading service...</p>;

  if (error) {
    return (
      <>
        <Link to="/services" className="back-link">
          ← All services
        </Link>
        <p className="alert alert-error">{error}</p>
      </>
    );
  }

  const trainer = service.trainer;
  const trainerName = trainer.user.name;
  const bookingPath = `/book/${service._id}`;

  return (
    <>
      <Link to={`/trainers/${trainer._id}`} className="back-link">
        ← {trainerName}
      </Link>

      <div className="detail-grid">
        <section className="card">
          <span className="badge">{service.category.name}</span>
          <h1>{service.title}</h1>
          <p className="muted">
            with <Link to={`/trainers/${trainer._id}`}>{trainerName}</Link> · {trainer.location}
          </p>
          <p>{service.description}</p>

          {service.goals.length > 0 && (
            <>
              <h3>Good for</h3>
              <div className="badge-row">
                {service.goals.map((goal) => (
                  <span key={goal} className="badge">
                    {GOAL_LABELS[goal]}
                  </span>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="card booking-box">
          <p className="price">{formatPrice(service.price)}</p>
          <p className="muted">{formatDuration(service.durationMin)} session</p>

          {!user && (
            <Link to="/login" state={{ from: bookingPath }} className="btn btn-primary btn-block">
              Log in to book
            </Link>
          )}

          {user?.role === "client" && (
            <Link to={bookingPath} className="btn btn-primary btn-block">
              Book this session
            </Link>
          )}

          {user && user.role !== "client" && (
            <p className="muted small">Only client accounts can book sessions.</p>
          )}
        </aside>
      </div>
    </>
  );
}