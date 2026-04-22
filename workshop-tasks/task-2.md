# Task 2: Skills, MCPs, and review workflows

In this task you will create a project-specific Copilot skill, install and verify an MCP server, use that MCP for a real code change, and then review your own PR with the skill you created.

## Part 1: Create a PR review skill for this project

Create a minimal skill for reviewing pull requests in this repository.

Suggested path:

- `.agents/skills/review-pr/SKILL.md`

Keep it short and practical. The important part is that the skill captures **what you think matters in a good code review** for this project.

It might remind the model to check things like:

- API and frontend changes stay in sync
- generated files are regenerated when needed
- validation matches the booking/resource management domain
- changes are small, correct, and easy to review
- obvious bugs, missing edge cases, or risky assumptions are called out clearly

You will use this skill later in the task to review a real GitHub PR.

## Part 2: Install and verify Context7

Install one MCP server from the pre-validated list that comes with the workshop template.

For this workshop, use **Context7** as the default choice.

Requirements:

- install the MCP
- verify that it is connected
- verify in Copilot that the server is available and that its tools can be used

## Part 3: Use Context7 to add resource search/filtering

Do not just install the MCP and stop there. Use it for a real change.

Ask Copilot to use Context7 to find the current Hono pattern for validated query parameters and then implement a small search/filter feature for the resource list.

Focus on a small, reviewable change:

- add a query parameter to the API for filtering resources/items
- update the OpenAPI contract and generated client if needed
- add a search or filter control in the frontend
- make sure the UI uses the API filter instead of only filtering locally
- use the MCP to pull current docs instead of relying on memory
- keep the implementation aligned with the existing codebase

Pay attention to whether the generated solution looks more grounded in current documentation than a free-form guess.

## Part 4: Review a real PR with your skill

Create a branch for the search/filter change, open a real pull request on GitHub, and then invoke your PR review skill against that PR.

The goal is to show that a skill can act like a reusable capability, not just a saved prompt. It should help Copilot perform the same kind of review repeatedly, while also pulling context from an outside system such as GitHub.

Notice whether the skill:

- gives you a more consistent review than a one-off prompt
- applies the code review standards you chose in Part 1
- is reusable on future PRs without needing to rewrite the instructions each time

## Stretch goals

If you finish early, pick one of these:

### Option A: Design workflow

Create a `DESIGN.md` file or a small design-oriented skill that explains how to apply the provided design system to this project.
You can find relevant design files here https://www.forsvaret.no/om-forsvaret/forsvarets-profil/profilelement

Download the file and unzip it. Move it to the project directory, and get an agent to write a skill and design document.

Then use that guidance to restyle part of the website so it feels more appropriate for a booking/resource management product.

### Option B: Test-writing skill

Create a small skill for writing good tests in this project.

Then use it on one small change and compare the result to a free-form prompt.

## Done when

- the PR review skill exists and is usable
- Context7 is installed and available to Copilot
- the product has a working search/filter feature implemented with help from the MCP
- there is a PR for that change
- the PR review skill has been invoked on the real GitHub PR
