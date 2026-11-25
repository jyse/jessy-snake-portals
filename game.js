// Pure game logic. No DOM access here, so it can be tested in Node.
var Snake = (function () {
  var GRID = 20;

  // The levels, in order. Each one's numbers live in levels/level-N.js.
  // The browser loads those with <script> tags before this file; Node
  // loads them with require.
  var LEVELS = typeof module !== "undefined"
    ? [
        require("./levels/level-1.js"),
        require("./levels/level-2.js"),
        require("./levels/level-3.js")
      ]
    : [SnakeLevel1, SnakeLevel2, SnakeLevel3];

  // Returns the level with this number, or level 1 if there is none.
  function getLevel(number) {
    return LEVELS[number - 1] || LEVELS[0];
  }

  var DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  var OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

  function isOpposite(a, b) {
    return OPPOSITE[a] === b;
  }

  function sameCell(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function onAny(cells, cell) {
    return cells.some(function (c) { return sameCell(c, cell); });
  }

  // Picks a random empty cell for the food: not on the snake and not on an
  // obstacle. `rand` returns a number in [0, 1) like Math.random; tests
  // pass their own. Returns null if there is no empty cell left.
  function spawnFood(snake, grid, rand, obstacles) {
    rand = rand || Math.random;
    obstacles = obstacles || [];
    var empty = [];
    for (var y = 0; y < grid; y++) {
      for (var x = 0; x < grid; x++) {
        var cell = { x: x, y: y };
        if (!onAny(snake, cell) && !onAny(obstacles, cell)) {
          empty.push(cell);
        }
      }
    }
    if (empty.length === 0) return null;
    return empty[Math.floor(rand() * empty.length)];
  }

  // A fresh board for a level (level 1 if not given or unknown). `score`
  // is carried over from earlier levels; it starts at 0.
  function createState(rand, levelNumber, score) {
    var level = getLevel(levelNumber);
    var copy = function (part) { return { x: part.x, y: part.y }; };
    var snake = level.start.map(copy);
    var obstacles = (level.obstacles || []).map(copy);
    return {
      grid: GRID,
      level: level.number,
      levelFood: 0,       // food eaten on this level
      dir: level.dir,     // the way the snake will move on the next step
      moved: level.dir,   // the way the snake actually moved last
      snake: snake,
      obstacles: obstacles,
      food: spawnFood(snake, GRID, rand, obstacles),
      score: score || 0,
      over: false
    };
  }

  function inBounds(cell, grid) {
    return cell.x >= 0 && cell.y >= 0 && cell.x < grid && cell.y < grid;
  }

  // How long one step lasts, in milliseconds, after eating `food` pieces
  // on a level (level 1 if not given).
  function stepMs(food, levelNumber) {
    var level = getLevel(levelNumber);
    var faster = Math.floor(food / level.speedupEvery) * level.speedupMs;
    return Math.max(level.minMs, level.baseMs - faster);
  }

  // Returns a state heading in the new direction. Unknown directions,
  // the same direction, and reversing straight back into the body are
  // ignored (the original state is returned). "Straight back" is checked
  // against the way the snake last moved, not the last key, so two quick
  // turns before a step (e.g. up then left while moving right) can't
  // send it into its own neck.
  function turn(state, dir) {
    var moved = state.moved || state.dir;
    if (!DIRS[dir] || dir === state.dir || isOpposite(dir, moved)) {
      return state;
    }
    return Object.assign({}, state, { dir: dir });
  }

  // Returns a new state one step later. The input state is not changed.
  // Eating the food grows the snake by one and adds one to the score.
  // Hitting a wall or the snake's own body ends the game: the snake stays
  // where it was and `over` becomes true. A finished game never changes.
  function step(state, rand) {
    if (state.over) return state;

    var d = DIRS[state.dir];
    var head = state.snake[0];
    var next = { x: head.x + d.x, y: head.y + d.y };

    if (!inBounds(next, state.grid) || onAny(state.obstacles || [], next)) {
      return Object.assign({}, state, { over: true });
    }

    var eats = state.food !== null && sameCell(next, state.food);

    // The tail moves out of the way this step unless the snake is growing,
    // so moving into the cell the tail is leaving is allowed.
    var body = eats ? state.snake : state.snake.slice(0, -1);
    if (body.some(function (part) { return sameCell(part, next); })) {
      return Object.assign({}, state, { over: true });
    }

    if (eats) {
      var levelFood = state.levelFood + 1;
      var score = state.score + 1;

      // Reached the food goal and there is a next level: start it, keeping
      // the score. On the last level the game just keeps going.
      var hasNext = state.level < LEVELS.length;
      if (hasNext && levelFood >= getLevel(state.level).foodGoal) {
        return createState(rand, state.level + 1, score);
      }

      var grown = [next].concat(state.snake);
      return Object.assign({}, state, {
        moved: state.dir,
        snake: grown,
        food: spawnFood(grown, state.grid, rand, state.obstacles),
        score: score,
        levelFood: levelFood
      });
    }

    return Object.assign({}, state, {
      moved: state.dir,
      snake: [next].concat(state.snake.slice(0, -1))
    });
  }

  return {
    GRID: GRID,
    BASE_MS: LEVELS[0].baseMs,
    MIN_MS: LEVELS[0].minMs,
    LEVELS: LEVELS,
    getLevel: getLevel,
    DIRS: DIRS,
    isOpposite: isOpposite,
    spawnFood: spawnFood,
    createState: createState,
    stepMs: stepMs,
    turn: turn,
    step: step
  };
})();

if (typeof module !== "undefined") module.exports = Snake;
