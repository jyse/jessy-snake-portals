# Level files: spec

Every level is one small file in `levels/` that holds only numbers. `game.js`
reads it when the level starts. This page says what goes in a level file and
the lowest and highest value of each setting that keeps the game playable.
It's based on `levels/level-1.js`, `levels/level-2.js` and the Levels wish in
`intent.md`.

## 1. What a level file is

- One file per level: `levels/level-N.js`. It defines `var SnakeLevelN = { ... };`
  and ends with
  `if (typeof module !== "undefined") module.exports = SnakeLevelN;`
  so both the browser (`<script>` tag) and the tests (`require`) can load it.
- To add a level:
  1. Create `levels/level-N.js`.
  2. Add `<script src="levels/level-N.js"></script>` to `index.html`, before `game.js`.
  3. Add it to the `LEVELS` list in `game.js`, in both the `require` part and
     the browser part.
  After that, `index.html?level=N` starts straight at that level.
- The board is always 20×20 squares (`GRID` in `game.js`). `x` counts across
  from the left and `y` counts down from the top, both starting at 0, so both
  go from 0 to 19.

## 2. The values, with min and max

| Value | What it means | Min | Max | Level 1 | Level 2 |
|---|---|---|---|---|---|
| `number` | the level number; matches the file name | 1 | 5 | 1 | 2 |
| `foodGoal` | food to eat on this level to go to the next | 1 | 30 | 5 | 8 |
| `start` | the snake's squares, head first | 2 squares | 8 squares | 3 | 4 |
| `dir` | the way the snake moves first | `up`, `down`, `left` or `right` | | `right` | `right` |
| `baseMs` | milliseconds per step at the start (lower = faster) | 90 | 150 | 150 | 150 |
| `speedupEvery` | food eaten between speed-ups | 3 | 10 | 5 | 5 |
| `speedupMs` | milliseconds faster after each speed-up | 0 | 20 | 10 | 10 |
| `minMs` | top speed: milliseconds per step, never lower | 70 | 70 | 70 | 70 |
| `obstacles` | block squares that end the game when hit (optional: left out means none) | 0 squares | 40 squares | none | 16 |

Why these limits:
- **`number`**: intent.md asks for exactly 5 levels.
- **`foodGoal`**: at least 1 so a level can be finished. At most 30 keeps a
  level to a few minutes, and even an 8-long start plus 30 food (38 squares)
  is under 10% of the board.
- **`start`**: at least 2 so the snake has a head and a body. At most 8 so a
  straight snake still leaves 5 clear squares ahead of its head (see the
  rules below) on a 20-wide board.
- **`baseMs`**: 150 is level 1's speed; a level should never start slower than
  that. 90 is the fastest start that still gives time to react, and it stays
  above the top speed.
- **`speedupEvery`** and **`speedupMs`**: speed-ups at most every 3 food and at
  most 20 ms keep each jump in speed small. `speedupMs` of 0 means the level
  never speeds up.
- **`minMs`**: always 70, because intent.md says every level shares the same
  maximum speed.
- **`obstacles`**: 40 squares is 10% of the board. More than that leaves too
  little room to turn.

## 3. Rules that keep a level playable

These are checked across values, not one value at a time.

- **Start shape:** the `start` squares are side by side in a straight line,
  head first. They're all on the board and no square is listed twice.
- **Direction:** `dir` points away from the body, so the head minus the second
  square equals `dir`. The first step can never go back into the body.
- **Clear space ahead:** at least 5 empty squares in front of the head before a
  wall or a block. At 150 ms per step that's ¾ of a second to react.
- **Obstacles:**
  - all on the board, and no square listed twice;
  - none on a `start` square or in the clear space ahead of the head;
  - at least 2 free squares between a block and any wall;
  - at least 2 free squares between separate blocks.
  The last two mean there are no 1-square-wide corridors to get trapped in.
- **Reachable:** starting from the head, every square that isn't a block can be
  reached. (`tests/game.test.js` checks this for level 2 with a flood fill.)
- **Room to grow:** `start` length + `foodGoal` must be far below the number of
  free squares. Within the limits above it's at most 38 of at least 360.
