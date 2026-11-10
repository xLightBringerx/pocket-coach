import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page-message">
      <h1>Page not found</h1>
      <p>That page doesn't exist (yet).</p>
      <Link to="/">Back to home</Link>
    </div>
  );
}