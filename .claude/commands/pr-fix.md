# PR Fix

Fix issues identified in PR reviews using the Principal Architect + SDE2 agents.

## Agents Used

| Agent                                                   | Purpose                              |
| ------------------------------------------------------- | ------------------------------------ |
| [Principal Architect](../agents/principal-architect.md) | Root cause analysis of review issues |
| [SDE2](../agents/sde2.md)                               | Fix the approved issues              |

## Required Input

- **PR Number**: $ARGUMENTS (e.g., `8`)

If no PR number provided, ask the user for it.

## Flow

```
┌─────────────────────────────────────────┐
│             /pr-fix 8                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│            Fetch PR Reviews             │
│  • Get PR details                       │
│  • Get review comments                  │
│  • Get inline comments                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│        Show Raw Issues to User          │
│  • List raw reviewer comments as-is     │
│  • No interpretation yet                │
│  • Blocking vs minor categorization     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Spawn Principal Architect Agent      │
│  • Read the actual code/files           │
│  • Research root causes                 │
│  • Propose fixes (may differ from       │
│    reviewer's suggestion)               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Show Architect's Analysis to User     │
│  • Root cause per issue                 │
│  • Proposed fix (with rationale)        │
│  • WAIT for approval / adjustments      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          Spawn SDE2 Agent               │
│  • Pass architect's approved plan       │
│  • Agent executes pr-fix skill          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          SDE2 Executes pr-fix           │
│  • Fix all issues autonomously          │
│  • Blocking first, then minor           │
│  • Verify fixes                         │
└─────────────────────────────────────────┘
```

## Execution

### Phase 1: Gather Review Context

1. **Fetch PR details:**

   ```bash
   gh pr view {pr_number} --json number,title,body,headRefName,baseRefName,author,url
   ```

2. **Extract GitHub issue** from PR body (`Closes #123`)

3. **Get all review feedback:**

   ```bash
   gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews
   gh api repos/{owner}/{repo}/pulls/{pr_number}/comments
   ```

4. **Get changed files:**
   ```bash
   gh pr diff {pr_number}
   ```

### Phase 2: Show Raw Issues

Present the reviewer's comments verbatim — no interpretation, no proposed fixes yet:

```markdown
## Raw Review Comments: #{pr_number} — {title}

### Blocking Issues ❌

1. `{file:line}` — "{exact reviewer comment}"
2. `{file:line}` — "{exact reviewer comment}"

### Minor Issues ⚠️

1. `{file:line}` — "{exact reviewer comment}"

---

Running Principal Architect analysis to understand root causes...
```

Do NOT wait for user input here — immediately proceed to Phase 3.

### Phase 3: Spawn Principal Architect Agent

**IMPORTANT: You MUST use the Agent tool to spawn the Principal Architect agent. Do NOT analyze yourself.**

```
Agent(
  subagent_type: "principal-architect",
  description: "Root cause analysis of PR review issues",
  prompt: """
  Analyze the root causes of review issues flagged on PR #{pr_number}. Do NOT blindly accept
  the reviewer's suggested fix — read the actual code, understand the context, and propose
  the correct fix from first principles.

  ## PR Details
  - Title: {pr_title}
  - Branch: {branch_name}
  - Changed files: {list of files changed in PR}

  ## Raw Review Issues

  ### Blocking Issues ❌
  {list of blocking issues with file:line and exact reviewer comment}

  ### Minor Issues ⚠️
  {list of minor issues with file:line and exact reviewer comment}

  ## Your Task

  For EACH issue:
  1. Read the relevant file(s) and surrounding code context
  2. Understand what the reviewer is pointing at
  3. Identify the true root cause — is it the line they flagged, or something deeper?
  4. Propose the correct fix — this may agree with, improve upon, or differ from the reviewer's suggestion
  5. Explain your reasoning briefly

  ## Output Format

  Return a structured analysis for each issue:

  ### Issue 1: {file:line}
  **Reviewer comment:** "{exact comment}"
  **Root cause:** {your analysis of what's actually wrong}
  **Proposed fix:** {what should actually be done, with code if helpful}
  **Rationale:** {why this fix, not the reviewer's if different}

  Be direct. If the reviewer is right, say so. If their suggestion is a patch over a deeper
  problem, say so. If a different file is the real source of the issue, say so.
  Research the codebase as needed — read files, grep for patterns, understand dependencies.
  """
)
```

