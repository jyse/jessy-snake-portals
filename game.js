// Pure game logic. No DOM access here, so it can be tested in Node.
var Snake = (function () {
  var GRID = 20;

  var BASE_STEP_MS = 150;   // starting speed (time between steps)
  var MIN_STEP_MS = 70;     // fastest allowed
  var SPEEDUP_EVERY = 5;    // foods eaten per speed-up
  var SPEEDUP_MS = 10;      // how much faster each speed-up is

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

  // Copy a state and change some fields, leaving the original untouched.
  function withChanges(state, changes) {
    return Object.assign({}, state, changes);
  }

  // Pick a random cell that the snake is not on. Returns null if the board
  // is full. `rand` returns a number in [0, 1); tests pass their own.
  function spawnFood(snake, grid, rand) {
    rand = rand || Math.random;
    var taken = {};
    snake.forEach(function (c) { taken[c.x + "," + c.y] = true; });

    var free = [];
    for (var y = 0; y < grid; y++) {
      for (var x = 0; x < grid; x++) {
        if (!taken[x + "," + y]) free.push({ x: x, y: y });
      }
    }
    if (!free.length) return null;
    return free[Math.floor(rand() * free.length)];
  }

  // Time between steps for a given number of foods eaten.
  function stepMs(eaten) {
    var ms = BASE_STEP_MS - Math.floor(eaten / SPEEDUP_EVERY) * SPEEDUP_MS;
    return Math.max(MIN_STEP_MS, ms);
  }

  function createState(rand) {
    var snake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 }
    ];
    return {
      grid: GRID,
      dir: "right",
      snake: snake,
      food: spawnFood(snake, GRID, rand),
      score: 0,
      eaten: 0
    };
  }

  function inBounds(cell, grid) {
    return cell.x >= 0 && cell.y >= 0 && cell.x < grid && cell.y < grid;
  }

  function sameCell(a, b) {
    return !!a && !!b && a.x === b.x && a.y === b.y;
  }

  // Returns a state heading in the new direction. Unknown directions,
  // the same direction, and reversing straight back into the body are
  // ignored (the original state is returned).
  function turn(state, dir) {
    if (!DIRS[dir] || dir === state.dir || isOpposite(dir, state.dir)) {
      return state;
    }
    return withChanges(state, { dir: dir });
  }

  // Returns a new state one step later. The input state is not changed.
  // Eating food grows the snake by one and adds to the score.
  // Layer 1-3: leaving the board just restarts the game.
  function step(state, rand) {
    var d = DIRS[state.dir];
    var head = state.snake[0];
    var next = { x: head.x + d.x, y: head.y + d.y };

    if (!inBounds(next, state.grid)) {
      return createState(rand);
    }

    if (sameCell(next, state.food)) {
      var grown = [next].concat(state.snake);
      return withChanges(state, {
        snake: grown,
        food: spawnFood(grown, state.grid, rand),
        score: state.score + 1,
        eaten: state.eaten + 1
      });
    }

    return withChanges(state, {
      snake: [next].concat(state.snake.slice(0, -1))
    });
  }

  return {
    GRID: GRID,
    BASE_STEP_MS: BASE_STEP_MS,
    MIN_STEP_MS: MIN_STEP_MS,
    DIRS: DIRS,
    isOpposite: isOpposite,
    spawnFood: spawnFood,
    stepMs: stepMs,
    createState: createState,
    turn: turn,
    step: step
  };
})();

if (typeof module !== "undefined") module.exports = Snake;
