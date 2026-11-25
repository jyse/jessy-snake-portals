// Level 5: like level 4, but needs more food, the snake starts longer (one
// square further right so it fits) and a bit faster, and one more block in
// the middle above the snake's row.
var SnakeLevel5 = {
  number: 5,
  foodGoal: 17,
  start: [
    { x: 6, y: 10 }, // head, one square further right: 7 long fits x=0 to 6
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 },
    { x: 2, y: 10 },
    { x: 1, y: 10 },
    { x: 0, y: 10 }
  ],
  dir: "right",
  // Blocks that end the game when hit. Kept away from the walls, from each
  // other and from the snake's starting row, so every free square can still
  // be reached.
  obstacles: [
    { x: 4, y: 4 },   { x: 5, y: 4 },   { x: 4, y: 5 },   { x: 5, y: 5 },
    { x: 9, y: 4 },   { x: 10, y: 4 },  { x: 9, y: 5 },   { x: 10, y: 5 },
    { x: 14, y: 4 },  { x: 15, y: 4 },  { x: 14, y: 5 },  { x: 15, y: 5 },
    { x: 4, y: 8 },   { x: 5, y: 8 },   { x: 4, y: 9 },   { x: 5, y: 9 },
    { x: 9, y: 8 },   { x: 10, y: 8 },  { x: 9, y: 9 },   { x: 10, y: 9 },
    { x: 14, y: 8 },  { x: 15, y: 8 },  { x: 14, y: 9 },  { x: 15, y: 9 },
    { x: 4, y: 14 },  { x: 5, y: 14 },  { x: 4, y: 15 },  { x: 5, y: 15 },
    { x: 9, y: 14 },  { x: 10, y: 14 }, { x: 9, y: 15 },  { x: 10, y: 15 },
    { x: 14, y: 14 }, { x: 15, y: 14 }, { x: 14, y: 15 }, { x: 15, y: 15 }
  ],
  baseMs: 110,
  speedupEvery: 5,
  speedupMs: 10,
  minMs: 70
};

if (typeof module !== "undefined") module.exports = SnakeLevel5;
