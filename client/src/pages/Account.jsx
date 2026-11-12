import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import useAuth from "../hooks/useAuth";
import { removePhoto, uploadPhoto } from "../api/profileApi";
import { getErrorMessage } from "../api/client";
import { resizeImageToSquare } from "../utils/image";

export default function Account() {
  const { user, updateUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files[0];
    e.target.value = ""; // lets the same file be picked again later
    if (!file) return;

    setError("");
    setMessage("");
    setBusy(true);
    try {
      const photo = await resizeImageToSquare(file);
      const updatedUser = await uploadPhoto(photo);
      updateUser(updatedUser);
      setMessage("Photo updated.");
    } catch (err) {
      // API errors have a response; resize errors are plain messages
      setError(err.response ? getErrorMessage(err) : err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm("Remove your profile photo?")) return;
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const updatedUser = await removePhoto();
      updateUser(updatedUser);
      setMessage("Photo removed.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Account</h1>
      <p className="muted">
        Signed in as {user.email} ({user.role})
      </p>

      <section className="card plan-section">
        <h2>Profile photo</h2>
        {message && <p className="alert alert-success">{message}</p>}
        {error && <p className="alert alert-error">{error}</p>}

        <div className="account-photo">
          <Avatar name={user.name} photo={user.photo} size="lg" />
          <div className="account-photo-actions">
            <label className="btn btn-primary">
              {busy ? "Uploading..." : user.photo ? "Change photo" : "Upload photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="visually-hidden"
                onChange={handleFileChange}
                disabled={busy}
              />
            </label>
            {user.photo && (
              <button className="btn btn-outline" onClick={handleRemove} disabled={busy}>
                Remove
              </button>
            )}
          </div>
        </div>

        <p className="muted small">JPG, PNG or WebP. It's cropped to a square and resized automatically.</p>
      </section>

      {user.role === "client" && (
        <section className="card plan-section">
          <h2>Fitness profile</h2>
          <p className="muted">Update your age, height, weight, goal and training days.</p>
          <Link to="/onboarding" className="btn btn-outline">
            Edit fitness profile
          </Link>
        </section>
      )}
    </>
  );
}