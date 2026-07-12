// test/run-tests.js
// Zero-dependency test runner. Concatenates the browser lib files with the test
// assertions into a single script so their top-level `const`s share scope, then
// runs it. Run: `node test/run-tests.js`

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const libs = ["lib/skills.js", "lib/ghost.js"]
  .map((f) => fs.readFileSync(path.join(root, f), "utf8"))
  .join("\n");

const tests = `
let passed = 0, failed = 0;
function assert(name, cond) {
  if (cond) { passed++; console.log("  \\u2713 " + name); }
  else { failed++; console.error("  \\u2717 " + name); }
}

console.log("skills.extract");
{
  const s = SIA_SKILLS.extract("Experienced with React, Node.js and Postgres");
  assert("finds react", s.has("react"));
  assert("finds node", s.has("node"));
  assert("maps postgres -> sql", s.has("sql"));
  assert("does not hallucinate rust", !s.has("rust"));
}

console.log("skills.score");
{
  const resume = "Frontend engineer skilled in JavaScript, React and CSS.";
  const jd = "We need React, TypeScript and GraphQL experience.";
  const r = SIA_SKILLS.score(resume, jd);
  assert("fit is a number 0-100", r.fit >= 0 && r.fit <= 100);
  assert("react counted as matched", r.matched.includes("react"));
  assert("typescript counted as missing", r.missing.includes("typescript"));
  assert("graphql counted as missing", r.missing.includes("graphql"));
}

console.log("skills.score handles empty JD");
{
  const r = SIA_SKILLS.score("React dev", "We value passion and grit.");
  assert("null fit when no skills in JD", r.fit === null);
}

console.log("ghost.check flags a bad post");
{
  const r = SIA_GHOST.check({
    description: "Rockstar ninja wanted. Fast-paced environment.",
    pageText: "1,200 applicants. Reposted 3 weeks ago.",
  });
  assert("returns a risk level", ["low","medium","high"].includes(r.risk));
  assert("flags something", r.flags.length > 0);
  assert("flags no comp", r.flags.some((f) => /compensation/i.test(f.label)));
}

console.log("ghost.check clean post");
{
  const r = SIA_GHOST.check({
    description: "We are hiring a backend engineer to join our platform team. Salary range $150,000-$180,000 per year plus equity and benefits. You will design and build scalable services, own features end to end, collaborate closely with product and design, participate in on-call rotation, review pull requests, and mentor junior engineers as the team grows. Requirements: 4+ years of experience building production backend systems, strong SQL, and familiarity with distributed systems. Nice to have: experience with our stack and a track record of shipping reliable software at scale.",
    pageText: "12 applicants",
  });
  assert("clean post is low risk", r.risk === "low");
}

console.log("\\n" + passed + " passed, " + failed + " failed");
if (failed) throw new Error("tests failed");
`;

try {
  vm.runInNewContext(libs + tests, { console });
  process.exit(0);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
