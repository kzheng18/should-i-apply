// lib/ghost.js
// Heuristic ghost-job detector. These are FLAGS, not verdicts — on a single page
// we have limited data, so we surface signals and let the user judge. The crowd-
// sourced outcome dataset (see roadmap) is what turns these heuristics into
// real predictions over time.

const SIA_GHOST = (() => {
  const RED_FLAG_PHRASES = [
    "rockstar",
    "ninja",
    "wear many hats",
    "wears many hats",
    "fast-paced environment",
    "work hard play hard",
    "unpaid",
    "commission only",
    "commission-only",
    "must be a self-starter",
    "like a family",
    "we are a family",
    "unlimited pto", // often a soft flag
  ];

  const COMP_HINTS = [
    "$",
    "salary",
    "compensation",
    "per year",
    "per hour",
    "/yr",
    "/hr",
    "base pay",
    "pay range",
    "k-",
    "usd",
  ];

  function check({ description = "", pageText = "", meta = "" }) {
    const flags = [];
    const desc = (description || "").toLowerCase();
    const page = (pageText || "").toLowerCase();
    const blob = `${desc} ${page} ${(meta || "").toLowerCase()}`;

    // 1. Reposted / stale.
    if (/\breposted\b/.test(blob) || /posted\s+\d+\+?\s+(months?|weeks?)\s+ago/.test(blob)) {
      flags.push({
        level: "warn",
        label: "Possibly reposted or stale",
        detail: "The page mentions a repost or an old posting date — sometimes a sign of an evergreen or unfilled req.",
      });
    }

    // 2. High applicant volume.
    const applicants = blob.match(/([0-9,]{2,})\s+applicants?/);
    if (applicants) {
      const n = parseInt(applicants[1].replace(/,/g, ""), 10);
      if (n >= 250) {
        flags.push({
          level: "warn",
          label: `${n.toLocaleString()} applicants`,
          detail: "Very high applicant volume — your application may never be read.",
        });
      }
    }

    // 3. No compensation anywhere.
    const hasComp = COMP_HINTS.some((h) => blob.includes(h));
    if (!hasComp) {
      flags.push({
        level: "info",
        label: "No compensation listed",
        detail: "No salary or pay range found on the page. Not damning, but transparent employers usually post it.",
      });
    }

    // 4. Red-flag phrases.
    const hits = RED_FLAG_PHRASES.filter((p) => desc.includes(p));
    if (hits.length) {
      flags.push({
        level: "info",
        label: `Buzzword flags: ${hits.slice(0, 3).join(", ")}`,
        detail: "Language sometimes associated with overwork or vague roles.",
      });
    }

    // 5. Suspiciously thin description.
    if (description && description.length < 400) {
      flags.push({
        level: "warn",
        label: "Very short description",
        detail: "Real roles usually describe responsibilities in detail. Thin posts can be lead-collection or ghost listings.",
      });
    }

    // Risk rollup.
    const warns = flags.filter((f) => f.level === "warn").length;
    let risk = "low";
    if (warns >= 2) risk = "high";
    else if (warns === 1) risk = "medium";
    else if (flags.length >= 2) risk = "medium";

    return { risk, flags };
  }

  return { check };
})();
