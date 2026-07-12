# Should I Apply? 🕵️

A Chrome extension that reads the job posting you're already looking at and answers one question: **should I apply to this?**

- **Fit score + skill gap** — how well your resume matches, and exactly which skills you're missing.
- **Ghost-job flags** — signals that a posting may be fake, stale, or a resume black-hole.

Everything runs **client-side**. Your resume never leaves your browser — no scraping, no backend, no account.

![status](https://img.shields.io/badge/status-MVP-blue) ![manifest](https://img.shields.io/badge/manifest-v3-green) ![license](https://img.shields.io/badge/license-MIT-lightgrey)

## Why

Autofill (Simplify), tracking (Huntr, Teal), and resume optimization (Jobscan) are all solved. What isn't: telling you, on the posting in front of you, *whether it's worth your time* and *what you'd need to learn to be a fit*. That's this.

## How it works

1. Paste your resume once (stored in `chrome.storage.local`).
2. Browse LinkedIn / Indeed / Greenhouse / Lever / Ashby as usual.
3. A badge appears on each posting: fit % + ghost-risk. Click it for the breakdown — matched skills, missing skills, and the specific red flags found on the page.

No page is ever sent anywhere. The extension only reads the DOM of the tab you opened yourself.

## Install (dev)

1. `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select this folder
4. Click the icon, paste your resume, then open any job posting.

## Architecture

| File | Job |
|------|-----|
| `lib/sites.js` | Extract JD text + metadata per job board (with a generic fallback) |
| `lib/skills.js` | Resume↔JD skill matching + fit score |
| `lib/ghost.js` | Heuristic ghost-job flags |
| `content.js` | Orchestrates analysis + injects the badge/panel |
| `popup.*` | Resume input, skill preview, saved jobs |

## Roadmap

- [ ] Semantic matching (embeddings) instead of keyword overlap
- [ ] Crowd-sourced ghost-job outcome dataset (opt-in) — the real moat
- [ ] LLM skill-gap → learning roadmap (bring-your-own-key)
- [ ] Cross-board coverage (Indeed, Greenhouse, Lever, Ashby, Workday)
- [ ] Saved-jobs page + CSV export

See [`STORIES.md`](./STORIES.md) for the full backlog. Each story ships as its own PR.

## Privacy

Zero data leaves your device. No analytics, no servers, no account. The only storage is Chrome's local storage on your machine.

## License

MIT