### Phase 4: Show Architect's Analysis

Present the architect's findings to the user:

```markdown
## Architect's Analysis: #{pr_number} — {title}

{architect output, issue by issue}

---

Does this analysis look right? Should I adjust any proposed fixes before handing off to SDE2?
```

**WAIT for user approval.** The user may:

- Approve the plan as-is
- Override specific fixes (use their version)
- Skip certain issues entirely

Update the plan based on user feedback before proceeding.

### Phase 5: Spawn SDE2 Agent

**IMPORTANT: You MUST use the Agent tool to spawn the SDE2 agent. Do NOT execute the skill yourself.**

```
Agent(
  subagent_type: "sde2",
  description: "Fix PR review issues",
  prompt: """
  Fix issues identified in PR #{pr_number} review. Fix all issues autonomously without waiting
  for user input between fixes. Use the architect's approved analysis — not the raw reviewer
  comments — as your guide.

  ## PR Details
  - Title: {pr_title}
  - Branch: {branch_name}
  - GitHub Issue: #{issue_number}

  ## Approved Fix Plan (from Principal Architect analysis)

  ### Blocking Issues (❌) — fix first
  {list: file:line | root cause | approved fix}

  ### Minor Issues (⚠️) — fix after blocking
  {list: file:line | root cause | approved fix}

  ## Changed Files
  {list of files changed in PR}

  ## Instructions
  1. Load appropriate rules based on changed files
  2. Fix all blocking issues first, then all minor issues
  3. Follow the architect's proposed fix — not the reviewer's raw comment
  4. Fix issues one at a time but do NOT stop for user confirmation between fixes
  5. Only pause if a fix is genuinely ambiguous or requires a new architectural decision
  6. Verify all fixes with typecheck and lint at the end
  7. Return a complete summary of everything fixed
  """
)
```

The SDE2 agent will:

- Fix all issues autonomously (blocking first, then minor)
- Follow the architect-approved plan, not raw reviewer comments
- Only pause if a fix is ambiguous or requires a new architectural decision
- Verify all fixes with typecheck/lint at the end

### Phase 6: Report Completion

After all fixes are complete, output:

```markdown
## ✅ PR Fixes Complete

### PR: #{pr_number} - {title}

### Issues Addressed

| Issue         | File        | Architect Fix | Status   |
| ------------- | ----------- | ------------- | -------- |
| {description} | `file:line` | {fix applied} | ✅ Fixed |

### Changes Made

| File           | Change        |
| -------------- | ------------- |
| `path/to/file` | {description} |

### Verification

- [ ] TypeScript: ✅
- [ ] Lint: ✅
- [ ] Tests: ✅
- [ ] All comments addressed: ✅

### Next Steps

1. Review the fixes
2. Commit and push changes
3. Request re-review if needed
```

## Issue Priority

The SDE2 agent fixes issues in this order:

| Priority | Type        | Indicators                          |
| -------- | ----------- | ----------------------------------- |
| 1st      | Blocking ❌ | "must", "required", REQUEST_CHANGES |
| 2nd      | Minor ⚠️    | "consider", "suggestion", "nit"     |

## Error Handling

| Error                             | Action                               |
| --------------------------------- | ------------------------------------ |
| PR not found                      | Ask user to verify PR number         |
| No reviews found                  | Inform user, nothing to fix          |
| Architect disagrees with reviewer | Surface disagreement clearly to user |
| Fix requires new arch decision    | Ask user (no patches!)               |

## Important Notes

- **Architect-first:** The principal architect reads the actual code and reasons from first principles — reviewer suggestions are input, not instructions
- **User has final say:** The architect's plan is shown to the user before SDE2 touches anything
- **No patches:** SDE2 follows the approved plan; if a fix is unclear it pauses and asks
- **One at a time:** Fixes are applied incrementally (blocking first, then minor), but without stopping between them
