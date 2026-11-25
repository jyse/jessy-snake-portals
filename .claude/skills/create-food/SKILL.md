---
name: create-food
description: Set how much food a Snake level needs to finish (its foodGoal), a little more than the level before, within the limits in spec.md. Use when the user types /create-food N, or asks to set or raise the food goal of level N. Creates levels/level-N.js from the level before if it doesn't exist yet.
---

# Create food for level N

The level number is: $ARGUMENTS

Follow CLAUDE.md as always: show a plan and wait for approval before
changing any files, and ask before editing anything in `tests/`.

## 1. Check the level number
- N must be a whole number from 2 to 5 (spec.md: exactly 5 levels; level 1
  has no level before it). Otherwise stop and say why.
- `levels/level-(N-1).js` must exist. If it doesn't, stop and say that level
  N-1 needs to be made first.

## 2. Read the rules
- Read `spec.md`: the `foodGoal` row in the values table (min and max), the
  "Room to grow" rule and the "each level harder" rules.
- Read `levels/level-(N-1).js` for its `foodGoal`, and `levels/level-N.js` if
  it exists.

## 3. If levels/level-N.js doesn't exist yet
Plan to start it as a copy of `levels/level-(N-1).js`, changing only:
- `var SnakeLevel(N-1)` → `var SnakeLevelN`, in both places;
- `number: N`;
- the comment on the first line.
Leave every other value as it is (start, obstacles, speed); other layers
change those.

A new file is only loaded if it's also added in two places, so plan those too:
- `index.html`: `<script src="levels/level-N.js"></script>` after the level
  before's script and before `game.js`;
- `game.js`: add it to `LEVELS`, in both the `require` list and the browser list.

## 4. Pick the food goal
- New `foodGoal` = level N-1's `foodGoal` + 3 (level 2 went from 5 to 8).
- It must be higher than level N-1's and inside spec.md's limits (1 to 30).
  If +3 would go over 30, use 30. If level N-1 is already at 30, stop: there's
  no room for "a little more", so tell the user.
- If level N already exists with a higher, valid `foodGoal`, say so and ask
  before changing it.
- Check "Room to grow": `start` length + `foodGoal` stays far below the free
  squares (400 minus the obstacle squares).

## 5. Food never on an obstacle or the snake
This is handled in `game.js`: `spawnFood(snake, grid, rand, obstacles)` only
picks squares that are free of both, and `createState` and `step` pass the
level's obstacles to it. Don't add new food code. Check instead:
- those calls still pass `obstacles`;
- the level's `start` squares and `obstacles` don't overlap.
If `tests/game.test.js` doesn't yet check level N's food (like the "food on
level 2 never lands on an obstacle" test), propose the same test for level N,
and ask before adding it.

## 6. Show the plan, then make the change
The plan lists: the old and new `foodGoal`, why it's within the limits, and
every file that changes. After approval, make the changes.

## 7. Check
- Run `npm test`. It must be green. If it isn't, fix the cause; never weaken
  or delete a test to make it pass.
- Update the Status table in `PLAN.md` (CLAUDE.md asks for this after every
  layer), and add the new goal to the "Levels (so far)" decision.
- Tell the user the 10-second check: open `index.html?level=N` and the HUD
  shows `Food 0/<new goal>`.
