import { Link } from "react-router-dom";
import { GOAL_LABELS, initials } from "../utils/format";

export default function TrainerCard({ trainer }) {
  const name = trainer.user?.name || "Trainer";

  return (
    <Link to={`/trainers/${trainer._id}`} className="card trainer-card">
      <div className="avatar" aria-hidden="true">
        {initials(name)}
      </div>
      <div>
        <h3>{name}</h3>
        <p className="muted small">
          {trainer.location} · {trainer.yearsExperience} yrs experience
        </p>
        <div className="badge-row">
          {trainer.specialties.map((goal) => (
            <span key={goal} className="badge">
              {GOAL_LABELS[goal]}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}