import { initials } from "../utils/format";

// size: "sm" (navbar), "md" (cards) or "lg" (detail and account pages)
export default function Avatar({ name, photo, size = "md" }) {
  const sizeClass = size === "md" ? "" : ` avatar-${size}`;

  if (photo) {
    return <img className={`avatar${sizeClass}`} src={photo} alt={`${name}'s profile photo`} />;
  }

  return (
    <div className={`avatar${sizeClass}`} aria-hidden="true">
      {initials(name)}
    </div>
  );
}