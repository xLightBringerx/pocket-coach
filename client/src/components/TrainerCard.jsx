import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import { GOAL_LABELS } from "../utils/format";

export default function TrainerCard({ trainer }) {
  const name = trainer.user?.name || "Trainer";

  return (
    <Link to={`/trainers/${trainer._id}`} className="card trainer-card">
      <Avatar name={name} photo={trainer.user?.photo} />
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