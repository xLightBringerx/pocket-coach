import { Link, useParams } from "react-router-dom";
import ServiceCard from "../components/ServiceCard";
import useApiData from "../hooks/useApiData";
import { fetchTrainer } from "../api/catalogApi";
import { DAY_NAMES, GOAL_LABELS, formatTime, initials } from "../utils/format";

export default function TrainerDetail() {
  const { id } = useParams(); // the :id part of /trainers/:id
  const { data, error, loading } = useApiData(() => fetchTrainer(id), id);

  if (loading) return <p className="page-message">Loading trainer...</p>;

  if (error) {
    return (
      <>
        <Link to="/trainers" className="back-link">
          ← All trainers
        </Link>
        <p className="alert alert-error">{error}</p>
      </>
    );
  }

  const { trainer, services } = data;
  const name = trainer.user.name;

  return (
    <>
      <Link to="/trainers" className="back-link">
        ← All trainers
      </Link>

      <section className="card detail-header">
        <div className="avatar avatar-lg" aria-hidden="true">
          {initials(name)}
        </div>
        <div>
          <h1>{name}</h1>
          <p className="muted">
            {trainer.location} · {trainer.yearsExperience} years experience
          </p>
          <div className="badge-row">
            {trainer.specialties.map((goal) => (
              <span key={goal} className="badge">
                {GOAL_LABELS[goal]}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="detail-grid">
        <section className="card">
          <h2>About</h2>
          <p>{trainer.bio || "This trainer hasn't added a bio yet."}</p>

          <h3>Weekly availability</h3>
          {trainer.availability.length === 0 ? (
            <p className="muted">No hours set yet.</p>
          ) : (
            <ul className="availability-list">
              {trainer.availability.map((block) => (
                <li key={`${block.day}-${block.start}`}>
                  <span>{DAY_NAMES[block.day]}</span>
                  <span>
                    {formatTime(block.start)} – {formatTime(block.end)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Services</h2>
          {services.length === 0 ? (
            <p className="muted">No services listed yet.</p>
          ) : (
            <div className="stack">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} showTrainer={false} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}