// lib/skills.js
// Resume <-> job-description skill matching. v1 is transparent keyword matching
// with a synonym map. v2 (see roadmap) swaps this for semantic embeddings.

const SIA_SKILLS = (() => {
  // A curated dictionary. Each canonical skill maps to its aliases/synonyms.
  // Matching is case-insensitive and word-boundary aware.
  const DICTIONARY = {
    javascript: ["javascript", "js", "es6", "ecmascript"],
    typescript: ["typescript", "ts"],
    react: ["react", "react.js", "reactjs"],
    "next.js": ["next.js", "nextjs", "next js"],
    vue: ["vue", "vue.js", "vuejs"],
    angular: ["angular", "angular.js", "angularjs"],
    node: ["node", "node.js", "nodejs"],
    python: ["python", "py"],
    java: ["java"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "c sharp", "csharp", ".net", "dotnet"],
    go: ["golang", "go lang"],
    rust: ["rust"],
    ruby: ["ruby", "rails", "ruby on rails"],
    php: ["php", "laravel"],
    sql: ["sql", "mysql", "postgres", "postgresql", "sqlite"],
    nosql: ["nosql", "mongodb", "mongo", "dynamodb", "cassandra"],
    graphql: ["graphql"],
    rest: ["rest", "rest api", "restful"],
    aws: ["aws", "amazon web services", "ec2", "s3", "lambda"],
    gcp: ["gcp", "google cloud"],
    azure: ["azure"],
    docker: ["docker", "containers"],
    kubernetes: ["kubernetes", "k8s"],
    "ci/cd": ["ci/cd", "ci cd", "continuous integration", "github actions", "jenkins"],
    terraform: ["terraform", "infrastructure as code", "iac"],
    git: ["git", "github", "gitlab", "version control"],
    redux: ["redux"],
    tailwind: ["tailwind", "tailwindcss"],
    css: ["css", "css3", "sass", "scss"],
    html: ["html", "html5"],
    testing: ["testing", "jest", "cypress", "playwright", "unit test", "unit tests", "tdd"],
    spark: ["spark", "apache spark", "pyspark"],
    dbt: ["dbt"],
    airflow: ["airflow"],
    pandas: ["pandas"],
    "machine learning": ["machine learning", "ml", "scikit-learn", "sklearn"],
    "deep learning": ["deep learning", "pytorch", "tensorflow", "keras"],
    "data engineering": ["data engineering", "etl", "data pipeline", "data pipelines"],
    "system design": ["system design", "distributed systems", "microservices", "scalability"],
    agile: ["agile", "scrum", "kanban"],
    "rest api": ["api design", "api development"],
  };

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Returns the set of canonical skills present in a blob of text.
  function extract(text) {
    const found = new Set();
    if (!text) return found;
    const lower = text.toLowerCase();
    for (const [canonical, aliases] of Object.entries(DICTIONARY)) {
      for (const alias of aliases) {
        const re = new RegExp(`(^|[^a-z0-9+#.])${escapeRegex(alias)}([^a-z0-9+#.]|$)`, "i");
        if (re.test(lower)) {
          found.add(canonical);
          break;
        }
      }
    }
    return found;
  }

  // Compare resume skills against JD skills.
  function score(resumeText, jdText) {
    const resumeSkills = extract(resumeText);
    const jdSkills = extract(jdText);

    const matched = [];
    const missing = [];
    for (const skill of jdSkills) {
      if (resumeSkills.has(skill)) matched.push(skill);
      else missing.push(skill);
    }

    // Fit % = share of the JD's required skills you already have.
    // If the JD lists no recognizable skills, fall back to a neutral score.
    const denom = jdSkills.size;
    const fit = denom === 0 ? null : Math.round((matched.length / denom) * 100);

    return {
      fit, // 0-100 or null when undeterminable
      matched: matched.sort(),
      missing: missing.sort(),
      jdSkillCount: denom,
      resumeSkillCount: resumeSkills.size,
    };
  }

  return { extract, score, DICTIONARY };
})();