- **Speed:** `minMs` ≤ `baseMs`.

## 4. Each level harder than the one before

From the Levels wish in intent.md. Level N compared with level N−1:

| Value | Rule |
|---|---|
| `foodGoal` | higher |
| `start` | longer |
| `obstacles` | more squares |
| `baseMs` | lower or equal ("a bit faster") |

**Known gap:** level 2's `baseMs` is 150, the same as level 1. That's allowed by
the "lower or equal" rule, but level 2 doesn't start faster yet, as intent.md
asks. Lowering it (for example to 140) is a change for a later layer.

## 5. Example: level-2.js

```js
// Level 2: like level 1, but needs more food and the snake starts longer.
var SnakeLevel2 = {
  number: 2,
  foodGoal: 8,
  start: [
    { x: 5, y: 10 }, // head, same place as level 1
    { x: 4, y: 10 },
    { x: 3, y: 10 },
    { x: 2, y: 10 }
  ],
  dir: "right",
  // Blocks that end the game when hit. Kept away from the walls, from each
  // other and from the snake's starting row, so every free square can still
  // be reached.
  obstacles: [
    { x: 4, y: 4 },   { x: 5, y: 4 },   { x: 4, y: 5 },   { x: 5, y: 5 },
    { x: 14, y: 4 },  { x: 15, y: 4 },  { x: 14, y: 5 },  { x: 15, y: 5 },
    { x: 4, y: 14 },  { x: 5, y: 14 },  { x: 4, y: 15 },  { x: 5, y: 15 },
    { x: 14, y: 14 }, { x: 15, y: 14 }, { x: 14, y: 15 }, { x: 15, y: 15 }
  ],
  baseMs: 150,
  speedupEvery: 5,
  speedupMs: 10,
  minMs: 70
};

if (typeof module !== "undefined") module.exports = SnakeLevel2;
```

```
. . . . . . . . . . . . . . . . . . . .   y=0
. . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . .
. . . . # # . . . . . . . . # # . . . .   y=4
. . . . # # . . . . . . . . # # . . . .   y=5
. . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . .
. . o o o @ → → → → → → → → → → → → → →   y=10: snake, 14 clear squares ahead
. . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . .
. . . . # # . . . . . . . . # # . . . .   y=14
. . . . # # . . . . . . . . # # . . . .   y=15
. . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . .   y=19
```

How it meets the spec:
- **Limits:** every value is inside its min and max: 8 food, 4 squares long,
  150 ms, a speed-up every 5 food by 10 ms, top speed 70, 16 block squares.
- **Start:** a straight line on row 10, head at x=5, body to its left, `dir`
  right, so it moves away from its body.
- **Clear space ahead:** 14 squares (x=6 to x=19), well over the 5 needed.
- **Obstacles:** four 2×2 blocks, all off the snake's row. They have 4 free
  squares to the nearest wall and 8 between blocks, both over the 2 needed.
- **Reachable:** every free square can be reached, and a test checks this.
- **Room to grow:** 4 + 8 = 12 squares out of 384 free.
- **Harder than level 1:** more food (8 > 5), longer start (4 > 3), more
  blocks (16 > 0). Same start speed (150), see the known gap above.

## 6. Template for a new level

Copy this to `levels/level-N.js`, replace every `N`, and fill in the values
following the limits and rules above.

```js
// Level N: what makes it harder than level N-1.
var SnakeLevelN = {
  number: N,              // 1 to 5, matches the file name
  foodGoal: 0,            // 1 to 30, higher than level N-1
  start: [                // 2 to 8 squares, head first, in a straight line,
    { x: 0, y: 0 }        // longer than level N-1
  ],
  dir: "right",           // points away from the body
  obstacles: [            // 0 to 40 squares, more than level N-1; 2+ free
  ],                      // squares from walls and between blocks
  baseMs: 150,            // 90 to 150, lower or equal to level N-1
  speedupEvery: 5,        // 3 to 10
  speedupMs: 10,          // 0 to 20
  minMs: 70               // always 70
};

if (typeof module !== "undefined") module.exports = SnakeLevelN;
```
