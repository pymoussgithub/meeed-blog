export function isDevAccountSwitcherEnabled() {
  return process.env.NODE_ENV === "development" || process.env.ENABLE_DEV_ACCOUNT_SWITCHER === "true";
}
