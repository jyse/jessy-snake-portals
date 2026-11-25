// Level 3: like level 2, but needs more food to finish.
var SnakeLevel3 = {
  number: 3,
  foodGoal: 11,
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

if (typeof module !== "undefined") module.exports = SnakeLevel3;
