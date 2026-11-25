# Levels

Rules for level files are in `spec.md` (values with min/max, playability
rules, how to add a level). The Levels wish is in intent.md; in short:

- Exactly 5 levels, fixed built-in layouts. No level editor, no random
  layouts, no portals or separate game modes.
- Each level from 2 to 5 is harder than the one before: more food to finish,
  a longer start snake, more obstacles, and a faster start speed.
- Every level is always playable: clear space ahead of the snake at the
  start, obstacles never close off part of the board, and food only appears
  on empty squares the snake can reach.
- A new level file must also be added to `index.html` and to `LEVELS` in
  `game.js` (both lists).
- Use the skills to change a level: /create-food, /create-snake,
  /create-obstacles. After a level change, update "Levels (so far)" in PLAN.md.
