import { useSearchParams } from "react-router-dom";
import GoalFilter from "../components/GoalFilter";
import ServiceCard from "../components/ServiceCard";
import useApiData from "../hooks/useApiData";
import { fetchCategories, fetchServices } from "../api/catalogApi";

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const goal = searchParams.get("goal") || "";

  const { data: categories } = useApiData(fetchCategories, "categories");
  const { data: services, error, loading } = useApiData(
    () => fetchServices({ category, goal }),
    `${category}|${goal}` // reload whenever either filter changes
  );

  // Change one filter in the URL and keep the other one
  function updateFilter(name, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next);
  }

  return (
    <>
      <h1>Browse services</h1>
      <p className="muted">Every session our trainers offer, by category and goal.</p>

      <div className="filters">
        <label>
          Category
          <select value={category} onChange={(e) => updateFilter("category", e.target.value)}>
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <GoalFilter value={goal} onChange={(newGoal) => updateFilter("goal", newGoal)} />

      {loading && <p className="page-message">Loading services...</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && !error && services.length === 0 && (
        <p className="page-message">No services match those filters.</p>
      )}

      {!loading && !error && services.length > 0 && (
        <div className="card-grid">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </>
  );
}