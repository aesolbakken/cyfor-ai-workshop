# Task 1: Set up the repo and ship your first feature

In this task you will create all workshop issues in GitHub, give GitHub Copilot some repo-specific guidance, and implement a small feature in the booking/resource management app.

## Part 1: Create GitHub issues from the workshop tasks

Before starting the implementation work, use AI together with the `gh` CLI to turn the workshop tasks into GitHub issues.

Rules:

- read all files matching `workshop-tasks/task-*.md`
- create **one GitHub issue per part** in each task file
- create **all** of those issues up front, not just the ones from this file
- use clear issue titles
- keep the issue bodies intentionally lightweight and a bit open-ended
- include just enough context to understand the problem, but do not fully specify the solution
- leave room for later refinement into user stories and acceptance criteria

Think of these issues as backlog seeds, not final implementation specs.

## Part 2: Create `AGENTS.md`

Create an `AGENTS.md` file in the repository root with short, practical instructions for GitHub Copilot working in this repo.

For this workshop, use `AGENTS.md` as the instruction file for the repository.

Include guidance such as:

- this is a booking/resource management system
- the API lives in `api/` and the frontend lives in `web/`
- use the existing npm scripts instead of inventing new tooling
- regenerate the API client after API/OpenAPI changes
- keep changes small and consistent with the current codebase

Keep it short and useful. Think of it as a cheat sheet for the agent.

## Part 3: Add item descriptions

The current app only supports an item title. For a booking/resource management system, each item should also have a description so users can add more context.

Implement support for item descriptions end-to-end.
