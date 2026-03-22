export default function StatCard({ label, value, tone = "default", onClick, isActive = false }) {
  return (
    <article
      className={`stat-card ${tone} ${onClick ? "clickable" : ""} ${isActive ? "active" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
