/**
 * @typedef {Object} CoverageData
 * @property {Object} meta - Metadata about the coverage
 * @property {Object} totals - Total coverage statistics
 * @property {number} totals.covered_lines - Number of covered lines
 * @property {number} totals.num_statements - Total number of statements
 * @property {number} totals.covered_branches - Number of covered branches
 * @property {number} totals.num_branches - Total number of branches
 */

import fs from "fs";

// @ts-check
/** @param {import('@actions/github-script').AsyncFunctionArguments} AsyncFunctionArguments */
export default async ({github, core, context}) => {
    try {
        const prCoveragePath = '/tmp/coverage/pr-coverage.json';
        const developCoveragePath = '/tmp/coverage/develop-coverage.json';

        /** @type {CoverageData} */
        const prCoverage = JSON.parse(fs.readFileSync(prCoveragePath, 'utf8'));
        /** @type {CoverageData} */
        const developCoverage = JSON.parse(fs.readFileSync(developCoveragePath, 'utf8'));

        // Calculate line and branch rates
        const prLineRate = prCoverage.totals.covered_lines / prCoverage.totals.num_statements;
        const developLineRate = developCoverage.totals.covered_lines / developCoverage.totals.num_statements;
        const prBranchRate = prCoverage.totals.covered_branches / prCoverage.totals.num_branches;
        const developBranchRate = developCoverage.totals.covered_branches / developCoverage.totals.num_branches;

        // Convert to percentages
        const formatPercent = (value) => (value * 100).toFixed(2);
        const prLinePercent = formatPercent(prLineRate);
        const developLinePercent = formatPercent(developLineRate);
        const prBranchPercent = formatPercent(prBranchRate);
        const developBranchPercent = formatPercent(developBranchRate);

        // Calculate differences
        const lineDiff = (prLineRate - developLineRate) * 100;
        const branchDiff = (prBranchRate - developBranchRate) * 100;

        // Log values
        core.debug(`PR Line Coverage: ${prLinePercent}%`);
        core.debug(`Develop Line Coverage: ${developLinePercent}%`);
        core.debug(`Line Coverage Diff: ${lineDiff.toFixed(2)}%`);
        core.debug(`PR Branch Coverage: ${prBranchPercent}%`);
        core.debug(`Develop Branch Coverage: ${developBranchPercent}%`);
        core.debug(`Branch Coverage Diff: ${branchDiff.toFixed(2)}%`);

        let status = 'unchanged';
        if (lineDiff > 0 || branchDiff > 0) {
            status = 'increased';
        } else if (lineDiff < 0 || branchDiff < 0) {
            status = 'decreased';
        }

        // Format status icons
        const lineStatus = lineDiff > 0 ? '🟢 Increased' : lineDiff < 0 ? '🔴 Decreased' : '⚪ Unchanged';
        const branchStatus = branchDiff > 0 ? '🟢 Increased' : branchDiff < 0 ? '🔴 Decreased' : '⚪ Unchanged';

        // Create comment message
        let message =
            `
## Code Coverage ${status === 'increased' ? '🎉' : status === 'decreased' ? '⚠️' : '🔄'}\n\n
| Type | PR | Develop | Change | Status |
|------|------|---------|--------|--------|
| Line Coverage | ${prLinePercent}% | ${developLinePercent}% | ${Math.abs(lineDiff).toFixed(2)}% | ${lineStatus} |
| Branch Coverage | ${prBranchPercent}% | ${developBranchPercent}% | ${Math.abs(branchDiff).toFixed(2)}% | ${branchStatus} |`;

        // Find and delete previous coverage comments
        const {data: comments} = await github.rest.issues.listComments({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number
        });

        const botComments = comments.filter(comment =>
            comment.user.login === 'github-actions[bot]' &&
            comment.body.startsWith('## Code Coverage')
        );

        // Delete each previous coverage comment
        for (const comment of botComments) {
            await github.rest.issues.deleteComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: comment.id
            });
            core.debug(`Deleted previous coverage comment with ID ${comment.id}`);
        }

        // Post the new comment if there are changes
        if (lineDiff !== 0 || branchDiff !== 0) {
            await github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: message.trim()
            });
            core.info('Posted new coverage comment');
        } else {
            core.info('No changes in coverage. Skipping comment.');
        }
    } catch (error) {
        core.setFailed(`Code coverage failed: ${error.message}`);
    }
}