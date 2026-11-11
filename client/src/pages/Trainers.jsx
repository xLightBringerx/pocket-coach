import { useSearchParams } from "react-router-dom";
import GoalFilter from "../components/GoalFilter";
import TrainerCard from "../components/TrainerCard";
import useApiData from "../hooks/useApiData";
import { fetchTrainers } from "../api/catalogApi";

export default function Trainers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const goal = searchParams.get("goal") || "";
  const { data: trainers, error, loading } = useApiData(() => fetchTrainers(goal), goal);

  function handleGoalChange(newGoal) {
    setSearchParams(newGoal ? { goal: newGoal } : {});
  }

  return (
    <>
      <h1>Find a trainer</h1>
      <p className="muted">Local trainers, filtered by what you're training for.</p>

      <GoalFilter value={goal} onChange={handleGoalChange} />

      {loading && <p className="page-message">Loading trainers...</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && !error && trainers.length === 0 && (
        <p className="page-message">No trainers match that goal yet.</p>
      )}

      {!loading && !error && trainers.length > 0 && (
        <div className="card-grid">
          {trainers.map((trainer) => (
            <TrainerCard key={trainer._id} trainer={trainer} />
          ))}
        </div>
      )}
    </>
  );
}