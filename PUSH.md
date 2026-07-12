# How to push this to GitHub (5 minutes)

The repo is already a git repository with a clean commit history (one commit per
MVP story). You just need to point it at your GitHub account and push.

## Option A — with GitHub CLI (recommended, also creates the storyboard)

```bash
# 1. Install + auth (one time)
brew install gh
gh auth login

# 2. From inside this folder, create the repo + push + generate all issues
chmod +x scripts/setup-github.sh
./scripts/setup-github.sh <your-github-username>
```

That creates a public repo, pushes your code, and files every story from
`STORIES.md` as a GitHub Issue. Done.

## Option B — plain git (no CLI)

```bash
# 1. Create an EMPTY repo on github.com named "should-i-apply" (no README).
# 2. Then:
git remote add origin https://github.com/<your-username>/should-i-apply.git
git branch -M main
git push -u origin main
```

Add the issues manually from `STORIES.md` under the repo's Issues tab.

## The daily PR-per-story workflow (this is the productivity signal)

```bash
git checkout main && git pull
git checkout -b sia-7-indeed-selectors     # branch per story
# ...make the change...
git add -A && git commit -m "SIA-7: add Indeed JD selectors"
git push -u origin sia-7-indeed-selectors
gh pr create --fill --base main            # opens the PR (Closes #7 in the body)
gh pr merge --squash --delete-branch       # merge when ready
```

One story → one branch → one PR → closes one issue. Do one most days and your
GitHub graph tells a real story: shipping features, not padding a streak.

## Verify the extension loads

1. `chrome://extensions` → enable **Developer mode**
2. **Load unpacked** → select this folder
3. Click the icon, paste a resume, then open a LinkedIn job posting.
