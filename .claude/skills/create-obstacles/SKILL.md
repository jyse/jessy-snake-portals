---
name: create-obstacles
description: Set the obstacles (blocks) for a Snake level, a few more than the level before, within the limits in spec.md, never on the snake's start and never closing off part of the board. Use when the user types /create-obstacles N, or asks to add or change the blocks in level N. Creates levels/level-N.js from the level before if it doesn't exist yet.
---

# Create the obstacles for level N

The level number is: $ARGUMENTS

Follow CLAUDE.md as always: show a plan and wait for approval before
changing any files, and ask before editing anything in `tests/`. Use the
Edit or Write tools for `tests/` (never shell commands), so the ask rules
in `.claude/settings.json` fire.

## 1. Check the level number
- N must be a whole number from 2 to 5 (spec.md: exactly 5 levels; level 1
  has no level before it). Otherwise stop and say why.
- `levels/level-(N-1).js` must exist. If it doesn't, stop and say that level
  N-1 needs to be made first.

## 2. Read the rules
- Read `spec.md`: the `obstacles` row in the values table (min and max), the
  rules "Clear space ahead", "Obstacles", "Reachable" and "Room to grow",
  and the "each level harder" rules.
- Read `levels/level-(N-1).js`, and `levels/level-N.js` if it exists.

## 3. If levels/level-N.js doesn't exist yet
Plan to start it as a copy of `levels/level-(N-1).js`, changing only:
- `var SnakeLevel(N-1)` → `var SnakeLevelN`, in both places;
- `number: N`;
- the comment on the first line.
Leave the food goal, the snake and the speed as they are; other skills
change those.

A new file is only loaded if it's also added in two places, so plan those too:
- `index.html`: `<script src="levels/level-N.js"></script>` after the level
  before's script and before `game.js`;
- `game.js`: add it to `LEVELS`, in both the `require` list and the browser list.

## 4. How many blocks
- Blocks are 2×2 squares (4 squares each), like levels 2 and 3.
- New count = level N-1's obstacle squares + 8, which means two more 2×2 blocks
  (level 2 had 16 and level 3 has 24).
- It must be more than level N-1's and at most spec.md's maximum (40). If +8
  would go over 40, add only as many blocks as fit. If level N-1 is already
  at 40, stop and tell the user there's no room for more.
- If level N already has more obstacle squares than level N-1, within the
  limits, say so and ask before changing it.

## 5. Where to put them
- Keep all of level N-1's blocks where they are, and add the new ones.
- Every new block must follow spec.md's "Obstacles" rules:
  - all squares on the board, none listed twice;
  - at least 2 free squares between the block and every wall (so x and y
    from 2 to 17);
  - at least 2 free squares between it and every other block, sideways and
    up/down, so there are no 1-square corridors;
  - not on any `start` square, and not on the snake's starting row in front
    of the head, so the clear space ahead stays at least 5 squares (keep the
    whole starting row clear, like levels 2 and 3).
- Prefer a balanced layout, with pairs mirrored top/bottom or left/right,
  like the existing blocks.
- If no place meets all the rules, stop and tell the user rather than
  bending a rule.

## 6. Never blocking the board
- **Reachable:** starting from the snake's head, every square that isn't a
  block can be reached (flood fill). If any square can't be reached, pick
  other places.
- **Room to grow:** `start` length + `foodGoal` stays far below the free
  squares (400 minus the obstacle squares).
- **Food:** `spawnFood` in `game.js` already skips blocks; don't add food
  code. Check `createState` and `step` still pass `obstacles` to it.

## 7. Tests
If `tests/game.test.js` doesn't yet check level N's blocks (like the level 3
tests do), propose the same tests for level N, and ask before adding them:
- more obstacles than level N-1, at most 40, all on the board, none twice;
- 2 free squares from the walls, and off the snake's starting row;
- every free square reachable from the head;
- the snake never starts on an obstacle;
- food never lands on an obstacle.

## 8. Show the plan, then make the change
The plan lists:
- the old and new number of obstacle squares, and why it's within the limits;
- the new blocks' squares;
- a 20×20 picture of the board with the blocks (`#`), the snake (`o`, head
  `@`) and the clear space ahead (`→`);
- how each rule in step 5 and step 6 is met;
- every file that changes.
After approval, make the changes.

## 9. Check
- Run `npm test`. It must be green. If it isn't, fix the cause; never weaken
  or delete a test to make it pass.
- Update the Status table in `PLAN.md` (CLAUDE.md asks for this after every
  layer), and describe the new layout in the "Levels (so far)" decision.
- Tell the user the 10-second check: open `index.html?level=N` and press
  Start. You see the new blocks, and driving into one ends the game.
