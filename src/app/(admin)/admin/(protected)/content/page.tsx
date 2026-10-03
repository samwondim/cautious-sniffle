import { saveSettingsAction } from "@/app/actions/admin";
import { AdminForm, type FieldDef } from "@/components/admin/ui";
import { getSiteContent } from "@/lib/content";

export const metadata = { title: "Site content — Admin" };

type SettingField = { key: string; label: string; long?: boolean };
type Group = { title: string; fields: SettingField[] };

/** Mirrors the keys in `SETTING_DEFAULTS` (`src/lib/content.ts`). */
const GROUPS: Group[] = [
  {
    title: "Organization",
    fields: [
      { key: "org.name", label: "Organization name" },
      { key: "org.tagline", label: "Tagline", long: true },
    ],
  },
  {
    title: "Navigation",
    fields: [
      { key: "nav.mission", label: "Mission link" },
      { key: "nav.sectors", label: "Sectors link" },
      { key: "nav.work", label: "Work link" },
      { key: "nav.contact", label: "Contact link" },
      { key: "nav.donate", label: "Donate link" },
    ],
  },
  {
    title: "Hero",
    fields: [
      { key: "hero.eyebrow", label: "Eyebrow", long: true },
      { key: "hero.titleLead", label: "Title lead" },
      { key: "hero.titleHighlight", label: "Title highlight" },
      { key: "hero.titleTail", label: "Title tail" },
      { key: "hero.subtitle", label: "Subtitle", long: true },
      { key: "hero.primaryLabel", label: "Primary button label" },
      { key: "hero.primaryHref", label: "Primary button link" },
      { key: "hero.secondaryLabel", label: "Secondary button label" },
      { key: "hero.secondaryHref", label: "Secondary button link" },
    ],
  },
  {
    title: "Sectors",
    fields: [
      { key: "sectors.eyebrow", label: "Eyebrow" },
      { key: "sectors.title", label: "Title" },
    ],
  },
  {
    title: "Mission",
    fields: [
      { key: "mission.eyebrow", label: "Eyebrow", long: true },
      { key: "mission.title", label: "Title" },
      { key: "mission.body", label: "Body", long: true },
      { key: "mission.missionTitle", label: "Mission heading" },
      { key: "mission.missionBody", label: "Mission body", long: true },
      { key: "mission.visionTitle", label: "Vision heading" },
      { key: "mission.visionBody", label: "Vision body", long: true },
    ],
  },
  {
    title: "Work",
    fields: [
      { key: "work.eyebrow", label: "Eyebrow" },
      { key: "work.title", label: "Title" },
      { key: "work.subtitle", label: "Subtitle", long: true },
    ],
  },
  {
    title: "Give",
    fields: [
      { key: "give.eyebrow", label: "Eyebrow" },
      { key: "give.title", label: "Title" },
      { key: "give.body", label: "Body", long: true },
      { key: "give.ctaLabel", label: "Button label" },
      { key: "give.ctaHref", label: "Button link" },
    ],
  },
  {
    title: "Volunteer",
    fields: [
      { key: "volunteer.eyebrow", label: "Eyebrow" },
      { key: "volunteer.title", label: "Title (fallback)" },
      { key: "volunteer.titleLead", label: "Title lead" },
      { key: "volunteer.titleHighlight", label: "Title highlight" },
      { key: "volunteer.body", label: "Body", long: true },
      { key: "volunteer.ctaLabel", label: "Button label" },
      { key: "volunteer.ctaHref", label: "Button link" },
      { key: "volunteer.buttonLabel", label: "Form submit label" },
    ],
  },
  {
    title: "Contact & social",
    fields: [
      { key: "contact.email", label: "Email" },
      { key: "contact.phone", label: "Phone" },
      { key: "contact.address", label: "Address" },
      { key: "social.emailHref", label: "Email link" },
      { key: "social.websiteHref", label: "Website link" },
      { key: "social.communityHref", label: "Community link" },
    ],
  },
  {
    title: "Footer",
    fields: [{ key: "footer.copyright", label: "Copyright line" }],
  },
  {
    title: "Donate page",
    fields: [
      { key: "donate.eyebrow", label: "Eyebrow" },
      { key: "donate.title", label: "Title" },
      { key: "donate.subtitle", label: "Subtitle", long: true },
      { key: "donate.formTitle", label: "Form title" },
      { key: "donate.localTitle", label: "Local section title" },
      { key: "donate.localBody", label: "Local section body", long: true },
      {
        key: "donate.internationalTitle",
        label: "International section title",
      },
      {
        key: "donate.internationalBody",
        label: "International section body",
        long: true,
      },
      {
        key: "donate.placeholderNotice",
        label: "Placeholder notice (clear to hide)",
        long: true,
      },
      { key: "donate.projectsTitle", label: "Projects title" },
      { key: "donate.impactTitle", label: "Impact title" },
      { key: "donate.secureTitle", label: "Secure section title" },
      { key: "donate.secureBody", label: "Secure section body", long: true },
    ],
  },
];

export default async function AdminContentPage() {
  const content = await getSiteContent();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Site content</h1>
        <p className="mt-1 text-sm text-slate">
          Every label, heading, and paragraph on the public site. Saving
          publishes immediately.
        </p>
      </div>
      {GROUPS.map((group) => {
        const fields: FieldDef[] = group.fields.map((f) => ({
          name: `setting.${f.key}`,
          label: f.label,
          type: f.long ? "textarea" : "text",
          rows: 2,
        }));
        const values: Record<string, string> = {};
        for (const f of group.fields) {
          values[`setting.${f.key}`] = content[f.key] ?? "";
        }
        return (
          <section
            key={group.title}
            className="rounded-2xl border border-hairline bg-white p-6"
          >
            <h2 className="mb-5 font-display text-xl text-ink">
              {group.title}
            </h2>
            <AdminForm
              action={saveSettingsAction}
              fields={fields}
              values={values}
              submitLabel={`Save ${group.title}`}
            />
          </section>
        );
      })}
    </div>
  );
}
