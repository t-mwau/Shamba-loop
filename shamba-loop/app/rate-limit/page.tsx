import Link from "next/link";

export default function RateLimitPage() {
  return (
    <div className="page-wrap">
      <div className="empty-state">
        <span aria-hidden="true">⌛</span>
        <h1>Give it a moment</h1>
        <p>There have been too many requests. Please wait a little before trying again.</p>
        <Link className="button button-primary" href="/">Return home</Link>
      </div>
    </div>
  );
}
