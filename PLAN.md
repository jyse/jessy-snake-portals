# Snake — 5-layer build plan

We build the game from `intent.md` in 5 layers. Each layer leaves a game
you can open and check in about 10 seconds. Build one layer at a time.

## Status
| Layer | What | Status |
|---|---|---|
| 1 | Skeleton | Done |
| 2 | Controls | Done |
| 3 | Food and score | Done |
| 4 | Game over | Built, not committed yet |
| 5 | Your style (nickname and avatar) | To do |
| L2 | Levels: level files, level 2, `?level=N` | Done (branch `level-2`) |
| L2b | Level 2: snake starts 4 long | Done (branch `level-2`) |
| L2c | Level 2: obstacles | Done (branch `level-2`) |

## File layout
```
index.html      page structure: start screen, board, touch buttons, game-over screen
style.css       look and layout, fits phone and laptop
game.js         pure game logic (no DOM): state, step, turn, food, collisions, speed
main.js         DOM glue: drawing on <canvas>, input, screens, localStorage
levels/level-N.js   one level's numbers: food goal, start snake, speed
package.json    only "test": "node --test tests/*.test.js", no dependencies
tests/game.test.js   unit tests for game.js using Node's built-in test runner
```
- We use classic `<script>` tags, not ES modules, because modules don't load
  over `file://`. `game.js` ends with
  `if (typeof module !== "undefined") module.exports = Snake;` so Node can test it.
- No outside links of any kind. Avatars are emoji, so there are no image files.
- The test command lists the files (`tests/*.test.js`) because Node 21 doesn't
  accept a folder there.

## Decisions for the open questions in intent.md
- **Avatars:** 6 emoji 🐍 🐢 🦊 🐸 🐙 🦄
- **Nickname:** 1 to 12 characters (letters, digits, space, `-`, `_`), trimmed.
  If blank, we use "Player".
- **Sound:** none
- **Pause:** Space or P
- **Board:** fixed 20×20 grid, scaled to fit the screen. Dark green theme with
  our own colours.
- **Reset:** a small "Reset best score" link on the start screen
- **Levels (so far):** level 1 needs 5 food, level 2 needs 8. Level 1's
  snake starts 3 long, level 2's starts 4 long (head in the same place).
  Level 1 has no obstacles; level 2 has four 2×2 grey blocks, one per
  quarter, kept off the walls, each other and the snake's row so every free
  square stays reachable. The food counts
  per level; the score carries over. A new level starts on a fresh board (the
  snake goes back to its start). After the last level's goal you keep playing.
  No "Level 2!" message yet. Still open: obstacles, levels 3 to 5, a win screen.

---

## Layer 1 — Skeleton ✅
**Files:** `index.html`, `style.css`, `game.js`, `main.js`, `package.json`, `tests/game.test.js`
- Canvas board with a 3-segment snake moving right on a timer (150 ms per step).
- `game.js`: `createState()` and `step(state)`.

**10-second check:** double-click `index.html`. You see a board and a snake
sliding right. `npm test` passes.

## Layer 2 — Controls ✅
**Files:** `game.js` (`turn(state, dir)`, which blocks reversing straight into
yourself), `main.js` (keys, swipe, buttons), `index.html` (4 arrow buttons),
`style.css` (buttons shown only on touch screens via `@media (pointer: coarse)`), tests
- Arrow keys and WASD. Inputs are queued (up to 2) so quick presses both count.
- Swipe on the board, plus on-screen arrow buttons. Space/P pauses.

**10-second check:** steer in a square with the arrows, then with WASD. Press
Space and it freezes. For touch: in Chrome DevTools, turn on device mode
(Cmd+Shift+M), reload, and tap the buttons or swipe.

## Layer 3 — Food and score ✅
**Files:** `game.js` (spawn food on an empty cell, grow, score, speed),
`main.js` (draw food, show score), `index.html` (score display), `style.css`, tests
- Eating adds +1 score and +1 segment. Every 5 foods the step gets 10 ms faster,
  down to a 70 ms minimum.

**10-second check:** eat 2 or 3 pieces. The snake gets longer and the score counts up.

## Layer 4 — Game over ✅
**Files:** `game.js` (hitting a wall or yourself sets `over = true`),
`main.js` (screen switching, best score in localStorage under `snake.best`),
`index.html` (start screen with Start button and best score, game-over screen
with score, best, **Play again** and **Back to start**), `style.css`, tests
- Moving into the cell the tail is leaving does not end the game.

**10-second check:** press Start and drive into a wall. The game-over screen
shows your score and best. Press Play again, score 1, die again, and the best
score holds. Reload the page and the best score is still on the start screen.

## Layer 5 — Your style (nickname and avatar)
**Files:** `index.html` (nickname input and avatar picker on the start screen),
`main.js` (validate the nickname, save to localStorage as `snake.nickname` and
`snake.avatar`, show both on the start screen and on the HUD during play,
reset-best link), `game.js` (a `cleanNickname()` helper), `style.css`, tests
- Tests: `cleanNickname` trims, cuts to 12 characters, removes characters that
  aren't allowed, and uses "Player" if blank.

**10-second check:** type a nickname and pick 🦊. Both show on the start screen.
Reload, and the nickname, 🦊 and best score are all still there.

---

## Levels, step 1: level files, level 2, `?level=N`
**Files:** `levels/level-1.js` (the classic numbers, moved out of `game.js`),
`levels/level-2.js` (same, but needs more food), `game.js` (`createState(rand,
level, score)`, per-level speed, going to the next level at the food goal),
`main.js` (`?level=N`, level and food on the HUD), `index.html` (level scripts
and HUD), tests
- Level 1 plays exactly as before, apart from moving on to level 2 after 5 food.
- `index.html?level=N` starts Start and Play again at level N. Missing or
  unknown numbers mean level 1. Later level files only need adding to
  `index.html` and the `LEVELS` list in `game.js`.

**10-second check:** open `index.html`, eat 5 food: the HUD switches to
Level 2 · Food 0/8 and the score stays. Open `index.html?level=2` and press
Start: it begins at Level 2. `npm test` passes.

## Levels, step 2: level 2 starts longer
**Files:** `levels/level-2.js` (one more segment at the tail), tests
- The head stays at the same place and heads right, so there are still 14
  free cells ahead before the wall.

**10-second check:** open `index.html?level=2` and press Start: the snake is
4 squares long and steers normally. `npm test` passes.

## Levels, step 3: obstacles on level 2
**Files:** `levels/level-2.js` (`obstacles` list), `game.js` (obstacles in the
state, hitting one ends the game, food skips them), `main.js` (draw them),
`style.css` (`--obstacle` colour), tests
- A level without an `obstacles` list has none, so `level-1.js` is unchanged.
- A test flood-fills from the snake's head to prove every free square can be
  reached, so a future layout can't wall off part of the board.

**10-second check:** open `index.html?level=2` and press Start: 4 grey blocks
show, driving into one ends the game, and food never appears on one.
`npm test` passes.

---

## Final check (matches intent.md "Done when")
1. Turn off Wi-Fi and open `index.html` from disk. Set a nickname and avatar.
2. Play with the keyboard on a laptop, and with touch in DevTools device mode or on a phone.
3. Reload. The nickname, avatar and best score are still there.
4. `npm test` passes, and `grep -nE "https?://" index.html style.css game.js main.js levels/*.js`
   finds no outside links.
