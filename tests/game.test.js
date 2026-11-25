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

// ---- Levels ----

const level1 = require("../levels/level-1.js");
const level2 = require("../levels/level-2.js");
const level3 = require("../levels/level-3.js");

test("level 1 keeps the classic numbers", () => {
  assert.deepStrictEqual(level1.start, [
    { x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }
  ]);
  assert.strictEqual(level1.dir, "right");
  assert.strictEqual(level1.baseMs, 150);
  assert.strictEqual(level1.speedupEvery, 5);
  assert.strictEqual(level1.speedupMs, 10);
  assert.strictEqual(level1.minMs, 70);
});

test("level 2 needs more food than level 1", () => {
  assert.ok(level2.foodGoal > level1.foodGoal);
});

test("createState starts on level 1 by default, or on the level asked for", () => {
  assert.strictEqual(Snake.createState(first).level, 1);
  const s = Snake.createState(first, 2);
  assert.strictEqual(s.level, 2);
  assert.strictEqual(s.levelFood, 0);
  assert.strictEqual(s.score, 0);
  assert.strictEqual(Snake.createState(first, 99).level, 1);
});

// A state on `level` with the food right ahead and `levelFood` eaten so far.
function aboutToEat(level, levelFood, score) {
  const s = Snake.createState(first, level, score);
  const head = s.snake[0];
  return Object.assign({}, s, {
    levelFood,
    food: { x: head.x + 1, y: head.y }
  });
}

test("eating one less than the goal stays on the level", () => {
  const s = Snake.step(aboutToEat(1, level1.foodGoal - 2, 3), first);
  assert.strictEqual(s.level, 1);
  assert.strictEqual(s.levelFood, level1.foodGoal - 1);
});

test("reaching level 1's food goal starts level 2 and keeps the score", () => {
  const s = Snake.step(aboutToEat(1, level1.foodGoal - 1, 4), first);
  assert.strictEqual(s.level, 2);
  assert.strictEqual(s.levelFood, 0);
  assert.strictEqual(s.score, 5);
  assert.strictEqual(s.over, false);
  assert.deepStrictEqual(s.snake, level2.start);
});

test("the last level keeps going after its goal", () => {
  const last = Snake.LEVELS[Snake.LEVELS.length - 1];
  const s = Snake.step(aboutToEat(last.number, last.foodGoal - 1, 12), first);
  assert.strictEqual(s.level, last.number);
  assert.strictEqual(s.levelFood, last.foodGoal);
  assert.strictEqual(s.score, 13);
});

test("reaching level 2's food goal starts level 3 and keeps the score", () => {
  const s = Snake.step(aboutToEat(2, level2.foodGoal - 1, 12), first);
  assert.strictEqual(s.level, 3);
  assert.strictEqual(s.levelFood, 0);
  assert.strictEqual(s.score, 13);
  assert.deepStrictEqual(s.snake, level3.start);
});

test("speed counts the food eaten on the current level", () => {
  assert.strictEqual(Snake.stepMs(0, 2), level2.baseMs);
  assert.strictEqual(Snake.stepMs(5, 2), level2.baseMs - level2.speedupMs);
});

test("level 2 starts longer than level 1, head in the same place and same way", () => {
  assert.ok(level2.start.length > level1.start.length);
  assert.deepStrictEqual(level2.start[0], level1.start[0]);
  assert.strictEqual(level2.dir, level1.dir);
  // Every segment is on the board and no two share a cell.
  const cells = level2.start.map((p) => p.x + "," + p.y);
  assert.strictEqual(new Set(cells).size, cells.length);
  level2.start.forEach((p) => {
    assert.ok(p.x >= 0 && p.y >= 0 && p.x < Snake.GRID && p.y < Snake.GRID);
  });
});

// ---- Level 2 obstacles ----

const key = (p) => p.x + "," + p.y;

test("level 1 has no obstacles, level 2 has some, all on the board", () => {
  assert.deepStrictEqual(Snake.createState(first, 1).obstacles, []);
  assert.ok(level2.obstacles.length > 0);
  level2.obstacles.forEach((p) => {
    assert.ok(p.x >= 0 && p.y >= 0 && p.x < Snake.GRID && p.y < Snake.GRID);
  });
});

test("the snake never starts on an obstacle", () => {
  const blocks = new Set(level2.obstacles.map(key));
  level2.start.forEach((p) => assert.ok(!blocks.has(key(p)), key(p)));
});

test("driving into an obstacle ends the game and keeps the score", () => {
  const s = Object.assign(Snake.createState(first, 2), {
    snake: [{ x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }],
    dir: "right",
    moved: "right",
    food: { x: 0, y: 0 },
    score: 7
  });
  const next = Snake.step(s, first);
  assert.strictEqual(next.over, true);
  assert.strictEqual(next.score, 7);
  assert.deepStrictEqual(next.snake, s.snake);
});

