const test = require("node:test");
const assert = require("node:assert");
const Snake = require("../game.js");

test("createState gives a 3-segment snake facing right", () => {
  const s = Snake.createState();
  assert.strictEqual(s.snake.length, 3);
  assert.strictEqual(s.dir, "right");
});

test("step moves the head one cell and keeps the length", () => {
  const s = Snake.createState();
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

test("isOpposite knows each pair", () => {
  assert.ok(Snake.isOpposite("up", "down"));
  assert.ok(Snake.isOpposite("left", "right"));
  assert.ok(!Snake.isOpposite("up", "left"));
});

test("leaving the board restarts the snake (layer 1)", () => {
  const s = Snake.createState();
  s.snake[0] = { x: s.grid - 1, y: 10 };
  assert.deepStrictEqual(Snake.step(s), Snake.createState());
});
