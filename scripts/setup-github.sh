#!/usr/bin/env bash
# setup-github.sh — creates the GitHub repo, issues (the "storyboard"), labels,
# and a project board from STORIES.md. Requires the GitHub CLI (`gh`) authed:
#   brew install gh && gh auth login
#
# Usage:
#   ./scripts/setup-github.sh <your-github-username> [repo-name]
#
# Safe to re-run: issue creation is idempotent-ish (it will create duplicates if
# run twice, so only run the issue block once).

set -euo pipefail

USER="${1:?Usage: setup-github.sh <github-username> [repo-name]}"
REPO="${2:-should-i-apply}"

echo "==> Creating repo ${USER}/${REPO} (public) and pushing current code..."
gh repo create "${USER}/${REPO}" --public --source=. --remote=origin --push

echo "==> Creating labels..."
gh label create "epic:mvp"          --color 0e8a16 --force
gh label create "epic:trust"        --color 1d76db --force
gh label create "epic:differentiator" --color 5319e7 --force
gh label create "epic:ops"          --color fbca04 --force

# --- Issues (the storyboard) -------------------------------------------------
# Format: create_issue "TITLE" "BODY" "LABEL"
create_issue () {
  gh issue create --title "$1" --body "$2" --label "$3" >/dev/null
  echo "  + $1"
}

echo "==> Creating issues..."
create_issue "SIA-7: Indeed JD selectors"            "Add per-site selectors for Indeed job pages in lib/sites.js." "epic:trust"
create_issue "SIA-8: Greenhouse JD selectors"        "Add per-site selectors for boards.greenhouse.io." "epic:trust"
create_issue "SIA-9: Lever JD selectors"             "Add per-site selectors for jobs.lever.co." "epic:trust"
create_issue "SIA-10: Ashby + Workday selectors"     "Extend site coverage to Ashby and Workday." "epic:trust"
create_issue "SIA-11: Synonym expansion"             "Grow the skill dictionary + alias coverage in lib/skills.js." "epic:trust"
create_issue "SIA-12: Weight skills by JD frequency" "Skills mentioned repeatedly should count more toward the fit score." "epic:trust"
create_issue "SIA-13: Saved-jobs page"               "A page listing saved jobs with delete. Open from the popup." "epic:trust"
create_issue "SIA-14: Export saved jobs to CSV"      "Download saved jobs as CSV." "epic:trust"
create_issue "SIA-15: Unit tests + CI"               "Jest tests for the matcher; run on push via GitHub Actions." "epic:trust"
create_issue "SIA-16: Opt-in outcome reporting"      "Let users report 'applied, no reply in 30 days' to seed the ghost dataset." "epic:differentiator"
create_issue "SIA-17: Semantic matching (embeddings)" "Replace keyword overlap with embedding similarity." "epic:differentiator"
create_issue "SIA-18: LLM skill-gap → roadmap"       "Bring-your-own-key: generate an ordered learning plan for missing skills." "epic:differentiator"
create_issue "SIA-19: Embedded AI actions"           "'Explain this gap' + 'rewrite bullet for this JD' one-click actions." "epic:differentiator"
create_issue "SIA-20: Options page"                  "Configurable thresholds + dark mode." "epic:differentiator"
create_issue "SIA-21: Daily internal ops agent"      "Scheduled digest of new issues + user feedback + suggested fixes." "epic:ops"

echo "==> Done. View issues: gh issue list"
echo "    Optional project board: gh project create --owner ${USER} --title 'Should I Apply?'"
