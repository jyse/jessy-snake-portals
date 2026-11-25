// Checks every levels/level-N.js against spec.md: the values stay inside
// their min and max, the level is playable, and each level is harder than
// the one before. New level files are picked up automatically.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const Snake = require(path.join(ROOT, "game.js"));
const GRID = Snake.GRID;

// Every levels/level-N.js file, sorted by N.
const files = fs.readdirSync(path.join(ROOT, "levels"))
  .map((name) => name.match(/^level-(\d+)\.js$/))
  .filter(Boolean)
  .map((m) => ({ n: Number(m[1]), file: m[0] }))
  .sort((a, b) => a.n - b.n);

const levels = files.map((f) => require(path.join(ROOT, "levels", f.file)));

// ---- Helpers ----

const key = (c) => c.x + "," + c.y;
const onBoard = (c) => c.x >= 0 && c.x < GRID && c.y >= 0 && c.y < GRID;
const isWhole = (v) => Number.isInteger(v);
const obstaclesOf = (level) => level.obstacles || [];

// Splits obstacle squares into blocks: squares that touch side by side
// belong to the same block.
function blocks(obstacles) {
  const left = new Map(obstacles.map((c) => [key(c), c]));
  const result = [];
  while (left.size > 0) {
    const first = left.values().next().value;
    left.delete(key(first));
    const block = [first];
    for (let i = 0; i < block.length; i++) {
      for (const d of Object.values(Snake.DIRS)) {
        const k = key({ x: block[i].x + d.x, y: block[i].y + d.y });
        if (left.has(k)) { block.push(left.get(k)); left.delete(k); }
      }
    }
    result.push(block);
  }
  return result;
}

// How many squares can be reached from `from` without crossing a block.
function reachableCount(from, obstacles) {
  const blocked = new Set(obstacles.map(key));
  const seen = new Set([key(from)]);
  const queue = [from];
  while (queue.length > 0) {
    const c = queue.shift();
    for (const d of Object.values(Snake.DIRS)) {
      const n = { x: c.x + d.x, y: c.y + d.y };
      if (onBoard(n) && !blocked.has(key(n)) && !seen.has(key(n))) {
        seen.add(key(n));
        queue.push(n);
      }
    }
  }
  return seen.size;
}

// ---- The set of levels ----

test("there are 1 to 5 level files, numbered 1, 2, 3, ... with no gaps", () => {
  assert.ok(files.length >= 1 && files.length <= 5, files.length + " files");
  files.forEach((f, i) => assert.strictEqual(f.n, i + 1, f.file));
});

test("game.js loads every level file, in order (require part)", () => {
  assert.strictEqual(Snake.LEVELS.length, levels.length);
  levels.forEach((level, i) => assert.strictEqual(Snake.LEVELS[i], level));
});

test("game.js lists every level, in order (browser part)", () => {
  const src = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
  const want = "[" + files.map((f) => "SnakeLevel" + f.n).join(", ") + "]";
  assert.ok(src.includes(want), "game.js should contain " + want);
});

test("index.html loads every level file, in order, before game.js", () => {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  const want = files.map((f) => "levels/" + f.file).concat("game.js");
  assert.deepStrictEqual(srcs.filter((s) => want.includes(s)), want);
});

// ---- Each level on its own ----

