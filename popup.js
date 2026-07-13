// popup.js — resume upload/paste, skill preview, saved-jobs list.

const resumeEl = document.getElementById("resume");
const statusEl = document.getElementById("status");
const skillsEl = document.getElementById("skills");
const savedWrap = document.getElementById("savedWrap");
const savedList = document.getElementById("savedList");
const fileEl = document.getElementById("file");
const uploadLabel = document.getElementById("uploadLabel");

// pdf.js worker (loaded from the extension's own package — same origin, no CDN).
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("vendor/pdf.worker.min.js");
}

function setStatus(msg, isError) {
  statusEl.textContent = msg;
  statusEl.classList.toggle("err", Boolean(isError));
}

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

// ---- File upload -> text --------------------------------------------------

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsText(file);
  });
}

async function readPdfFile(file) {
  if (!window.pdfjsLib) throw new Error("PDF support failed to load");
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let out = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    out += content.items.map((i) => i.str).join(" ") + "\n";
  }
  return out.trim();
}

async function handleFile(file) {
  if (!file) return;
  const name = file.name.toLowerCase();
  uploadLabel.textContent = `Reading ${file.name}…`;
  try {
    let text = "";
    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      text = await readPdfFile(file);
    } else if (name.endsWith(".txt") || file.type === "text/plain") {
      text = await readTextFile(file);
    } else {
      throw new Error("Unsupported file — use a .pdf or .txt");
    }

    if (!text || text.length < 20) {
      throw new Error("Couldn't extract text (is the PDF scanned/image-only?)");
    }

    resumeEl.value = text;
    renderSkills(text);
    uploadLabel.textContent = `✓ Loaded ${file.name}`;
    setStatus("Resume extracted. Review it, then Save.");
  } catch (e) {
    uploadLabel.textContent = "⬆︎ Upload resume (.pdf or .txt)";
    setStatus(e.message || "Upload failed", true);
  }
}

fileEl.addEventListener("change", (e) => handleFile(e.target.files[0]));

// Drag-and-drop onto the dropzone.
const dropzone = document.getElementById("dropzone");
["dragover", "dragenter"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.style.background = "#eef2ff";
  })
);
["dragleave", "drop"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.style.background = "";
  })
);
dropzone.addEventListener("drop", (e) => {
  if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

// ---- Load existing state --------------------------------------------------

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
    setStatus("Saved ✓ Reopen a job posting to see your fit score.");
    setTimeout(() => setStatus(""), 2500);
  });
});
