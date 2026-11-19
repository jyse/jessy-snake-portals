// DOM glue: drawing and the game loop.
(function () {
  var STEP_MS = 150;

  var canvas = document.getElementById("board");
  var ctx = canvas.getContext("2d");
  var state = Snake.createState();

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function draw() {
    var size = canvas.width;
    var cell = size / state.grid;

    ctx.fillStyle = cssVar("--board");
    ctx.fillRect(0, 0, size, size);

    state.snake.forEach(function (part, i) {
      ctx.fillStyle = i === 0 ? cssVar("--snake-head") : cssVar("--snake");
      ctx.fillRect(part.x * cell + 1, part.y * cell + 1, cell - 2, cell - 2);
    });
  }

  setInterval(function () {
    state = Snake.step(state);
    draw();
  }, STEP_MS);

  draw();
})();