files.forEach((f, i) => {
  const level = levels[i];
  const name = f.file + ": ";
  const obstacles = obstaclesOf(level);
  const head = level.start[0];

  // spec.md §1 and §2: what a level file holds

  test(name + "holds only the values from spec.md", () => {
    const allowed = ["number", "foodGoal", "start", "dir", "obstacles",
      "baseMs", "speedupEvery", "speedupMs", "minMs"];
    for (const k of Object.keys(level)) assert.ok(allowed.includes(k), "unknown value " + k);
    for (const k of allowed) {
      if (k !== "obstacles") assert.ok(k in level, "missing value " + k);
    }
  });

  test(name + "number matches the file name", () => {
    assert.strictEqual(level.number, f.n);
  });

  test(name + "every value is between its min and max", () => {
    const range = (k, min, max) => {
      assert.ok(isWhole(level[k]), k + " should be a whole number");
      assert.ok(level[k] >= min && level[k] <= max,
        k + " is " + level[k] + ", should be " + min + " to " + max);
    };
    range("number", 1, 5);
    range("foodGoal", 1, 30);
    range("baseMs", 90, 150);
    range("speedupEvery", 3, 10);
    range("speedupMs", 0, 20);
    range("minMs", 70, 70);
    assert.ok(Array.isArray(level.start));
    assert.ok(level.start.length >= 2 && level.start.length <= 8,
      "start is " + level.start.length + " squares, should be 2 to 8");
    assert.ok(["up", "down", "left", "right"].includes(level.dir), "dir is " + level.dir);
    assert.ok(Array.isArray(obstacles));
    assert.ok(obstacles.length <= 40,
      "obstacles is " + obstacles.length + " squares, should be 0 to 40");
  });

  // spec.md §3: rules that keep a level playable

  test(name + "start is a straight line on the board, head first, no repeats", () => {
    for (const c of level.start) {
      assert.ok(isWhole(c.x) && isWhole(c.y) && onBoard(c), "off the board: " + key(c));
    }
    assert.strictEqual(new Set(level.start.map(key)).size, level.start.length, "a square is listed twice");
    const d = { x: level.start[0].x - level.start[1].x, y: level.start[0].y - level.start[1].y };
    for (let j = 1; j < level.start.length; j++) {
      assert.deepStrictEqual(
        { x: level.start[j - 1].x - level.start[j].x, y: level.start[j - 1].y - level.start[j].y },
        d, "start is not one straight line");
    }
  });

  test(name + "dir points away from the body", () => {
    const d = Snake.DIRS[level.dir];
    assert.deepStrictEqual({ x: head.x - level.start[1].x, y: head.y - level.start[1].y }, d);
  });

  test(name + "at least 5 clear squares ahead of the head", () => {
    const d = Snake.DIRS[level.dir];
    const blocked = new Set(obstacles.map(key));
    for (let s = 1; s <= 5; s++) {
      const c = { x: head.x + d.x * s, y: head.y + d.y * s };
      assert.ok(onBoard(c), "wall " + s + " squares ahead");
      assert.ok(!blocked.has(key(c)), "block " + s + " squares ahead at " + key(c));
    }
  });

  test(name + "obstacles are on the board with no repeats", () => {
    for (const c of obstacles) {
      assert.ok(isWhole(c.x) && isWhole(c.y) && onBoard(c), "off the board: " + key(c));
    }
    assert.strictEqual(new Set(obstacles.map(key)).size, obstacles.length, "a square is listed twice");
  });

  test(name + "the snake never starts in an obstacle", () => {
    const blocked = new Set(obstacles.map(key));
    for (const c of level.start) assert.ok(!blocked.has(key(c)), "snake on block at " + key(c));
  });

  test(name + "every obstacle has at least 2 free squares to each wall", () => {
    for (const c of obstacles) {
      assert.ok(c.x >= 2 && c.x <= GRID - 3 && c.y >= 2 && c.y <= GRID - 3,
        "block at " + key(c) + " is too close to a wall");
    }
  });

  test(name + "separate blocks have at least 2 free squares between them", () => {
    const bs = blocks(obstacles);
    for (let a = 0; a < bs.length; a++) {
      for (let b = a + 1; b < bs.length; b++) {
        for (const p of bs[a]) {
          for (const q of bs[b]) {
            const gap = Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y)) - 1;
            assert.ok(gap >= 2, "only " + gap + " free between " + key(p) + " and " + key(q));
          }
        }
      }
    }
  });

  test(name + "every square that isn't a block can be reached from the head", () => {
    assert.strictEqual(reachableCount(head, obstacles), GRID * GRID - obstacles.length);
  });

  test(name + "room to grow: start length + foodGoal is at most 38", () => {
    assert.ok(level.start.length + level.foodGoal <= 38);
    assert.ok(level.start.length + level.foodGoal < GRID * GRID - obstacles.length);
  });

  test(name + "minMs is not more than baseMs", () => {
    assert.ok(level.minMs <= level.baseMs);
  });

  test(name + "food never lands on an obstacle or the snake", () => {
    // Steps `rand` through [0, 1) finely enough to hit every empty square.
    const blocked = new Set(obstacles.map(key));
    const snake = new Set(level.start.map(key));
    const tries = GRID * GRID;
    for (let k = 0; k < tries; k++) {
      const food = Snake.createState(() => k / tries, level.number).food;
      assert.ok(food, "no food was placed");
      assert.ok(!blocked.has(key(food)), "food on block at " + key(food));
      assert.ok(!snake.has(key(food)), "food on snake at " + key(food));
    }
  });

  test(name + "the game starts this level with its own snake and obstacles", () => {
    const s = Snake.createState(() => 0, level.number);
    assert.strictEqual(s.level, level.number);
    assert.deepStrictEqual(s.snake, level.start);
    assert.deepStrictEqual(s.obstacles, obstacles);
    assert.strictEqual(s.dir, level.dir);
  });

  // spec.md §4: each level harder than the one before, never easier

  if (i > 0) {
    const prev = levels[i - 1];
    const was = files[i - 1].file + " ";

    test(name + "needs more food than " + was, () => {
      assert.ok(level.foodGoal > prev.foodGoal, level.foodGoal + " vs " + prev.foodGoal);
    });

    test(name + "snake starts longer than in " + was, () => {
      assert.ok(level.start.length > prev.start.length,
        level.start.length + " vs " + prev.start.length);
    });

    test(name + "has more obstacle squares than " + was, () => {
      assert.ok(obstacles.length > obstaclesOf(prev).length,
        obstacles.length + " vs " + obstaclesOf(prev).length);
    });

    test(name + "starts faster than " + was, () => {
      assert.ok(level.baseMs < prev.baseMs, level.baseMs + " ms vs " + prev.baseMs + " ms");
    });
  }
});