test("spawnFood skips obstacles", () => {
  // A 2x2 board: the snake on one cell, obstacles on two, one cell free.
  const food = Snake.spawnFood(
    [{ x: 0, y: 0 }], 2, first, [{ x: 1, y: 0 }, { x: 0, y: 1 }]
  );
  assert.deepStrictEqual(food, { x: 1, y: 1 });
});

test("food on level 2 never lands on an obstacle", () => {
  const blocks = new Set(level2.obstacles.map(key));
  for (let i = 0; i < 400; i++) {
    const s = Snake.createState(() => i / 400, 2);
    assert.ok(!blocks.has(key(s.food)), key(s.food));
  }
});

test("level 2 is always playable: every free square can be reached from the head", () => {
  const blocks = new Set(level2.obstacles.map(key));
  const start = level2.start[0];
  const seen = new Set([key(start)]);
  const todo = [start];
  while (todo.length) {
    const p = todo.pop();
    for (const d of Object.values(Snake.DIRS)) {
      const n = { x: p.x + d.x, y: p.y + d.y };
      const k = key(n);
      if (n.x < 0 || n.y < 0 || n.x >= Snake.GRID || n.y >= Snake.GRID) continue;
      if (blocks.has(k) || seen.has(k)) continue;
      seen.add(k);
      todo.push(n);
    }
  }
  assert.strictEqual(seen.size, Snake.GRID * Snake.GRID - blocks.size);
});

test("food on level 3 never lands on an obstacle", () => {
  const blocks = new Set(level3.obstacles.map(key));
  for (let i = 0; i < 400; i++) {
    const s = Snake.createState(() => i / 400, 3);
    assert.ok(!blocks.has(key(s.food)), key(s.food));
  }
});

// ---- Level 3 snake ----

test("level 3 starts longer than level 2, head in the same place and same way", () => {
  assert.ok(level3.start.length > level2.start.length);
  assert.deepStrictEqual(level3.start[0], level2.start[0]);
  assert.strictEqual(level3.dir, level2.dir);
  const cells = level3.start.map(key);
  assert.strictEqual(new Set(cells).size, cells.length);
  level3.start.forEach((p) => {
    assert.ok(p.x >= 0 && p.y >= 0 && p.x < Snake.GRID && p.y < Snake.GRID);
  });
});

test("the snake never starts on an obstacle on level 3", () => {
  const blocks = new Set(level3.obstacles.map(key));
  level3.start.forEach((p) => assert.ok(!blocks.has(key(p)), key(p)));
});

test("level 3 starts faster than level 2", () => {
  assert.ok(level3.baseMs < level2.baseMs);
  assert.ok(level3.baseMs >= 90 && level3.baseMs <= 150);
  assert.ok(level3.baseMs > level3.minMs);
});

// ---- Level 3 obstacles ----

test("level 3 has more obstacles than level 2, at most 40", () => {
  assert.ok(level3.obstacles.length > level2.obstacles.length);
  assert.ok(level3.obstacles.length <= 40);
  const cells = level3.obstacles.map(key);
  assert.strictEqual(new Set(cells).size, cells.length);
  level3.obstacles.forEach((p) => {
    assert.ok(p.x >= 0 && p.y >= 0 && p.x < Snake.GRID && p.y < Snake.GRID);
  });
});

test("level 3's obstacles keep 2 free squares from the walls and stay off the snake's row", () => {
  const row = level3.start[0].y;
  level3.obstacles.forEach((p) => {
    assert.ok(p.x >= 2 && p.y >= 2, key(p));
    assert.ok(p.x <= Snake.GRID - 3 && p.y <= Snake.GRID - 3, key(p));
    assert.notStrictEqual(p.y, row, key(p));
  });
});

test("level 3 is always playable: every free square can be reached from the head", () => {
  const blocks = new Set(level3.obstacles.map(key));
  const start = level3.start[0];
  const seen = new Set([key(start)]);
  const todo = [start];
  while (todo.length) {
    const p = todo.pop();
    for (const d of Object.values(Snake.DIRS)) {
      const n = { x: p.x + d.x, y: p.y + d.y };
      const k = key(n);
      if (n.x < 0 || n.y < 0 || n.x >= Snake.GRID || n.y >= Snake.GRID) continue;
      if (blocks.has(k) || seen.has(k)) continue;
      seen.add(k);
      todo.push(n);
    }
  }
  assert.strictEqual(seen.size, Snake.GRID * Snake.GRID - blocks.size);
});
