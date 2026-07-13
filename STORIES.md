# Storyboard / Backlog

Each story is a GitHub Issue and ships as its own PR that closes the issue.
Run `scripts/setup-github.sh` after creating the repo to generate all of these
as real issues on a "Should I Apply?" project board.

## Epic 1 — MVP (done in the initial scaffold)

- **SIA-1 · Scaffold + MV3 manifest** — folder structure, manifest, README.
- **SIA-2 · Resume input + local storage** — popup to paste resume; save to `chrome.storage.local`.
- **SIA-3 · JD extraction (LinkedIn + generic)** — pull description text off the page.
- **SIA-4 · Fit score + missing skills** — keyword/synonym matching → fit %, matched/missing.
- **SIA-5 · Ghost-job heuristics** — reposts, applicant volume, no comp, buzzwords, thin post.
- **SIA-6 · Panel UI + save jobs** — floating badge + breakdown panel; save scored jobs.

## Epic 2 — Trust & coverage (one PR each)

- **SIA-7 · Indeed selectors**
- **SIA-8 · Greenhouse selectors**
- **SIA-9 · Lever selectors**
- **SIA-10 · Ashby + Workday selectors**
- **SIA-11 · Synonym expansion in skill dictionary**
- **SIA-12 · Weight skills by frequency in the JD**
- **SIA-13 · Saved-jobs page (list + delete)**
- **SIA-14 · Export saved jobs to CSV**
- **SIA-15 · Unit tests for the matcher (CI via GitHub Actions)**
- **SIA-22 · Upload resume (.pdf / .txt) instead of pasting** — client-side PDF text extraction via vendored pdf.js. ✅ done (PR)

## Epic 3 — The differentiator

- **SIA-16 · Opt-in outcome reporting** ("applied, no reply in 30 days") — seeds the ghost dataset.
- **SIA-17 · Semantic matching via embeddings**
- **SIA-18 · Bring-your-own-key LLM: skill-gap → learning roadmap**
- **SIA-19 · Embedded AI actions: "explain this gap", "rewrite bullet for this JD"**
- **SIA-20 · Options page: thresholds + dark mode**

## Epic 4 — Ops (Phase 2)

- **SIA-21 · Daily internal ops agent** — scheduled digest of new issues + user feedback + suggested fixes.

---

### Workflow for every story

```bash
git checkout main && git pull
git checkout -b sia-7-indeed-selectors
# ... make the change ...
git add -A && git commit -m "SIA-7: add Indeed JD selectors"
git push -u origin sia-7-indeed-selectors
gh pr create --fill --base main        # opens the PR
# review, then:
gh pr merge --squash --delete-branch
```

One story per branch, one PR per story, each PR closes its issue (`Closes #7`).
That's a clean, recruiter-legible history — not streak-farming.
