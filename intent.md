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

## Boundaries
- No outside links, and no requests to any outside server: no CDNs, web fonts,
  analytics, ads or trackers. Everything ships inside the repo.
- No personal data except a nickname. No real name, email, age, location,
  photos or uploads. Avatars come from the built-in set only.
- Stored data stays in the player's own browser (localStorage) and is never
  sent anywhere.
- Plain HTML, CSS and JavaScript only: no frameworks, libraries or build tools.
- No portals or other extra game modes. The repo name is only a name.
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
