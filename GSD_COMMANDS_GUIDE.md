# GSD Core — The Complete Encyclopedia of Every Command

> **GSD (Git. Ship. Done.)** is a plan-driven development framework for solo agentic coding with AI.  
> This document provides a **simple, plain-English explanation**, **usage syntax**, **flags**, and **real-world examples** for **every single GSD command** listed in the full reference.

---

## 📑 Table of Contents

1. [Smart Entry & Navigation](#1-smart-entry--navigation)
2. [Project Setup & Onboarding](#2-project-setup--onboarding)
3. [Phase Discussion & Planning](#3-phase-discussion--planning)
4. [Phase Execution](#4-phase-execution)
5. [Quick Tasks & Inline Fixes](#5-quick-tasks--inline-fixes)
6. [Ideas, Notes & Todos (Capture System)](#6-ideas-notes--todos-capture-system)
7. [Debugging & Forensics](#7-debugging--forensics)
8. [Spikes & UI Sketches (Prototyping)](#8-spikes--ui-sketches-prototyping)
9. [Roadmap Surgery & Reordering](#9-roadmap-surgery--reordering)
10. [Milestone Management & Summaries](#10-milestone-management--summaries)
11. [Progress Tracking & Sessions](#11-progress-tracking--sessions)
12. [User Acceptance Testing & Verification](#12-user-acceptance-testing--verification)
13. [Shipping, Pull Requests & Git](#13-shipping-pull-requests--git)
14. [Code Review, Quality Gates & Security](#14-code-review-quality-gates--security)
15. [Specialized Phase Designers (AI, UI, MVP, Spec)](#15-specialized-phase-designers)
16. [Knowledge Graphs & Context (Graphify, MemPalace, Intel)](#16-knowledge-graphs--context)
17. [Multi-Workspaces & Orchestration](#17-multi-workspaces--orchestration)
18. [System Health, Revert & Maintenance](#18-system-health-revert--maintenance)
19. [Settings, Profiles & Surface Management](#19-settings-profiles--surface-management)
20. [Namespace Routers (Category Browsers)](#20-namespace-routers)

---

## 1. Smart Entry & Navigation

### `/gsd-next`
- **What it does:** Your intelligent starting point. It inspects your project state, git branch, and phase status, then shows a concise menu with the single recommended next action.
- **When to use:** Whenever you sit down to code and ask "What should I do right now?".
- **Usage:**
  ```bash
  /gsd-next
  ```
- **Example:**
  ```text
  > Status: Phase 2 (Product Search API) is completed but not yet verified.
  > Recommended: [1] /gsd-verify-work 2
  > Alternatives: [2] /gsd-plan-phase 3 | [3] /gsd-progress
  ```

---

### `/gsd-progress --do "<description>"` (Smart Intent Router)
- **What it does:** Translates your natural language request into the exact GSD command and runs it for you.
- **When to use:** When you know what you want to achieve, but can't remember the exact `/gsd-*` command syntax.
- **Usage:**
  ```bash
  /gsd-progress --do "<what you want to do>"
  ```
- **Examples:**
  ```bash
  /gsd-progress --do "fix the broken login button"
  # -> Automatically routes to: /gsd-debug "login button"

  /gsd-progress --do "I want to start a new v2 milestone"
  # -> Automatically routes to: /gsd-new-milestone "v2"

  /gsd-progress --do "fix spelling error in README"
  # -> Automatically routes to: /gsd-fast "fix spelling error in README"
  ```

---

## 2. Project Setup & Onboarding

### `/gsd-new-project`
- **What it does:** Starts a brand-new project from scratch. It conducts an interactive interview, performs ecosystem research, scopes requirements, and builds your initial milestone roadmap.
- **When to use:** When starting an empty folder or brand-new idea.
- **Usage:**
  ```bash
  /gsd-new-project
  ```
- **Output:** Creates `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, and `STATE.md`.

---

### `/gsd-onboard`
- **What it does:** Safely onboards an **existing codebase** into GSD. It detects your languages, frameworks, existing documentation, and pending tasks without overwriting existing files.
- **When to use:** The very first time you introduce GSD into an already existing app.
- **Flags:**
  - `--fast`: Runs a quick, lightweight structural scan.
  - `--text`: Outputs plain text without fancy terminal formatting.
- **Usage:**
  ```bash
  /gsd-onboard
  /gsd-onboard --fast
  ```
- **Example:** In a project with existing ASP.NET backend and Angular frontend, it reads folder structures, package files, and sets up `.planning/onboarding/SUMMARY.md`.

---

### `/gsd-map-codebase`
- **What it does:** Explores and indexes an existing codebase into 7 structured architectural reference documents inside `.planning/codebase/`.
- **When to use:** When you need a deep dive into tech debt, conventions, architecture patterns, or integrations.
- **Flags:**
  - `--fast`: Fast scan for rapid assessment.
  - `--focus <area>`: Scopes mapping to a specific area (e.g. `auth`, `database`, `frontend`).
  - `--query <term>`: Searches the codebase intelligence index for a specific topic.
- **Usage:**
  ```bash
  /gsd-map-codebase
  /gsd-map-codebase --focus auth
  /gsd-map-codebase --query "Where is the JWT middleware configured?"
  ```
- **Generated Files:**
  - `STACK.md`, `ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md`, `INTEGRATIONS.md`, `CONCERNS.md`.

---

### `/gsd-ingest-docs`
- **What it does:** Scans your repo for existing architecture docs, ADRs (Architecture Decision Records), PRDs, and RFCs, and imports them into `.planning/` so the AI remembers past decisions.
- **Flags:**
  - `--mode new|merge`: Start fresh or merge into existing planning docs.
  - `--manifest <file>`: Use a predefined list of files.
  - `--resolve auto|interactive`: How to resolve conflicting architectural guidelines.
- **Usage:**
  ```bash
  /gsd-ingest-docs docs/adr/
  /gsd-ingest-docs --mode merge docs/specs/
  ```

---

### `/gsd-import`
- **What it does:** Ingests external plan files or reverse-migrates projects from GSD v2 format back to GSD v1 format with conflict detection.
- **Usage:**
  ```bash
  /gsd-import --from ./external-plan.md
  /gsd-import --from-gsd2
  ```

---

## 3. Phase Discussion & Planning

### `/gsd-discuss-phase <N>`
- **What it does:** An interactive intake session to clarify your visual, architectural, and behavioral vision for Phase `<N>` *before* generating tasks.
- **When to use:** When you have specific preferences (e.g. "use slide-out drawer, not modal") and don't want the AI to guess.
- **Flags:**
  - `--batch[=N]`: Ask multiple questions at once (e.g. `--batch=3`) instead of one-by-one.
  - `--assumptions`: Skips the interview and surfaces what the AI is assuming by default.
  - `--chain`: Runs a chained-prompt deep questioning sequence.
- **Usage & Examples:**
  ```bash
  /gsd-discuss-phase 2
  /gsd-discuss-phase 2 --batch=3
  /gsd-discuss-phase 2 --assumptions
  ```

---

### `/gsd-plan-phase <N>`
- **What it does:** Creates the detailed, executable task plan (`XX-01-PLAN.md`) for Phase `<N>`. Breaks work into dependency waves with clear verification criteria.
- **Flags:**
  - `--research`: Spawns a dedicated researcher subagent to investigate modern docs/APIs before planning.
  - `--skip-research`: Skips research to plan immediately.
  - `--research-phase <N>`: Run research only and write `RESEARCH.md` without generating tasks.
  - `--view`: View existing `RESEARCH.md` without running research again.
  - `--prd <file>`: Express Path: loads requirements directly from a markdown specification.
  - `--tdd`: Enforces Test-Driven Development (scaffolds test tasks before code tasks).
  - `--mvp`: Scopes the plan to the smallest viable slice of functionality.
  - `--gaps`: Generates a plan specifically targeting missing verification items from a previous run.
  - `--granularity <coarse|standard|fine>`: Controls how small each task should be.
- **Usage & Examples:**
  ```bash
  /gsd-plan-phase 1
  /gsd-plan-phase 2 --research
  /gsd-plan-phase 2 --prd docs/payment-spec.md
  /gsd-plan-phase 3 --tdd
  /gsd-plan-phase --research-phase 3 --view
  ```

---

### `/gsd-ultraplan-phase [phase]`
- **What it does:** Offloads planning to Claude Code's Ultraplan cloud service, allows you to review the plan in a browser UI, and imports it back to `.planning/`.
- **Usage:**
  ```bash
  /gsd-ultraplan-phase 4
  ```

---

### `/gsd-plan-review-convergence <phase>`
- **What it does:** Submits phase plans to external AI reviewers (Claude, Codex, OpenCode, Ollama, LM Studio) and automatically replans in a loop until all high-severity concerns are resolved.
- **Flags:** `--all`, `--claude`, `--codex`, `--ollama`, `--max-cycles N`
- **Usage:**
  ```bash
  /gsd-plan-review-convergence 2 --all --max-cycles 3
  ```

---

## 4. Phase Execution

### `/gsd-execute-phase <N>`
- **What it does:** Executes all plans in Phase `<N>` sequentially by dependency waves. Modifies code, runs tests, and produces atomic git commits for each task.
- **Flags:**
  - `--wave N`: Executes only Wave `N` and stops (useful for phased review).
  - `--gaps-only`: Only executes tasks that failed or were flagged as gaps during verification.
  - `--tdd`: Enforces running tests and verifying failures before code implementation.
- **Usage & Examples:**
  ```bash
  # Execute entire phase
  /gsd-execute-phase 2

  # Execute only Wave 1 (e.g. backend models)
  /gsd-execute-phase 2 --wave 1

  # Execute only Wave 2 (e.g. frontend components)
  /gsd-execute-phase 2 --wave 2
  ```

---

### `/gsd-autonomous`
- **What it does:** The autopilot command. Runs all remaining phases in your milestone autonomously: discussing, planning, and executing each phase in sequence without manual intervention.
- **Flags:**
  - `--from N`: Start from phase N.
  - `--to N`: Stop after phase N.
  - `--only N`: Run only phase N autonomously.
  - `--converge`: Feeds plans through cross-AI convergence review before execution.
- **Usage:**
  ```bash
  /gsd-autonomous --from 2 --to 5
  ```

---

## 5. Quick Tasks & Inline Fixes

### `/gsd-fast "<description>"`
- **What it does:** Zero-overhead, lightning-fast inline fix. Does **not** create planning documents or spawn subagents. Limited to changes touching **≤ 3 files**.
- **When to use:** Typos, simple config updates, adding a missing import, one-line bugfixes.
- **Usage & Examples:**
  ```bash
  /gsd-fast "fix typo in navigation brand logo text"
  /gsd-fast "add .env.local to .gitignore"
  /gsd-fast "increase database connection pool size to 20 in appsettings.json"
  ```

---

### `/gsd-quick "<description>"`
- **What it does:** Executes a standalone ad-hoc task with full GSD guarantees (atomic commits and state tracking in `.planning/quick/`), but skips polluting the main roadmap.
- **Flags:**
  - `--full`: Runs discussion, research, plan-checking, and post-verification.
  - `--validate`: Plan checking and post-execution verification only.
  - `--discuss`: Quick discussion before planning.
  - `--research`: Focused research agent explores approaches first.
- **Usage & Examples:**
  ```bash
  /gsd-quick "create email validation utility function with tests"
  /gsd-quick --full "add JWT token expiration refresh endpoint"
  /gsd-quick --research "integrate Lucene search indexer for product descriptions"
  ```

---

### `/gsd-quick-batch`
- **What it does:** Batches multiple small quick tasks together under one coordinator. Plans, dispatches, and merges them concurrently.
- **Flags:**
  - `--jobs N`: Maximum parallel tasks (e.g. `--jobs 3`).
  - `--validate`: Run plan-checker and post-verification.
  - `--file <path>`: Load list of tasks from a text/markdown file.
- **Usage & Examples:**
  ```bash
  /gsd-quick-batch --jobs 2 \
    "add health check endpoint at /api/health" \
    "update copyright year in footer component" \
    "add robots.txt file"
  ```

---

## 6. Ideas, Notes & Todos (Capture System)

### `/gsd-capture`
- **What it does:** Captures an idea or task directly from the conversation or description into `.planning/todos/pending/` without disrupting your current coding task.
- **Usage & Examples:**
  ```bash
  # Infer task details from current chat context
  /gsd-capture

  # Explicit description
  /gsd-capture "Add discount coupon code input to Cart Drawer"
  ```

---

### `/gsd-capture --note <text>`
- **What it does:** Zero-friction scratchpad. Instantly appends a timestamped note to `.planning/notes/`.
- **Subcommands:**
  - `append`: Default action.
  - `list`: Show all captured notes.
  - `promote <ID>`: Promotes note into a full tracked todo.
  - `--global`: Save to user-wide global notes directory.
- **Usage & Examples:**
  ```bash
  /gsd-capture --note "check if EF Core supports spatial queries for store locations"
  /gsd-capture --note list
  /gsd-capture --note promote 1
  ```

---

### `/gsd-capture --list [area]`
- **What it does:** Lists pending captured todos and lets you pick one to work on, defer, or promote into a phase.
- **Usage & Examples:**
  ```bash
  /gsd-capture --list
  /gsd-capture --list backend
  /gsd-capture --list ui
  ```

---

### `/gsd-capture --backlog "<description>"`
- **What it does:** Parks an idea into the future backlog (`999.x` numbering in `ROADMAP.md`). Keeps ideas safe without cluttering the active milestone.
- **Usage:**
  ```bash
  /gsd-capture --backlog "Support crypto payments with Coinbase Commerce"
  ```

---

### `/gsd-capture --seed "<idea with trigger>"`
- **What it does:** Captures forward-looking ideas that **automatically wake up and remind you** when a specific trigger condition is met during future milestones.
- **Usage & Examples:**
  ```bash
  /gsd-capture --seed "Add Stripe Webhook validation when we implement checkout phase"
  /gsd-capture --list-seeds
  /gsd-capture --list-seeds dormant
  ```

---

## 7. Debugging & Forensics

### `/gsd-debug "<symptom>"`
- **What it does:** Scientific, hypothesis-driven debugging. Gathers evidence, formulates hypotheses, executes tests, and logs findings to `.planning/debug/[slug].md`.
- **Why it is special:** **Survives `/clear` and session resets!** If you clear context, typing `/gsd-debug` resumes the active investigation seamlessly.
- **Flags:**
  - `--diagnose`: Run a fast, one-shot diagnostic analysis without opening a persistent session file.
- **Usage & Examples:**
  ```bash
  # Start persistent investigation
  /gsd-debug "Order total calculation applies tax twice on reload"

  # Resume ongoing debug session after /clear
  /gsd-debug

  # One-shot diagnosis
  /gsd-debug --diagnose "why is dotnet build failing with CS0246?"
  ```

---

### `/gsd-forensics "<problem description>"`
- **What it does:** Post-mortem diagnostic tool when a GSD workflow fails or an agent crashes. Analyzes agent logs, git commits, and planning state to find the root cause.
- **Usage:**
  ```bash
  /gsd-forensics "Wave 2 execution halted unexpectedly during migration task"
  ```

---

## 8. Spikes & UI Sketches (Prototyping)

### `/gsd-spike "<question or idea>"`
- **What it does:** Rapidly writes throwaway experimental code to validate technical feasibility (Given / When / Then). Saves findings to `.planning/spikes/`.
- **Flags:**
  - `--quick`: Skips experiment breakdown and starts coding immediately.
  - `--wrap-up`: Packages spike findings and lessons into a permanent project agent skill in `.agents/skills/`.
- **Usage & Examples:**
  ```bash
  /gsd-spike "Can we stream Gemini Live API audio responses directly in Angular?"
  /gsd-spike --quick "Test if pdf-lib can merge two encrypted invoices"
  /gsd-spike --wrap-up
  ```

---

### `/gsd-sketch "<UI layout idea>"`
- **What it does:** Generates 2-3 interactive, tabbed HTML mockups with full styling so you can preview and choose UI variants before writing real frontend code.
- **Flags:**
  - `--quick`: Skips mood/direction intake and generates mockups immediately.
  - `--wrap-up`: Packages selected CSS patterns and HTML structures into reusable project design standards.
- **Usage & Examples:**
  ```bash
  /gsd-sketch "Checkout page with sticky order summary and accordion payment methods"
  /gsd-sketch --quick "Product card grid with quick-view modal"
  /gsd-sketch --wrap-up
  ```

---

## 9. Roadmap Surgery & Reordering

### `/gsd-phase "<title>"`
- **What it does:** Appends a brand-new phase to the end of your current milestone.
- **Usage:**
  ```bash
  /gsd-phase "Multi-Language Localization (i18n)"
  ```

---

### `/gsd-phase --insert <after> "<title>"`
- **What it does:** Inserts an urgent hotfix phase as a decimal number between existing phases (e.g. inserting after Phase 2 creates Phase 2.1).
- **Usage:**
  ```bash
  /gsd-phase --insert 2 "Hotfix Critical JWT Refresh Token Leak"
  # Creates Phase 2.1 without breaking Phase 3, 4, 5 numbering!
  ```

---

### `/gsd-phase --remove <number>`
- **What it does:** Deletes a future unstarted phase and automatically renumbers all subsequent phases so there are no numbering gaps.
- **Usage:**
  ```bash
  /gsd-phase --remove 5
  # Phase 5 is deleted; Phase 6 becomes 5, Phase 7 becomes 6.
  ```

---

### `/gsd-phase --edit <number>`
- **What it does:** Safely edits the title, description, or dependencies of an existing phase in `ROADMAP.md` while preserving its position and history.
- **Flags:** `--force` (permits editing phases already in progress).
- **Usage:**
  ```bash
  /gsd-phase --edit 3
  ```

---

## 10. Milestone Management & Summaries

### `/gsd-complete-milestone <version>`
- **What it does:** Finalizes the current milestone (e.g. `v1.0.0`). Archives roadmap files into `.planning/milestones/`, records stats, creates a Git release tag, and resets the workspace for the next version.
- **Usage:**
  ```bash
  /gsd-complete-milestone 1.0.0
  ```

---

### `/gsd-new-milestone "<name>"`
- **What it does:** Initializes the next development milestone cycle (e.g. `v2.0`). Conducts intake, creates scoped requirements, and sets up a new roadmap.
- **Flags:**
  - `--reset-phase-numbers`: Restarts phase numbering at Phase 1 and archives old phase folders.
  - `--ws <name>`: Scopes the milestone to an isolated workstream.
- **Usage:**
  ```bash
  /gsd-new-milestone "v2.0 Admin Dashboard & Analytics"
  /gsd-new-milestone --reset-phase-numbers "v2.0 Admin Dashboard & Analytics"
  ```

---

### `/gsd-milestone-summary [version]`
- **What it does:** Generates an executive project summary document from completed milestone artifacts. Perfect for stakeholder updates and developer onboarding.
- **Usage:**
  ```bash
  /gsd-milestone-summary 1.0.0
  ```

---

### `/gsd-audit-milestone [version]`
- **What it does:** Deep audit of an entire milestone against original requirements. Spawns an integration checker to verify that all cross-phase connections actually work.
- **Usage:**
  ```bash
  /gsd-audit-milestone 1.0.0
  ```

---

### `/gsd-cleanup`
- **What it does:** Archives completed phase directories from `.planning/phases/` into `.planning/milestones/vX.Y-phases/` to eliminate folder clutter.
- **Usage:**
  ```bash
  /gsd-cleanup
  ```

---

## 11. Progress Tracking & Sessions

### `/gsd-progress`
- **What it does:** The primary status dashboard. Shows visual progress bars, completion percentage, recent summaries, current phase position, and open blockers.
- **Flags:**
  - `--next`: Advances directly to the next logical workflow action.
  - `--next --auto`: Automatically chains next steps without pausing.
  - `--next --converge`: Routes planning through multi-model review convergence.
  - `--forensic`: Appends a 6-point integrity audit of planning files.
- **Usage & Examples:**
  ```bash
  /gsd-progress
  /gsd-progress --next
  /gsd-progress --forensic
  ```

---

### `/gsd-pause-work`
- **What it does:** Safely pauses your current work session mid-phase. Creates a `.continue-here` handoff file so you or another developer can pick up seamlessly.
- **Flags:**
  - `--report`: Generates a post-session summary report in `.planning/reports/` tracking commits and file changes.
- **Usage:**
  ```bash
  /gsd-pause-work
  /gsd-pause-work --report
  ```

---

### `/gsd-resume-work`
- **What it does:** Restores full session context after a break, machine reboot, or context reset. Reads `.continue-here` and `STATE.md` to tell you exactly where you left off.
- **Usage:**
  ```bash
  /gsd-resume-work
  ```

---

## 12. User Acceptance Testing & Verification

### `/gsd-verify-work [phase]`
- **What it does:** Conducts an interactive User Acceptance Test (UAT) session. Evaluates deliverables built during the phase with step-by-step verification questions. If a test fails, it creates fix tasks automatically.
- **Usage:**
  ```bash
  /gsd-verify-work 3
  ```

---

### `/gsd-audit-uat`
- **What it does:** Scans every phase in the milestone for pending, skipped, or manual verification items. Cross-references against your live codebase to identify verification debt.
- **Usage:**
  ```bash
  /gsd-audit-uat
  ```

---

### `/gsd-validate-phase [phase]`
- **What it does:** Retroactively checks a phase against Nyquist validation principles (ensuring test coverage exists for all core requirements) and fills missing gaps.
- **Usage:**
  ```bash
  /gsd-validate-phase 2
  ```

---

## 13. Shipping, Pull Requests & Git

### `/gsd-ship [phase]`
- **What it does:** Packages a verified phase into a production-ready Pull Request. Pushes the branch, compiles deliverables into a PR body, and opens the PR via `gh` CLI.
- **Flags:**
  - `--draft`: Opens the PR in draft mode.
- **Usage:**
  ```bash
  /gsd-ship 3
  /gsd-ship 3 --draft
  ```

---

### `/gsd-pr-branch [target]`
- **What it does:** Creates a clean Git branch for code reviewers by stripping out internal `.planning/` documentation commits. Reviewers only see real production code changes.
- **Usage:**
  ```bash
  /gsd-pr-branch
  /gsd-pr-branch main
  ```

---

### `/gsd-review --phase <N>`
- **What it does:** Calls external AI CLI engines (Claude Code, OpenAI Codex, CodeRabbit, Antigravity) to perform multi-perspective peer reviews on phase plans.
- **Flags:** `--all`, `--claude`, `--codex`, `--coderabbit`, `--opencode`, `--agy`
- **Usage:**
  ```bash
  /gsd-review --phase 2 --all
  ```

---

## 14. Code Review, Quality Gates & Security

### `/gsd-code-review <phase>`
- **What it does:** Scans all source files changed during a phase for security vulnerabilities, logic bugs, performance bottlenecks, and bad patterns. Writes findings to `REVIEW.md`.
- **Flags:**
  - `--depth=quick|standard|deep`: Sets review depth.
  - `--files file1,file2`: Limits review to specific files.
  - `--fix`: Automatically applies intelligent fixes to found issues.
  - `--fix --auto`: Automatically applies fixes and commits each atomically.
- **Usage & Examples:**
  ```bash
  /gsd-code-review 3
  /gsd-code-review 3 --depth=deep
  /gsd-code-review 3 --fix --auto
  ```

---

### `/gsd-add-tests <phase> [instructions]`
- **What it does:** Automatically generates comprehensive unit and integration tests for all features built in a phase.
- **Usage & Examples:**
  ```bash
  /gsd-add-tests 2
  /gsd-add-tests 3 "Focus on negative test cases and boundary values for coupon expiry"
  ```

---

### `/gsd-secure-phase [phase]`
- **What it does:** Audits implemented code against threat models to ensure authentication checks, input sanitization, and security policies are active.
- **Usage:**
  ```bash
  /gsd-secure-phase 2
  ```

---

### `/gsd-ui-review [phase]`
- **What it does:** Performs a 6-pillar visual design audit on frontend components (accessibility, contrast, responsive layouts, spacing, typography, motion).
- **Usage:**
  ```bash
  /gsd-ui-review 3
  ```

---

### `/gsd-eval-review [phase]`
- **What it does:** For AI/LLM phases, audits evaluation coverage, guardrails, and production monitoring metrics against the `AI-SPEC.md` contract.
- **Usage:**
  ```bash
  /gsd-eval-review 4
  ```

---

### `/gsd-audit-fix --source <audit-file>`
- **What it does:** Fully autonomous audit-to-fix pipeline. Reads an audit report, prioritizes issues, writes fixes, tests them, and commits them.
- **Flags:** `--severity high|medium|all`, `--max N`, `--dry-run`
- **Usage:**
  ```bash
  /gsd-audit-fix --source .planning/audit/UAT-AUDIT.md --severity high
  ```

---

## 15. Specialized Phase Designers

### `/gsd-spec-phase <phase>`
- **What it does:** Clarifies **WHAT** a phase delivers before discussing implementation. Computes an ambiguity score and produces `SPEC.md`.
- **Flags:** `--auto`, `--text`
- **Usage:**
  ```bash
  /gsd-spec-phase 2
  ```

---

### `/gsd-mvp-phase <phase>`
- **What it does:** Shapes a phase as a vertical MVP slice using User Stories and SPIDR splitting techniques before handing off to planning.
- **Usage:**
  ```bash
  /gsd-mvp-phase 3
  ```

---

### `/gsd-ai-integration-phase [phase]`
- **What it does:** Generates an `AI-SPEC.md` design contract for phases involving LLM integrations, embeddings, RAG pipelines, prompts, or agents.
- **Usage:**
  ```bash
  /gsd-ai-integration-phase 4
  ```

---

### `/gsd-ui-phase [phase]`
- **What it does:** Generates a strict `UI-SPEC.md` design contract for frontend phases, ensuring brand colors, typography, component hierarchies, and states are defined upfront.
- **Usage:**
  ```bash
  /gsd-ui-phase 3
  ```

---

### `/gsd-explore`
- **What it does:** Socratic ideation sandbox. Helps you think through vague concepts, explore technical architectures, and routes ideas to plans, spikes, or sketches.
- **Usage:**
  ```bash
  /gsd-explore
  ```

---

## 16. Knowledge Graphs & Context

### `/gsd-graphify [action]`
- **What it does:** Builds and queries a persistent Knowledge Graph of your codebase in `.planning/graphs/`. Identifies god nodes, circular dependencies, and call hierarchies.
- **Subcommands:** `build`, `query <term>`, `status`, `diff`
- **Usage & Examples:**
  ```bash
  /gsd-graphify build
  /gsd-graphify query "How does CartDrawer communicate with AuthService?"
  /gsd-graphify status
  ```

---

### `/gsd-mempalace-recall` & `/gsd-mempalace-capture`
- **What it does:** Long-term memory system (MemPalace). Recalls past architectural decisions, patterns, and lessons across past sessions or projects.
- **Usage:**
  ```bash
  /gsd-mempalace-recall
  /gsd-mempalace-capture decision
  ```

---

### `/gsd-thread`
- **What it does:** Manages persistent context threads for long-running discussions spanning across multiple days and restarts.
- **Subcommands:** `list`, `close <slug>`, `status <slug>`, `<name>`
- **Usage:**
  ```bash
  /gsd-thread "Database migration strategy"
  /gsd-thread list
  ```

---

### `/gsd-extract-learnings <phase>`
- **What it does:** Reads phase summaries and git history to extract decisions, lessons learned, and surprises, appending them to project memory.
- **Usage:**
  ```bash
  /gsd-extract-learnings 3
  ```

---

### `/gsd-profile-user`
- **What it does:** Analyzes developer interaction style across 8 behavioral dimensions to personalize how the agent communicates, plans, and writes code.
- **Usage:**
  ```bash
  /gsd-profile-user
  /gsd-profile-user --questionnaire
  ```

---

### `/gsd-stats`
- **What it does:** Displays comprehensive project metrics: total phases, tasks completed, requirements coverage, git commit volume, and timeline trajectory.
- **Usage:**
  ```bash
  /gsd-stats
  ```

---

## 17. Multi-Workspaces & Orchestration

### `/gsd-manager`
- **What it does:** Command center for viewing and orchestrating multiple phases simultaneously from one screen.
- **Flags:**
  - `--analyze-deps`: Scans phase dependencies to highlight which phases can be executed in parallel.
- **Usage:**
  ```bash
  /gsd-manager
  /gsd-manager --analyze-deps
  ```

---

### `/gsd-workspace`
- **What it does:** Creates, lists, or removes isolated development workspace environments (git worktrees) so multiple tasks can run in parallel without file collisions.
- **Subcommands:** `--new <name>`, `--list`, `--remove <name>`
- **Usage:**
  ```bash
  /gsd-workspace --new feature-auth
  /gsd-workspace --list
  ```

---

### `/gsd-workstreams`
- **What it does:** Manages parallel workstreams inside a project (e.g. backend vs frontend vs mobile).
- **Subcommands:** `list`, `create`, `switch`, `status`, `complete`
- **Usage:**
  ```bash
  /gsd-workstreams list
  /gsd-workstreams create mobile-app
  ```

---

### `/gsd-review-backlog`
- **What it does:** Reviews parked backlog items (`999.x`) and interactively promotes approved items into active roadmap phases.
- **Usage:**
  ```bash
  /gsd-review-backlog
  ```

---

### `/gsd-inbox`
- **What it does:** Connects to GitHub Issues and Pull Requests to triage, review, label, or convert incoming issues into GSD roadmap phases.
- **Flags:** `--issues`, `--prs`, `--label`, `--close-incomplete`
- **Usage:**
  ```bash
  /gsd-inbox --issues
  ```

---

## 18. System Health, Revert & Maintenance

### `/gsd-undo`
- **What it does:** Safe git rollback. Reverts phase or plan commits using the phase manifest while checking for dependency breakages.
- **Flags:**
  - `--last N`: Revert the last N commits.
  - `--plan NN-MM`: Roll back a specific plan commit set.
  - `--phase NN`: Roll back an entire phase.
- **Usage & Examples:**
  ```bash
  /gsd-undo --last 1
  /gsd-undo --plan 03-02
  /gsd-undo --phase 3
  ```

---

### `/gsd-health`
- **What it does:** Diagnoses the health of your `.planning/` directory, detecting broken links, orphaned plans, mismatched numbering, or corrupted state files.
- **Flags:**
  - `--repair`: Automatically repairs detected discrepancies.
- **Usage:**
  ```bash
  /gsd-health
  /gsd-health --repair
  ```

---

### `/gsd-docs-update`
- **What it does:** Generates or updates project README and documentation files verified directly against live codebase implementation.
- **Flags:** `--force`, `--verify-only`
- **Usage:**
  ```bash
  /gsd-docs-update
  ```

---

### `/gsd-update`
- **What it does:** Checks for new GSD Core releases, previews changelog notes, highlights breaking changes, and updates GSD to the latest version.
- **Flags:**
  - `--sync`: Synchronizes managed skills across runtime roots.
  - `--reapply`: Reapplies local configuration patches after update.
  - `--next` (or `--rc`): Updates to the release candidate preview channel.
- **Usage:**
  ```bash
  /gsd-update
  /gsd-update --sync
  ```

---

## 19. Settings, Profiles & Surface Management

### `/gsd-settings`
- **What it does:** Interactive settings wizard to toggle researcher, checker, and verifier agents, and choose default execution modes.
- **Usage:**
  ```bash
  /gsd-settings
  ```

---

### `/gsd-config`
- **What it does:** Direct configuration CLI for model profiles, advanced knobs, and third-party API integrations.
- **Flags:**
  - `--profile <quality|balanced|budget|inherit>`: Set model tier.
  - `--advanced`: Tune plan bounce, execution timeouts, and branch naming.
  - `--integrations`: Configure CodeRabbit, external LLM CLI endpoints, and API keys.
- **Usage & Examples:**
  ```bash
  /gsd-config --profile balanced
  /gsd-config --profile quality
  /gsd-config --advanced
  ```

---

### `/gsd-surface`
- **What it does:** Manages which skills and commands are loaded into context to optimize token usage.
- **Subcommands:**
  - `list` / `status`: View active and disabled skill clusters.
  - `profile <name>`: Switch base profile (`core`, `standard`, `full`).
  - `disable <cluster>` / `enable <cluster>`: Enable or disable clusters (e.g. `utility`, `experimental`).
  - `reset`: Return to original default profile.
- **Usage & Examples:**
  ```bash
  /gsd-surface list
  /gsd-surface profile core
  /gsd-surface disable utility
  ```

---

### `/gsd-help`
- **What it does:** Built-in help reference at different tiers.
- **Flags:**
  - `--brief`: 10-line refresher of top commands.
  - *(no flag)*: One-page introductory tour.
  - `--full`: Complete, exhaustive command reference.
  - `<topic>`: Outputs help for a single section (e.g. `/gsd-help debug`, `/gsd-help capture`).
  - `--brief <topic>`: One-line signature summary for a specific topic.
- **Usage & Examples:**
  ```bash
  /gsd-help
  /gsd-help --brief
  /gsd-help --full
  /gsd-help debug
  /gsd-help --brief debug
  ```

---

## 20. Namespace Routers

These 6 meta-commands group the 60+ GSD capabilities into intuitive categories when you want to browse tools interactively:

| Namespace Command | Category & Covered Areas |
|---|---|
| **`/gsd-workflow`** | Pipeline: Discuss, Plan, Execute, Verify, Phase, Progress |
| **`/gsd-context`** | Codebase Intelligence: Map, Graphify, Docs, Learnings, MemPalace |
| **`/gsd-ideate`** | Exploration & Capture: Explore, Sketch, Spike, Spec, Capture |
| **`/gsd-manage`** | Operations & Workspace: Workstreams, Threads, Update, Ship, Inbox |
| **`/gsd-project`** | Lifecycle: Milestones, Audits, Summaries, Cleanup |
| **`/gsd-quality`** | Quality Gates: Code Review, Debug, Security, Eval, UI Review |

---

## 🏁 Summary: The Standard 5-Minute Daily Workflow

```text
1. Start your day:       /gsd-next
2. Discuss feature:       /gsd-discuss-phase 3
3. Plan tasks:           /gsd-plan-phase 3
4. Execute code:         /gsd-execute-phase 3
5. Verify (UAT):         /gsd-verify-work 3
6. Ship PR:              /gsd-ship 3
7. Check overall state:  /gsd-progress
```
