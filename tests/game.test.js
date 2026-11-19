const test = require("node:test");
const assert = require("node:assert");
const Snake = require("../game.js");

const first = () => 0; // fake random: always picks the first free cell

test("createState gives a 3-segment snake facing right, score 0, with food", () => {
  const s = Snake.createState();
  assert.strictEqual(s.snake.length, 3);
  assert.strictEqual(s.dir, "right");
  assert.strictEqual(s.score, 0);
  assert.ok(s.food);
});

test("step moves the head one cell and keeps the length", () => {
  const s = Snake.createState();
  s.food = { x: 0, y: 0 }; // out of the way
  const next = Snake.step(s);
  assert.deepStrictEqual(next.snake[0], { x: s.snake[0].x + 1, y: s.snake[0].y });
  assert.strictEqual(next.snake.length, s.snake.length);
});

test("step does not change the input state", () => {
  const s = Snake.createState();
  const before = JSON.stringify(s);
  Snake.step(s);
  assert.strictEqual(JSON.stringify(s), before);
});

test("turn changes direction and the next step follows it", () => {
  const s = Snake.turn(Snake.createState(), "up");
  s.food = { x: 0, y: 0 };
  assert.strictEqual(s.dir, "up");
  const head = s.snake[0];
  assert.deepStrictEqual(Snake.step(s).snake[0], { x: head.x, y: head.y - 1 });
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

test("turn keeps food and score", () => {
  const s = Snake.createState();
  s.score = 4;
  const t = Snake.turn(s, "up");
  assert.strictEqual(t.score, 4);
  assert.deepStrictEqual(t.food, s.food);
});

test("isOpposite knows each pair", () => {
  assert.ok(Snake.isOpposite("up", "down"));
  assert.ok(Snake.isOpposite("left", "right"));
  assert.ok(!Snake.isOpposite("up", "left"));
});

test("eating food grows the snake by one and adds to the score", () => {
  const s = Snake.createState();
  const head = s.snake[0];
  s.food = { x: head.x + 1, y: head.y }; // right in front
  const next = Snake.step(s);
  assert.strictEqual(next.snake.length, s.snake.length + 1);
  assert.deepStrictEqual(next.snake[0], s.food);
  assert.strictEqual(next.score, 1);
  assert.strictEqual(next.eaten, 1);
  assert.notDeepStrictEqual(next.food, s.food); // new food placed
});

test("food never spawns on the snake", () => {
  const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
  for (let i = 0; i < 50; i++) {
    const f = Snake.spawnFood(snake, 3, Math.random);
    assert.ok(!snake.some(c => c.x === f.x && c.y === f.y));
  }
  assert.deepStrictEqual(Snake.spawnFood(snake, 3, first), { x: 0, y: 1 });
});

test("spawnFood returns null when the board is full", () => {
  const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }];
  assert.strictEqual(Snake.spawnFood(snake, 2, first), null);
});

test("speed goes up every 5 foods and stops at the maximum", () => {
  assert.strictEqual(Snake.stepMs(0), Snake.BASE_STEP_MS);
  assert.strictEqual(Snake.stepMs(4), Snake.BASE_STEP_MS);
  assert.strictEqual(Snake.stepMs(5), Snake.BASE_STEP_MS - 10);
  assert.strictEqual(Snake.stepMs(1000), Snake.MIN_STEP_MS);
});

test("leaving the board restarts the game (until layer 4)", () => {
  const s = Snake.createState(first);
  s.snake[0] = { x: s.grid - 1, y: 10 };
  s.score = 7;
  assert.deepStrictEqual(Snake.step(s, first), Snake.createState(first));
});
