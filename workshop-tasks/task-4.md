# Task 4: The semi-autonomous loop

In this task you will turn the earlier pieces into a semi-autonomous workflow:

pick issue -> triage & plan -> implement -> open PR -> review PR -> human merges

By now the product should have moved beyond a simple list and into basic booking/scheduling. This task is about what comes next: using AI to drive the delivery loop while the human keeps control over the important decisions.

## Theory

Everything from the earlier tasks exists to make this loop trustworthy.

At every step there is a control point:

- **Triage:** a human confirms scope, assumptions, and acceptance criteria before implementation starts
- **Plan:** a human reviews the plan before code is written
- **Implement:** the agent can do most of the work, but the scope must stay small
- **PR review:** AI reviews first, human reviews second; these are different passes, not substitutes
- **Merge:** a human presses the button

Hard rule:

- if the PR is too big to review in 10 minutes, the implementation step went wrong

Common failure modes:

- scope drifts during implementation
- the PR becomes too large to review
- the AI review becomes generic or rubber-stampy
- AI review comments get treated like truth instead of input
- CI failures get "fixed" by weakening tests or lowering quality

The answer is not "trust the agent more." The answer is better control points, smaller diffs, and clearer handoffs.

## Part 1: Create loop skills for each stage

Create a small set of reusable skills that match the delivery loop and can interact with GitHub.

These should **not** be one-off skills tied to a single feature. They should be generic enough to reuse across many issues, while still encoding the project-specific details that matter in this repository.

Suggested examples:

- `.agents/skills/triage-issue/SKILL.md`
- `.agents/skills/plan-implementation/SKILL.md`
- `.agents/skills/review-pr/SKILL.md`
- optionally `.agents/skills/write-pr/SKILL.md`

These skills should be usable by sub-agents as well as by the main agent.

The key idea is that the main agent mostly orchestrates:

- pick the right issue
- invoke the right sub-agent or skill for the stage
- pass along the current GitHub context
- collect the result
- let the human approve the next step

Make the skills practical, not abstract. They should remember project-specific concerns such as:

- API and frontend changes staying in sync
- generated clients or derived files being updated when needed
- booking/resource-management business rules being preserved
- diffs staying small enough to review comfortably

For example:

- the triage skill should read an issue and post a concise triage result back to GitHub
- the planning skill should read the issue plus triage result and produce a short implementation plan
- the implementation agent should use the issue and triage context as its source of truth
- the PR review skill should review the real PR, not just a pasted diff

Use `gh` where appropriate so the skills operate on real issues and PRs.

## Part 2: Run one full pass through the loop

Pick one issue that makes sense **after booking and scheduling exist**. Suitable examples include:

- surface booking conflict reasons in the UI
- add maintenance block periods to resources
- add CSV export of bookings
- add an audit log entry when a booking is created
- add a status filter for scheduled, confirmed, and cancelled bookings

Create one issue for each feature and post it to Github.

Choose one that you can realistically finish in about 30 minutes.

Then run the full loop:

1. Pick the issue from GitHub and assign yourselves.
2. Triage it with the triage skill. Review and tighten the result. Post the triage back to the issue.
3. Plan it with the planning skill. Review the plan before implementation starts.
4. Implement it using the issue + triage + plan as the working context. Use sub-agents where parallel work actually helps.
5. Open a PR with a useful description that references the issue.
6. Review the PR with the PR review skill using the real GitHub PR context.
7. Do a human review and compare it with the AI review.
8. Fix anything important, then merge or mark it ready for merge.

The goal is to experience the main agent as an orchestrator of specialized workers, not as a single giant prompt doing everything at once.

## Done when

- there are reusable skills for the main stages of the loop
- at least one skill writes back to GitHub as part of its job
- one booking-related issue has gone through the full loop from issue to PR review
- the human has explicitly reviewed the triage, plan, and PR before merge
- the final PR is small enough to review comfortably
