const test = require("node:test");
const assert = require("node:assert");
const Snake = require("../game.js");

// A fixed "random" so tests always get the same food position.
const first = () => 0;

// A state with the food placed right in front of the head.
function stateWithFoodAhead() {
  const s = Snake.createState(first);
  const head = s.snake[0];
  return Object.assign({}, s, { food: { x: head.x + 1, y: head.y } });
}

// ---- Layer 1: moving ----

test("createState gives a 3-segment snake facing right, score 0, not over", () => {
  const s = Snake.createState();
  assert.strictEqual(s.snake.length, 3);
  assert.strictEqual(s.dir, "right");
  assert.strictEqual(s.score, 0);
  assert.strictEqual(s.over, false);
});

test("step moves the head one cell and keeps the length", () => {
  const s = Snake.createState(first);
  const next = Snake.step(s, first);
  assert.deepStrictEqual(next.snake[0], { x: s.snake[0].x + 1, y: s.snake[0].y });
  assert.strictEqual(next.snake.length, s.snake.length);
});

test("step does not change the input state", () => {
  const s = stateWithFoodAhead();
  const before = JSON.stringify(s);
  Snake.step(s, first);
  assert.strictEqual(JSON.stringify(s), before);
});


// ---- Layer 2: turning ----

test("turn changes direction and the next step follows it", () => {
  const s = Snake.turn(Snake.createState(first), "up");
  assert.strictEqual(s.dir, "up");
  const head = s.snake[0];
  assert.deepStrictEqual(Snake.step(s, first).snake[0], { x: head.x, y: head.y - 1 });
});

test("turn ignores reversing straight back", () => {
  const s = Snake.createState(); // heading right
  assert.strictEqual(Snake.turn(s, "left"), s);
});

test("turn ignores the same or an unknown direction", () => {
  const s = Snake.createState();
  assert.strictEqual(Snake.turn(s, "right"), s);
  assert.strictEqual(Snake.turn(s, "sideways"), s);
});

test("turn keeps the food and score", () => {
  const s = Object.assign(stateWithFoodAhead(), { score: 3 });
  const t = Snake.turn(s, "up");
  assert.deepStrictEqual(t.food, s.food);
  assert.strictEqual(t.score, 3);
});

test("isOpposite knows each pair", () => {
  assert.ok(Snake.isOpposite("up", "down"));
  assert.ok(Snake.isOpposite("left", "right"));
  assert.ok(!Snake.isOpposite("up", "left"));
});

// ---- Layer 3: food, score and speed ----

test("the starting food is on the board and not on the snake", () => {
  for (let i = 0; i < 50; i++) {
    const s = Snake.createState();
    assert.ok(s.food.x >= 0 && s.food.x < s.grid && s.food.y >= 0 && s.food.y < s.grid);
    assert.ok(!s.snake.some((p) => p.x === s.food.x && p.y === s.food.y));
  }
});

test("spawnFood picks the only empty cell when the board is nearly full", () => {
  // 3x3 board, snake on every cell except (2, 2).
  const snake = [];
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      if (!(x === 2 && y === 2)) snake.push({ x, y });
    }
  }
  assert.deepStrictEqual(Snake.spawnFood(snake, 3, () => 0), { x: 2, y: 2 });
  assert.deepStrictEqual(Snake.spawnFood(snake, 3, () => 0.999), { x: 2, y: 2 });
});

test("spawnFood returns null when the board is full", () => {
  const snake = [];
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) snake.push({ x, y });
  assert.strictEqual(Snake.spawnFood(snake, 2), null);
});

test("eating grows the snake by one and adds one to the score", () => {
  const s = stateWithFoodAhead();
  const next = Snake.step(s, first);
  assert.strictEqual(next.snake.length, s.snake.length + 1);
  assert.strictEqual(next.score, s.score + 1);
  assert.deepStrictEqual(next.snake[0], s.food);
});

