# Snake — Intent

## Outcome
A classic Snake game that runs in the browser, built with plain HTML, CSS and
JavaScript only (no frameworks, no build step, no server).

- **Start screen:** the player types a nickname and picks an avatar from a small
  set of built-in options. The start screen shows that nickname and avatar,
  plus the best score so far, and a Start button.
- **Play:** the snake moves on a grid. Eating food makes it one segment longer
  and adds to the score. It speeds up a little every few pieces of food, up to
  a maximum speed.
- **Game over:** hitting a wall or its own body ends the game. The screen shows
  the score, the best score, and lets the player play again or go back to the
  start screen.
- **Levels:** there are 5 levels. Level 1 is the classic game above. Eat the
  level's target amount of food to finish it and go on to the next level. Each
  level from 2 to 5 is a little harder than the one before:
  - more food needed to finish it,
  - a longer snake at the start,
  - more obstacles on the board (hitting one ends the game, like a wall),
  - a slightly faster starting speed (still up to the same maximum speed).

  Every level is always playable: the snake starts with clear space in front of
  it, obstacles never close off part of the board, and food only appears on
  empty cells the snake can reach.
- The play screen shows the current level. The game-over screen shows the level
  reached.
- **Controls:** arrow keys or WASD on a keyboard; swipe or on-screen arrow
  buttons on a touch screen.
- **Memory:** nickname, avatar choice and best score are saved in this
  browser's localStorage, so they are still there on the next visit.

## Done when
1. Opening `index.html` directly from disk in a current browser, with no
   internet connection, shows a start screen where you can enter a nickname
   and pick an avatar, and both then appear on the start screen.
2. During a game, eating food grows the snake and raises the score, and
   steering into a wall or into the snake's own body ends the game and shows
   the final score. This works with the keyboard on a laptop and with touch
   on a phone.
3. After reloading the page, the nickname, avatar and best score from the last
   session are still shown on the start screen.
4. Finishing a level's food target moves you to the next level. Levels 2 to 5
   each start with a longer snake, more obstacles and a faster speed than the
   level before. On every level the snake can start safely and reach every
   piece of food.

## Boundaries
- No outside links, and no requests to any outside server: no CDNs, web fonts,
  analytics, ads or trackers. Everything ships inside the repo.
- No personal data except a nickname. No real name, email, age, location,
  photos or uploads. Avatars come from the built-in set only.
- Stored data stays in the player's own browser (localStorage) and is never
  sent anywhere.
- Plain HTML, CSS and JavaScript only: no frameworks, libraries or build tools.
- No portals and no separate game modes. Levels are harder boards in the
  same classic game. The repo name is only a name.
- Exactly 5 levels, with fixed built-in layouts. No level editor, and no
  random layouts that might be impossible.
- Do not copy art, sound or branding from an existing Snake game.

## Open questions
- What should the avatar set be: emoji, or simple drawn icons? How many?
- Nickname rules: maximum length? Which characters are allowed? What if it's
  left blank?
- Sound: none, simple beeps, or sound with a mute button?
- Should there be a pause key (e.g. Space or P)?
- Grid size and look: a fixed board size, or one that fits the screen? Any
  colour theme?
- Should the player be able to reset the saved best score or forget their
  nickname?
- Levels: how much food finishes each level, and how long is the snake at the
  start of each? (e.g. food 5/8/11/14/17, start length 3/4/5/6/7)
- Levels: what do the obstacles look like and where do they go on each level?
- Levels: what happens after finishing level 5: a "You win" screen, or keep
  playing?
- Levels: after game over, does Play again restart at level 1 or the level you
  reached? Can players pick a level they've already reached on the start screen?
- Levels: does the score carry over between levels? Is there one best score, or
  one per level? Should the highest level reached be saved in localStorage?
- Levels: is there a short pause or message between levels ("Level 2!")?
