/**
 * UI-only preference: remembers whether the admin sidebar is collapsed.
 *
 * Read by the admin layout on the server and written from the sidebar on
 * toggle, so the rail stays collapsed across full reloads (not just client
 * navigations, which keep the layout mounted anyway).
 */
export const ADMIN_NAV_COOKIE = "eh_admin_nav";
