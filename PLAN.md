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

## File layout
```
index.html      page structure: start screen, board, touch buttons, game-over screen
style.css       look and layout, fits phone and laptop
game.js         pure game logic (no DOM): state, step, turn, food, collisions, speed
main.js         DOM glue: drawing on <canvas>, input, screens, localStorage
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

## Final check (matches intent.md "Done when")
1. Turn off Wi-Fi and open `index.html` from disk. Set a nickname and avatar.
2. Play with the keyboard on a laptop, and with touch in DevTools device mode or on a phone.
3. Reload. The nickname, avatar and best score are still there.
4. `npm test` passes, and `grep -nE "https?://" index.html style.css game.js main.js`
   finds no outside links.
