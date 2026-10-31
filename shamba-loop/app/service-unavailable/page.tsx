export default function ServiceUnavailablePage() {
  return (
    <div className="page-wrap">
      <div className="empty-state">
        <span aria-hidden="true">⌁</span>
        <h1>Temporarily unavailable</h1>
        <p>A required protection service is unavailable. Please try again later.</p>
      </div>
    </div>
  );
}
