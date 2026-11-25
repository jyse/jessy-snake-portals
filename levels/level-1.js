// Level 1: the classic game.
var SnakeLevel1 = {
  number: 1,
  foodGoal: 5, // food to eat on this level to go to the next one
  start: [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 }
  ],
  dir: "right",
  // Speed: start at baseMs per step, get speedupMs faster every
  // speedupEvery pieces of food, never faster than minMs.
  baseMs: 150,
  speedupEvery: 5,
  speedupMs: 10,
  minMs: 70
};

if (typeof module !== "undefined") module.exports = SnakeLevel1;
