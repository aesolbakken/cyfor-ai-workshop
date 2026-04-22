# Task 3: Context engineering and issue refinement

In this task you will focus on context quality instead of raw implementation speed. The goal is to show that when Copilot is doing the implementation work, a strong understanding of the problem space becomes even more important.

## Part 1: Create a "refine issue" skill

Create a minimal skill for turning a lightweight GitHub issue or vague requirement into an implementation-ready brief.

Suggested path:

- `.agents/skills/refine-issue/SKILL.md`

The skill should help Copilot produce things like:

- a short problem statement
- the user or role affected
- a user story
- acceptance criteria
- non-goals
- assumptions
- hidden business rules
- edge cases or validation rules
- impacted parts of the system (`api/`, `web/`, generated client, database, tests)

If the issue is ambiguous, the skill should ask the user targeted follow-up questions before locking in requirements, similar to how plan mode clarifies scope and behavior.

Keep it short and reusable. The goal is not to create a giant template. The goal is to make a vague issue actionable.

## Part 2: Use the skill on a deliberately vague requirement

Use your skill on this requirement:

> We need to evolve this product from a simple list into something that can support scheduling and reservations.

This is intentionally vague. The point is to surface the assumptions hiding inside it.

Use the skill to uncover and clarify things like:

- what a "schedule" actually means in this product
- what kind of thing can be booked or reserved
- what information a reservation needs
- when something should count as reserved
- whether reservations have statuses such as draft, confirmed, cancelled, or completed
- how search/filtering relates to availability and booking state
- what business rules should exist before any implementation starts

Update the issue or write out a refined brief that includes:

- a user story
- acceptance criteria
- business rules
- assumptions
- non-goals
- important follow-up questions

This part should involve real ideation between the user and the AI. The point is to show that before AI writes code, it needs a better problem definition than the original vague request.

## Done when

- the refine-issue skill exists and is reusable
- the vague requirement has been turned into a much clearer issue or brief
- hidden assumptions and business rules have been surfaced explicitly
- the final result feels ready for implementation by another person or another Copilot session
