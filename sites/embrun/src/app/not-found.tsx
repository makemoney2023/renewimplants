export default function NotFound() {
  return (
    <main id="main-content" className="content-page" tabIndex={-1}>
      <header className="content-hero">
        <div className="content-hero-copy">
          <h1>Page not found</h1>
          <p>That page is not on this site.</p>
          <p className="page-actions">
            <a className="button button-primary" href="/">
              Back to home
            </a>
          </p>
        </div>
      </header>
    </main>
  );
}
