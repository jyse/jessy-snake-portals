---
name: build-game-levels
description: Build the missing Snake levels up to level N in one go, on a new branch, using /create-food, /create-snake and /create-obstacles, then run npm test and ask Bobby (level-checker) for GO or NO-GO. Only on GO it commits and pushes the branch to GitHub. Only when the user types /build-game-levels N.
argument-hint: N (2 to 5)
disable-model-invocation: true
---

# Build the game levels up to N

The target level is: $ARGUMENTS

This skill only runs when the user types `/build-game-levels N`. Never start
it on your own or from another skill.

Follow CLAUDE.md as always: show a plan and wait for approval before
changing any files. Never change `spec.md` or anything in `tests/` in this
workflow. `tests/levels.test.js` already checks every new level file.

## 1. Check before doing anything
Stop and say why if any of these fail:
- N is a whole number from 2 to 5 (spec.md: exactly 5 levels).
- The `levels/level-*.js` files are numbered 1, 2, 3, ... with no gaps.
  Call the highest one M.
- M is lower than N. If M ≥ N, say that levels 1 to M already exist and
  there's nothing to build.
- `git status --short` is empty. Never build on top of uncommitted work.
- `npm test` passes now, before any change.
- `git remote get-url origin` points to GitHub.

## 2. Work out the plan
For each level from M+1 to N, in order:
- Read `.claude/skills/create-food/SKILL.md`, `.claude/skills/create-snake/SKILL.md`
  and `.claude/skills/create-obstacles/SKILL.md`, and use their rules to
  pick that level's values. Each level builds on the one before it,
  including levels planned in this same run.
- If one of those skills would stop (for example, a value has reached its
  spec.md limit, or there's no safe place for more blocks), stop the whole
  workflow and say which level and why.

Then show ONE plan and wait for approval:
- Branch name: `build-levels-up-to-N`, made from the current branch.
- A table per new level: `foodGoal`, start length, `baseMs`, number of
  obstacle squares, next to the level before. Every value has to be harder.
- A board picture of each new level (like the one in spec.md §5).
- Every file that changes: `levels/level-K.js`, `index.html`, `game.js`
  (both `LEVELS` lists), `PLAN.md`.
- The finishing steps: npm test → Bobby → on GO: commit and push to GitHub;
  on NO-GO: stop.

That one approval counts as the approval each create-* skill asks for. Don't
ask again per skill unless a value has to differ from the approved plan. If
it does, stop and show the change.

## 3. Build
1. `git switch -c build-levels-up-to-N`.
2. For each new level K, in order, run the three skills with the Skill tool:
   `/create-food K` (this one also creates the file and adds it to
   `index.html` and `game.js`), then `/create-snake K`, then
   `/create-obstacles K`. Use exactly the values from the approved plan.
   Skip their offers to add extra tests to `tests/`.
3. Every edit makes the project hook run `npm test`. While a level is only
   half built, some tests fail, for example "harder than the level before"
   before its snake is done. That's expected. Only the run in step 4 counts.

## 4. Test
Run `npm test`. If anything fails, stop and go to **NO-GO** below, listing
the failing tests. Never weaken or delete a test to make it pass.

## 5. Ask Bobby
Ask the `level-checker` subagent (Bobby) to check all the levels that now
exist. Show his full report to the user.

## 6a. GO: commit and push
Only if `npm test` passed AND Bobby's verdict is **GO**:
1. `git add` only the files from the plan, then commit with one message per
   run, for example "Add levels 4 and 5: ...", listing each level's values.
2. `git push -u origin build-levels-up-to-N`.
3. Show the commit and the pushed branch. Don't open a pull request and
   never merge. The user decides what happens next.

## 6b. NO-GO: stop
If `npm test` failed or Bobby says **NO-GO**:
- Don't commit and don't push.
- Show the reasons: failing tests and/or Bobby's reasons, with the level,
  the value and the spec.md rule.
- Leave the changes on the branch so the user can look, and say which
  /create-* skill would fix each problem.
