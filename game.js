// Pure game logic. No DOM access here, so it can be tested in Node.
var Snake = (function () {
  var GRID = 20;

  // Speed: start at BASE_MS per step, get SPEEDUP_MS faster every
  // SPEEDUP_EVERY pieces of food, never faster than MIN_MS.
  var BASE_MS = 150;
  var SPEEDUP_EVERY = 5;
  var SPEEDUP_MS = 10;
  var MIN_MS = 70;

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

  // Picks a random empty cell for the food. `rand` returns a number in
  // [0, 1) like Math.random; tests pass their own. Returns null if the
  // snake fills the whole board.
  function spawnFood(snake, grid, rand) {
    rand = rand || Math.random;
    var empty = [];
    for (var y = 0; y < grid; y++) {
      for (var x = 0; x < grid; x++) {
        var cell = { x: x, y: y };
        if (!snake.some(function (part) { return sameCell(part, cell); })) {
          empty.push(cell);
        }
      }
    }
    if (empty.length === 0) return null;
    return empty[Math.floor(rand() * empty.length)];
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
      over: false
    };
  }

  function inBounds(cell, grid) {
    return cell.x >= 0 && cell.y >= 0 && cell.x < grid && cell.y < grid;
  }

  // How long one step lasts, in milliseconds, for a given score.
  function stepMs(score) {
    var faster = Math.floor(score / SPEEDUP_EVERY) * SPEEDUP_MS;
    return Math.max(MIN_MS, BASE_MS - faster);
  }

  // Returns a state heading in the new direction. Unknown directions,
  // the same direction, and reversing straight back into the body are
  // ignored (the original state is returned).
  function turn(state, dir) {
    if (!DIRS[dir] || dir === state.dir || isOpposite(dir, state.dir)) {
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

    if (!inBounds(next, state.grid)) {
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
      var grown = [next].concat(state.snake);
      return Object.assign({}, state, {
        snake: grown,
        food: spawnFood(grown, state.grid, rand),
        score: state.score + 1
      });
    }

    return Object.assign({}, state, {
      snake: [next].concat(state.snake.slice(0, -1))
    });
  }

  return {
    GRID: GRID,
    BASE_MS: BASE_MS,
    MIN_MS: MIN_MS,
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
