---
name: create-snake
description: Set the snake for a Snake level, meaning its start length and its starting speed, a little more than the level before, within the limits in spec.md, never starting in an obstacle. Use when the user types /create-snake N, or asks to make the snake in level N longer or faster. Creates levels/level-N.js from the level before if it doesn't exist yet.
allowed-tools: Read, Edit(levels/**), Write(levels/**)
---

# Create the snake for level N

The level number is: $ARGUMENTS

Follow CLAUDE.md as always: show a plan and wait for approval before
changing any files, and ask before editing anything in `tests/`. Edits to
files in `levels/` don't need a separate permission prompt (see
`allowed-tools`), but they still come after the approved plan.

## 1. Check the level number
- N must be a whole number from 2 to 5 (spec.md: exactly 5 levels; level 1
  has no level before it). Otherwise stop and say why.
- `levels/level-(N-1).js` must exist. If it doesn't, stop and say that level
  N-1 needs to be made first.

## 2. Read the rules
- Read `spec.md`: the `start`, `baseMs` and `minMs` rows in the values table,
  the rules "Start shape", "Direction", "Clear space ahead", "Obstacles",
  "Room to grow" and "Speed", and the "each level harder" rules.
- Read `levels/level-(N-1).js`, and `levels/level-N.js` if it exists.

## 3. If levels/level-N.js doesn't exist yet
Plan to start it as a copy of `levels/level-(N-1).js`, changing only:
- `var SnakeLevel(N-1)` → `var SnakeLevelN`, in both places;
- `number: N`;
- the comment on the first line.
Leave the food goal and obstacles as they are; other skills change those.

A new file is only loaded if it's also added in two places, so plan those
too. They're outside `levels/`, so they need the usual permission:
- `index.html`: `<script src="levels/level-N.js"></script>` after the level
  before's script and before `game.js`;
- `game.js`: add it to `LEVELS`, in both the `require` list and the browser list.

## 4. Pick the start length
- New length = level N-1's `start` length + 1 (level 2 went from 3 to 4).
- It must be longer than level N-1's and inside spec.md's limits (2 to 8
  squares). If level N-1 is already at 8, stop and tell the user.
- Keep the head where level N-1 has it, and keep `dir`. Add the new square at
  the tail end, carrying on the straight line away from the head.
- The new square must be on the board and not on an obstacle. If it would hit
  a wall or a block, stop and tell the user rather than moving the snake
  somewhere else.
- Because the head and `dir` don't move, the clear space ahead stays the same.
  Check it's still at least 5 squares anyway.

## 5. Pick the speed
- New `baseMs` = level N-1's `baseMs` − 10 (lower is faster).
- It must be inside spec.md's limits (90 to 150) and lower than level N-1's.
  If −10 would go under 90, use 90. If level N-1 is already at 90, keep 90
  and tell the user that the start speed can't go up any further.
- Keep `speedupEvery` and `speedupMs` as they are. `minMs` stays 70 (the same
  top speed on every level), and `baseMs` must stay above it.

## 6. If level N already has a valid snake
If level N's `start` is already longer than level N-1's, or its `baseMs` is
already lower than level N-1's, and the value is inside the limits, say so
and ask before changing it.

## 7. The snake never starts in an obstacle
- No `start` square may be on an `obstacles` square, and none may be listed
  twice.
- Check "Room to grow": `start` length + `foodGoal` stays far below the free
  squares (400 minus the obstacle squares).
- If `tests/game.test.js` doesn't yet check level N's start (like "the snake
  never starts on an obstacle" and "level 2 starts longer than level 1" do
  for level 2), propose the same tests for level N, plus one that checks
  level N starts faster than level N-1. Ask before adding them.

## 8. Show the plan, then make the change
The plan lists: the old and new start length and `baseMs`, the new `start`
squares, why each value is within the limits, and every file that changes.
After approval, make the changes.

## 9. Check
- Run `npm test`. It must be green. If it isn't, fix the cause; never weaken
  or delete a test to make it pass.
- Update the Status table in `PLAN.md` (CLAUDE.md asks for this after every
  layer), and add the new length and speed to the "Levels (so far)" decision.
- Tell the user the 10-second check: open `index.html?level=N` and press
  Start. The snake is <new length> squares long and moves a little faster
  than on level N-1.
