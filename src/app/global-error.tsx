"use client";

/**
 * Last line of defence: the root layout itself failed. This replaces the
 * whole document, so it gets neither global styles nor the brand fonts —
 * everything is inline, and the type falls back to the brand guideline's
 * stated substitutes (Arial).
 */
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: "#103c46",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <title>Empower Humanity</title>
        <main style={{ padding: "48px 24px", maxWidth: 640, margin: "0 auto" }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#e8b02e",
            }}
          >
            Temporarily unavailable
          </p>
          <h1 style={{ margin: "16px 0", fontSize: 44, lineHeight: 1.1 }}>
            We&apos;ll be right back.
          </h1>
          <p style={{ margin: "0 0 32px", fontSize: 17, lineHeight: 1.65, color: "#d4e7ea" }}>
            Something went wrong loading the site. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              border: 0,
              borderRadius: 9999,
              padding: "16px 32px",
              background: "#e8b02e",
              color: "#103c46",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.04em",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
