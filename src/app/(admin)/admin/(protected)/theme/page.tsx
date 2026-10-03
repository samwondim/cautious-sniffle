import { saveThemeAction } from "@/app/actions/admin";
import { AdminForm } from "@/components/admin/ui";
import { getAccent } from "@/lib/content";

export const metadata = { title: "Theme — Admin" };

const PRESETS = [
  { name: "Teal (brand default)", value: "#3EACB4" },
  { name: "Sky blue", value: "#3CA4C0" },
  { name: "Growth green", value: "#3B9861" },
  { name: "Human orange", value: "#E16D2D" },
  { name: "Sun gold", value: "#E8B02E" },
  { name: "Deep teal ink", value: "#103C46" },
];

export default async function AdminThemePage() {
  const accent = await getAccent();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Theme</h1>
        <p className="mt-1 text-sm text-slate">
          The accent colour drives links, icons, and highlights across the
          public site. Saving publishes immediately.
        </p>
      </div>

      <section className="rounded-2xl border border-hairline bg-white p-6">
        <AdminForm
          action={saveThemeAction}
          fields={[{ name: "accent", label: "Accent colour", type: "color" }]}
          values={{ accent }}
          submitLabel="Save theme"
        />
      </section>

      <section className="rounded-2xl border border-hairline bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-ink">Brand presets</h2>
        <div className="flex flex-wrap gap-3">
          {PRESETS.map((preset) => (
            <span
              key={preset.value}
              className="flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-sm text-ink"
            >
              <span
                aria-hidden="true"
                className="h-5 w-5 rounded-full"
                style={{ background: preset.value }}
              />
              {preset.name}
              <span className="text-slate">{preset.value}</span>
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate">
          Copy a hex value into the picker above. Human orange is reserved
          for Donate buttons — avoid it as the site-wide accent.
        </p>
      </section>
    </div>
  );
}