test("after eating, new food appears somewhere not on the snake", () => {
  const next = Snake.step(stateWithFoodAhead());
  assert.ok(next.food);
  assert.ok(!next.snake.some((p) => p.x === next.food.x && p.y === next.food.y));
});

test("not eating leaves the score and food alone", () => {
  const s = Snake.createState(first);
  s.food = { x: 0, y: 0 }; // far from the head
  const next = Snake.step(s, first);
  assert.strictEqual(next.score, 0);
  assert.deepStrictEqual(next.food, { x: 0, y: 0 });
});

test("speed goes up every 5 pieces of food and stops at the maximum", () => {
  assert.strictEqual(Snake.stepMs(0), Snake.BASE_MS);
  assert.strictEqual(Snake.stepMs(4), Snake.BASE_MS);
  assert.strictEqual(Snake.stepMs(5), Snake.BASE_MS - 10);
  assert.strictEqual(Snake.stepMs(10), Snake.BASE_MS - 20);
  assert.strictEqual(Snake.stepMs(1000), Snake.MIN_MS);
});

// ---- Layer 4: game over ----

// Builds a state from a list of [x, y] cells (head first), with the food
// out of the way in the top-left corner.
function stateFrom(cells, dir) {
  return Object.assign(Snake.createState(first), {
    snake: cells.map(([x, y]) => ({ x, y })),
    dir,
    food: { x: 0, y: 0 },
    score: 4
  });
}

test("hitting a wall ends the game and keeps the snake and score", () => {
  const s = stateFrom([[19, 10], [18, 10], [17, 10]], "right");
  const next = Snake.step(s, first);
  assert.strictEqual(next.over, true);
  assert.deepStrictEqual(next.snake, s.snake);
  assert.strictEqual(next.score, 4);
});

test("every wall ends the game", () => {
  assert.ok(Snake.step(stateFrom([[0, 5], [1, 5]], "left"), first).over);
  assert.ok(Snake.step(stateFrom([[5, 0], [5, 1]], "up"), first).over);
  assert.ok(Snake.step(stateFrom([[5, 19], [5, 18]], "down"), first).over);
});

test("hitting its own body ends the game", () => {
  // Head at (5,5); turning right runs into (6,5), which is body, not tail.
  const s = stateFrom([[5, 5], [5, 6], [6, 6], [6, 5], [6, 4]], "right");
  assert.strictEqual(Snake.step(s, first).over, true);
});

test("moving into the cell the tail is leaving is allowed", () => {
  // A 2x2 loop: the head moves down into where the tail was.
  const s = stateFrom([[5, 5], [6, 5], [6, 6], [5, 6]], "down");
  const next = Snake.step(s, first);
  assert.strictEqual(next.over, false);
  assert.deepStrictEqual(next.snake[0], { x: 5, y: 6 });
});

test("a finished game does not change", () => {
  const s = Object.assign(Snake.createState(first), { over: true });
  assert.strictEqual(Snake.step(s, first), s);
});

// ---- Rule: a quick reverse must never end the game ----

test("moving right and pressing left does not end the game", () => {
  let s = Snake.createState(first); // heading right
  s = Snake.turn(s, "left");
  s = Snake.step(s, first);
  assert.strictEqual(s.over, false);
  assert.strictEqual(s.dir, "right");
});

test("moving right and pressing up then left very fast (before the next step) does not end the game", () => {
  let s = Snake.createState(first); // heading right
  s = Snake.turn(s, "up");
  s = Snake.turn(s, "left"); // pressed before the snake has moved up
  s = Snake.step(s, first);
  assert.strictEqual(s.over, false);
});

test("moving right and pressing up then left, one turn per step, does not end the game", () => {
  let s = Snake.createState(first); // heading right
  s = Snake.step(Snake.turn(s, "up"), first);
  s = Snake.step(Snake.turn(s, "left"), first);
  assert.strictEqual(s.over, false);
});
