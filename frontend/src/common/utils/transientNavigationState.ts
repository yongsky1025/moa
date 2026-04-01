const GUEST_ENERGY_IMPORT_INTENT_KEY = "guestEnergyImportIntent";
const POST_LOGIN_REDIRECT_KEY = "postLoginRedirect";

function isReloadNavigation() {
  if (typeof performance === "undefined" || typeof performance.getEntriesByType !== "function") {
    return false;
  }

  const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return entry?.type === "reload";
}

export function clearTransientNavigationStateOnReload() {
  if (!isReloadNavigation()) {
    return;
  }

  sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  sessionStorage.removeItem(GUEST_ENERGY_IMPORT_INTENT_KEY);
  localStorage.removeItem(GUEST_ENERGY_IMPORT_INTENT_KEY);
}

export function setGuestEnergyImportIntent() {
  sessionStorage.setItem(GUEST_ENERGY_IMPORT_INTENT_KEY, "true");
  localStorage.removeItem(GUEST_ENERGY_IMPORT_INTENT_KEY);
}

export function hasGuestEnergyImportIntent() {
  return sessionStorage.getItem(GUEST_ENERGY_IMPORT_INTENT_KEY) === "true" || localStorage.getItem(GUEST_ENERGY_IMPORT_INTENT_KEY) === "true";
}

export function clearGuestEnergyImportIntent() {
  sessionStorage.removeItem(GUEST_ENERGY_IMPORT_INTENT_KEY);
  localStorage.removeItem(GUEST_ENERGY_IMPORT_INTENT_KEY);
}
