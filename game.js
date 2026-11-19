// Pure game logic. No DOM access here, so it can be tested in Node.
var Snake = (function () {
  var GRID = 20;

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

  function createState() {
    return {
      grid: GRID,
      dir: "right",
      snake: [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
      ]
    };
  }

  function inBounds(cell, grid) {
    return cell.x >= 0 && cell.y >= 0 && cell.x < grid && cell.y < grid;
  }

  // Returns a state heading in the new direction. Unknown directions,
  // the same direction, and reversing straight back into the body are
  // ignored (the original state is returned).
  function turn(state, dir) {
    if (!DIRS[dir] || dir === state.dir || isOpposite(dir, state.dir)) {
      return state;
    }
    return { grid: state.grid, dir: dir, snake: state.snake };
  }

  // Returns a new state one step later. The input state is not changed.
  // Layer 1: leaving the board just restarts the snake.
  function step(state) {
    var d = DIRS[state.dir];
    var head = state.snake[0];
    var next = { x: head.x + d.x, y: head.y + d.y };

    if (!inBounds(next, state.grid)) {
      return createState();
    }

    var body = state.snake.slice(0, -1);
    return {
      grid: state.grid,
      dir: state.dir,
      snake: [next].concat(body)
    };
  }

  return {
    GRID: GRID,
    DIRS: DIRS,
    isOpposite: isOpposite,
    createState: createState,
    turn: turn,
    step: step
  };
})();

if (typeof module !== "undefined") module.exports = Snake;
