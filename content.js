// content.js
// Orchestrates: read the page -> score fit -> flag ghosts -> inject the panel.

(function () {
  const BADGE_ID = "sia-badge";
  const PANEL_ID = "sia-panel";

  function getResume() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["resumeText"], (r) => resolve(r.resumeText || ""));
    });
  }

  function saveJob(job) {
    chrome.storage.local.get(["savedJobs"], (r) => {
      const jobs = r.savedJobs || [];
      // De-dupe by url.
      if (!jobs.some((j) => j.url === job.url)) {
        jobs.unshift(job);
        chrome.storage.local.set({ savedJobs: jobs.slice(0, 200) });
      }
    });
  }

  function fitColor(fit) {
    if (fit === null) return "#6b7280";
    if (fit >= 70) return "#16a34a";
    if (fit >= 40) return "#d97706";
    return "#dc2626";
  }

  function riskColor(risk) {
    return { low: "#16a34a", medium: "#d97706", high: "#dc2626" }[risk] || "#6b7280";
  }

  function chip(text) {
    return `<span class="sia-chip">${escapeHtml(text)}</span>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function render(analysis) {
    document.getElementById(BADGE_ID)?.remove();
    document.getElementById(PANEL_ID)?.remove();

    const { fit, matched, missing, ghost, hasResume } = analysis;

    // Floating badge.
    const badge = document.createElement("div");
    badge.id = BADGE_ID;
    const fitLabel = fit === null ? "?" : `${fit}%`;
    badge.innerHTML = `
      <div class="sia-badge-fit" style="background:${fitColor(fit)}">${fitLabel}</div>
      <div class="sia-badge-risk" style="background:${riskColor(ghost.risk)}"
           title="Ghost-job risk: ${ghost.risk}">👻 ${ghost.risk}</div>
    `;
    document.body.appendChild(badge);

    // Panel (hidden until badge clicked).
    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.style.display = "none";

    const resumeWarning = hasResume
      ? ""
      : `<div class="sia-warning">No resume saved yet. Click the extension icon and paste your resume to get a real fit score.</div>`;

    const missingHtml = missing.length
      ? missing.map(chip).join("")
      : `<span class="sia-muted">None — you cover the listed skills 🎉</span>`;

    const matchedHtml = matched.length
      ? matched.map(chip).join("")
      : `<span class="sia-muted">No overlap detected</span>`;

    const flagsHtml = ghost.flags.length
      ? ghost.flags
          .map(
            (f) => `<li class="sia-flag sia-${f.level}">
              <strong>${escapeHtml(f.label)}</strong>
              <span>${escapeHtml(f.detail)}</span>
            </li>`
          )
          .join("")
      : `<li class="sia-muted">No ghost-job flags detected.</li>`;

    panel.innerHTML = `
      <div class="sia-header">
        <span>Should I Apply?</span>
        <button id="sia-close" aria-label="Close">×</button>
      </div>
      ${resumeWarning}
      <div class="sia-section">
        <div class="sia-score" style="color:${fitColor(fit)}">
          ${fit === null ? "Fit: n/a" : `Fit: ${fit}%`}
        </div>
      </div>
      <div class="sia-section">
        <h4>Missing skills</h4>
        <div class="sia-chips">${missingHtml}</div>
      </div>
      <div class="sia-section">
        <h4>You match</h4>
        <div class="sia-chips">${matchedHtml}</div>
      </div>
      <div class="sia-section">
        <h4>Ghost-job risk: <span style="color:${riskColor(ghost.risk)}">${ghost.risk}</span></h4>
        <ul class="sia-flags">${flagsHtml}</ul>
      </div>
      <div class="sia-actions">
        <button id="sia-save">☆ Save this job</button>
        <button id="sia-copy">Copy missing skills</button>
      </div>
      <div class="sia-footnote">Runs entirely in your browser. Your resume never leaves this device.</div>
    `;
    document.body.appendChild(panel);

    badge.addEventListener("click", () => {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    });
    panel.querySelector("#sia-close").addEventListener("click", () => {
      panel.style.display = "none";
    });
    panel.querySelector("#sia-save").addEventListener("click", (e) => {
      saveJob({
        url: location.href,
        title: analysis.title,
        site: analysis.site,
        fit,
        risk: ghost.risk,
        savedAt: new Date().toISOString(),
      });
      e.target.textContent = "★ Saved";
      e.target.disabled = true;
    });
    panel.querySelector("#sia-copy").addEventListener("click", (e) => {
      navigator.clipboard.writeText(missing.join(", "));
      e.target.textContent = "Copied!";
      setTimeout(() => (e.target.textContent = "Copy missing skills"), 1500);
    });
  }

  async function run() {
    const page = SIA_SITES.detect();
    if (!page.description || page.description.length < 80) return; // not a job page

    const resumeText = await getResume();
    const scored = SIA_SKILLS.score(resumeText, page.description);
    const ghost = SIA_GHOST.check(page);

    render({
      ...page,
      fit: scored.fit,
      matched: scored.matched,
      missing: scored.missing,
      ghost,
      hasResume: Boolean(resumeText),
    });
  }

  // Job sites are SPAs — re-run when the URL changes.
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(run, 800);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(run, 1000);
})();
