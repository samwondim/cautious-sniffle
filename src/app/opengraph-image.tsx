import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/**
 * The share card shown when any page is posted to WhatsApp, LinkedIn,
 * Facebook, X, Slack or iMessage. Pages that have a better image of their own
 * (a project with a photograph) override it in `generateMetadata`.
 *
 * Static on purpose: it reads no CMS content, so it is rendered once at build
 * and never touches the database. The text is brand copy, not editable copy.
 *
 * Fonts are static instances of the brand typefaces (OFL), cut from the
 * variable fonts because the image renderer cannot read variable axes or
 * WOFF2. They are Latin subsets — keep the copy below in Latin script.
 */
export const alt =
  "Empower Humanity — health, education, livelihoods and the environment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#103c46";
const MIST = "#d4e7ea";
/** Brand guideline order: teal, sky, orange, green, gold. */
const STRIPE = ["#3eacb4", "#3ca4c0", "#e16d2d", "#3b9861", "#e8b02e"];

export default async function OpengraphImage() {
  const root = process.cwd();
  const [bricolage, figtree, figtreeSemi, mark] = await Promise.all([
    readFile(join(root, "src/assets/fonts/BricolageGrotesque-Bold.ttf")),
    readFile(join(root, "src/assets/fonts/Figtree-Regular.ttf")),
    readFile(join(root, "src/assets/fonts/Figtree-SemiBold.ttf")),
    readFile(join(root, "src/app/icon.svg"), "utf8"),
  ]);
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: INK,
          fontFamily: "Figtree",
        }}
      >
        <div style={{ display: "flex", height: 14 }}>
          {STRIPE.map((color) => (
            <div key={color} style={{ flex: 1, background: color }} />
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            padding: "0 88px",
            gap: 64,
          }}
        >
          <img src={markSrc} width={270} height={270} alt="" />

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                fontFamily: "Bricolage Grotesque",
                fontSize: 92,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              Empower Humanity
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 34,
                lineHeight: 1.35,
                color: MIST,
                textWrap: "balance",
              }}
            >
              Working alongside communities so clinics stay staffed, classrooms
              stay open, and work pays.
            </div>
            <div
              style={{
                marginTop: 36,
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#e8b02e",
              }}
            >
              Health · Education · Livelihoods · Environment
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage Grotesque", data: bricolage, weight: 700, style: "normal" },
        { name: "Figtree", data: figtree, weight: 400, style: "normal" },
        { name: "Figtree", data: figtreeSemi, weight: 600, style: "normal" },
      ],
    },
  );
}
