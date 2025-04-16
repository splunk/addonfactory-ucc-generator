import fs from "fs";

const readJson = (filePath) => {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      throw new Error(`Failed to read or parse JSON at ${filePath}: ${e.message}`);
    }
  };
  

const getTotals = (rawData) => {
  let totalLineCovered = 0;
  let totalLineTotal = 0;
  let totalBranchCovered = 0;
  let totalBranchTotal = 0;

  for (const [filename, data] of Object.entries(rawData)) {
    const lineData = data.lines;
    const branchData = data.branches;
    const linePct =
      lineData.total === 0 ? 100 : (lineData.covered / lineData.total) * 100;
    const branchPct =
      branchData.total === 0
        ? 100
        : (branchData.covered / branchData.total) * 100;

    totalLineCovered += lineData.covered;
    totalLineTotal += lineData.total;

    totalBranchCovered += branchData.covered;
    totalBranchTotal += branchData.total;
  }

  const totalLinePct =
    totalLineTotal === 0 ? 100 : (totalLineCovered / totalLineTotal) * 100;
  const totalBranchPct =
    totalBranchTotal === 0
      ? 100
      : (totalBranchCovered / totalBranchTotal) * 100;

  core.info("📊 Total Coverage Summary");
  core.info("--------------------------");
  core.info(`✅ Line Coverage:   ${totalLinePct.toFixed(2)}%`);
  core.info(`✅ Branch Coverage: ${totalBranchPct.toFixed(2)}%`);
  return [totalLinePct, totalBranchPct];
};

/**
 * @param {import('@actions/github-script').AsyncFunctionArguments} args
 */
export default async ({ github, context, core }) => {
  const prCoveragePath = "/tmp/pr-coverage.json";
  const developCoveragePath = "/tmp/develop-coverage.json";

  // const developCoveragePath = '../../ui/coverage/coverage-summary.json';
  // const prCoveragePath = '../../ui/coverage/coverage-summary.json';

  // const prCoverage = JSON.parse(fs.readFileSync('/tmp/pr-coverage.json', 'utf8'));
  // const devCoverage = JSON.parse(fs.readFileSync('/tmp/develop-coverage.json', 'utf8'));

  const developCoverage = readJson(developCoveragePath);
  const prCoverage = readJson(prCoveragePath);

  const [prLinePct, prBranchPct] = getTotals(prCoverage);
  const [developLinePct, developBranchPct] = getTotals(developCoverage);

  const lineDiff = prLinePct - developLinePct;
  const branchDiff = prBranchPct - developBranchPct;

  let status = "unchanged";
  if (lineDiff > 0 || branchDiff > 0) {
    status = "increased";
  } else if (lineDiff < 0 || branchDiff < 0) {
    status = "decreased";
  }

  const lineStatus =
    lineDiff > 0
      ? "🟢 Increased"
      : lineDiff < 0
      ? "🔴 Decreased"
      : "⚪ Unchanged";
  const branchStatus =
    branchDiff > 0
      ? "🟢 Increased"
      : branchDiff < 0
      ? "🔴 Decreased"
      : "⚪ Unchanged";

    const message = `
    ## 🧪 Frontend Code Coverage Report ${status === 'increased' ? '🎉' : status === 'decreased' ? '⚠️' : '🔄'}\n\n
    
    | Metric | PR | Base (develop) | Change | Status |
    |--------|----|----------------|--------|--------|
    | Line Coverage | ${prLinePct.toFixed(2)}% | ${developLinePct.toFixed(2)}% | ${lineDiff.toFixed(2)}% | ${lineStatus} |
    | Branch Coverage | ${prBranchPct.toFixed(2)}% | ${developBranchPct.toFixed(2)}% | ${branchDiff.toFixed(2)}% | ${branchStatus} |
    `;

  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  });

  const oldComment = comments.find(
    (c) =>
      c.user.login === "github-actions[bot]" &&
      c.body.startsWith("## 🧪 Frontend Code Coverage Report")
  );

  if (oldComment) {
    await github.rest.issues.deleteComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: oldComment.id,
    });
  }

  await github.rest.issues.createComment({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    body: message.trim(),
  });

  if (lineDiff < 0 || branchDiff < 0) {
    core.setFailed("Coverage has decreased. Please improve test coverage.");
  }
};
