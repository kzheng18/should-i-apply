// popup.js — resume input, skill preview, saved-jobs list.

const resumeEl = document.getElementById("resume");
const statusEl = document.getElementById("status");
const skillsEl = document.getElementById("skills");
const savedWrap = document.getElementById("savedWrap");
const savedList = document.getElementById("savedList");

function renderSkills(text) {
  const skills = Array.from(SIA_SKILLS.extract(text)).sort();
  skillsEl.textContent = skills.length
    ? `Detected skills: ${skills.join(", ")}`
    : "No known skills detected yet — add more detail.";
}

function renderSaved(jobs) {
  if (!jobs || !jobs.length) {
    savedWrap.style.display = "none";
    return;
  }
  savedWrap.style.display = "block";
  savedList.innerHTML = jobs
    .slice(0, 8)
    .map(
      (j) =>
        `<div class="job"><a href="${j.url}" target="_blank" rel="noopener">${
          (j.title || j.url).slice(0, 44)
        }</a> — fit ${j.fit ?? "?"}%, ${j.risk} risk</div>`
    )
    .join("");
}

// Load existing state.
chrome.storage.local.get(["resumeText", "savedJobs"], (r) => {
  if (r.resumeText) {
    resumeEl.value = r.resumeText;
    renderSkills(r.resumeText);
  }
  renderSaved(r.savedJobs);
});

resumeEl.addEventListener("input", () => renderSkills(resumeEl.value));

document.getElementById("save").addEventListener("click", () => {
  const text = resumeEl.value.trim();
  chrome.storage.local.set({ resumeText: text }, () => {
    statusEl.textContent = "Saved ✓ Reopen a job posting to see your fit score.";
    setTimeout(() => (statusEl.textContent = ""), 2500);
  });
});
