// Presale funnel events, sent to the Google Analytics 4 property that
// pages/_document.js already loads. Each step is its own event so a GA4 funnel
// exploration can chain them; why a visitor could not go on is one event,
// presale_blocked, with a reason. Never send a wallet address, transaction
// hash or any other identifier: the privacy notice promises usage data only.
//
// If the Google tag is blocked (ad blockers, Brave Shields), these calls do
// nothing, so funnel counts are a floor, not a census.

export function trackEvent(name, params) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

// For states an effect notices (wallet connected, region blocked, ...): sent
// once per page load, however often the state flips or the page re-renders.
const sentOnce = new Set();
export function trackOnce(name, params) {
  const key = params ? `${name}:${Object.values(params).join(":")}` : name;
  if (sentOnce.has(key)) return;
  sentOnce.add(key);
  trackEvent(name, params);
}
