// lib/sites.js
// Extracts the job-description text and light metadata from whatever job page
// the user is currently viewing. Everything reads the page the user loaded —
// no scraping, no network calls.

const SIA_SITES = (() => {
  // Per-site selectors. Order matters: first match wins.
  const RULES = [
    {
      host: /(^|\.)linkedin\.com$/,
      name: "LinkedIn",
      description: [
        ".jobs-description__content",
        ".jobs-box__html-content",
        "#job-details",
        ".description__text",
      ],
      title: [".job-details-jobs-unified-top-card__job-title", ".topcard__title"],
      meta: [".jobs-unified-top-card__subtitle", ".job-details-jobs-unified-top-card__primary-description-container"],
    },
    {
      host: /(^|\.)indeed\.com$/,
      name: "Indeed",
      description: ["#jobDescriptionText", ".jobsearch-JobComponent-description"],
      title: [".jobsearch-JobInfoHeader-title", "h1"],
      meta: [".jobsearch-CompanyInfoContainer", ".jobsearch-JobInfoHeader-subtitle"],
    },
    {
      host: /(^|\.)greenhouse\.io$/,
      name: "Greenhouse",
      description: ["#content", ".job__description", "#job_description"],
      title: [".app-title", "h1"],
      meta: [".company-name", ".location"],
    },
    {
      host: /(^|\.)lever\.co$/,
      name: "Lever",
      description: [".posting-content", ".section-wrapper.page-full-width"],
      title: [".posting-headline h2", "h2"],
      meta: [".posting-categories", ".sort-by-time"],
    },
    {
      host: /(^|\.)ashbyhq\.com$/,
      name: "Ashby",
      description: ["._description_", "[class*='description']"],
      title: ["h1"],
      meta: ["[class*='location']"],
    },
  ];

  function firstText(selectors) {
    for (const sel of selectors || []) {
      const el = document.querySelector(sel);
      if (el && el.innerText && el.innerText.trim().length > 40) {
        return el.innerText.trim();
      }
    }
    return "";
  }

  // Generic fallback: grab the largest text block on the page.
  function genericDescription() {
    const candidates = Array.from(
      document.querySelectorAll("main, article, section, div")
    );
    let best = "";
    for (const el of candidates) {
      const txt = (el.innerText || "").trim();
      // Heuristic: a real JD is long but not the entire page dump.
      if (txt.length > best.length && txt.length > 300 && txt.length < 12000) {
        best = txt;
      }
    }
    return best;
  }

  function detect() {
    const host = location.hostname;
    const rule = RULES.find((r) => r.host.test(host));
    if (rule) {
      const description = firstText(rule.description) || genericDescription();
      return {
        site: rule.name,
        title: firstText(rule.title) || document.title,
        meta: firstText(rule.meta),
        description,
        pageText: document.body.innerText || "",
      };
    }
    // Unknown site — still try, using the generic extractor.
    return {
      site: "Generic",
      title: document.title,
      meta: "",
      description: genericDescription(),
      pageText: document.body.innerText || "",
    };
  }

  return { detect };
})();
