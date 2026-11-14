import "server-only";

import { Resend } from "resend";

import { siteUrl } from "@/lib/site-url";

/**
 * Staff email alerts for public form submissions, sent through Resend.
 *
 * Configuration (all three are required to send; see `.env.example`):
 * - `RESEND_API_KEY`      — from resend.com, scoped to "Sending access".
 * - `NOTIFY_EMAIL_FROM`   — a sender on a domain verified in Resend, e.g.
 *                           `Empower Humanity <notifications@example.org>`.
 * - `NOTIFY_EMAIL_TO`     — one or more staff addresses, comma-separated.
 *
 * Alerts are best-effort by design. The submission is already safely in the
 * database (and visible in the admin) before an alert is attempted, so a
 * missing key or a Resend outage is logged and never surfaces to the visitor.
 * Callers run this inside `after()`, so it never delays the response either.
 *
 * Every alert sets Reply-To to the person who submitted, so staff can answer
 * straight from their inbox.
 */

type Alert = {
  /** Short, scannable subject — the inbox list is where triage happens. */
  subject: string;
  /** Who submitted, for Reply-To. */
  replyTo: { name: string; email: string };
  /** Labelled facts, in display order. Empty values are skipped. */
  fields: Array<[label: string, value: string | null | undefined]>;
  /** Admin path to act on it, e.g. `/admin/volunteers`. */
  adminPath: string;
  /** Button label for that link. */
  adminLabel: string;
};

function config() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_EMAIL_FROM;
  const to = (process.env.NOTIFY_EMAIL_TO ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  if (!apiKey || !from || to.length === 0) return null;
  return { apiKey, from, to };
}

let warnedUnconfigured = false;

export async function sendStaffAlert(alert: Alert): Promise<void> {
  const settings = config();
  if (!settings) {
    if (!warnedUnconfigured) {
      warnedUnconfigured = true;
      console.warn(
        "[notify] Staff email alerts are off: set RESEND_API_KEY, NOTIFY_EMAIL_FROM and NOTIFY_EMAIL_TO to enable them.",
      );
    }
    return;
  }

  const adminUrl = new URL(alert.adminPath, siteUrl()).toString();
  const fields = alert.fields.filter(
    (field): field is [string, string] => Boolean(field[1]?.trim()),
  );

  try {
    const { error } = await new Resend(settings.apiKey).emails.send({
      from: settings.from,
      to: settings.to,
      replyTo: `${quoteName(alert.replyTo.name)} <${alert.replyTo.email}>`,
      subject: alert.subject,
      text: renderText(fields, adminUrl, alert.adminLabel),
      html: renderHtml(alert.subject, fields, adminUrl, alert.adminLabel),
    });
    if (error) console.error("[notify] Resend rejected the alert", error);
  } catch (error) {
    console.error("[notify] Could not reach Resend", error);
  }
}

/** RFC 5322 display names with commas or quotes must be quoted. */
function quoteName(name: string) {
  return `"${name.replace(/["\\\r\n]/g, "")}"`;
}

function renderText(
  fields: Array<[string, string]>,
  adminUrl: string,
  adminLabel: string,
) {
  const lines = fields.map(([label, value]) =>
    value.includes("\n") ? `${label}:\n${value}\n` : `${label}: ${value}`,
  );
  return `${lines.join("\n")}\n\n${adminLabel}: ${adminUrl}\n\nReply to this email to answer them directly.`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Table-based, inline-styled markup: the only layout that renders the same in
 * Outlook, Gmail and Apple Mail. Arial is the brand guideline's email
 * fallback for Figtree.
 */
function renderHtml(
  subject: string,
  fields: Array<[string, string]>,
  adminUrl: string,
  adminLabel: string,
) {
  const rows = fields
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e3eef0;vertical-align:top;width:140px;font-size:12px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;color:#47646b;">${escapeHtml(label)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e3eef0;font-size:15px;line-height:1.55;color:#103c46;white-space:pre-wrap;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#edf6f7;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#edf6f7;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr><td style="height:6px;background:linear-gradient(90deg,#3eacb4 0 20%,#3ca4c0 20% 40%,#e16d2d 40% 60%,#3b9861 60% 80%,#e8b02e 80% 100%);background-color:#3eacb4;"></td></tr>
          <tr><td style="padding:28px 32px 8px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;color:#2f878f;">Empower Humanity website</p>
            <h1 style="margin:0;font-size:22px;line-height:1.3;color:#103c46;">${escapeHtml(subject)}</h1>
          </td></tr>
          <tr><td style="padding:8px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          </td></tr>
          <tr><td style="padding:28px 32px 32px;">
            <a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:13px 26px;border-radius:9999px;background:#103c46;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">${escapeHtml(adminLabel)}</a>
            <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#47646b;">Reply to this email to answer them directly.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
