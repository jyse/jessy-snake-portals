// DOM glue: drawing, input and the game loop.
(function () {
  var STEP_MS = 150;
  var MAX_QUEUE = 2;      // turns remembered between steps
  var SWIPE_MIN_PX = 20;  // shorter finger moves are ignored

  var canvas = document.getElementById("board");
  var ctx = canvas.getContext("2d");
  var state = Snake.createState();
  var queue = [];
  var paused = false;

  // ---- Drawing ----

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

    if (paused) {
      ctx.fillStyle = cssVar("--overlay");
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = cssVar("--text");
      ctx.font = "bold 32px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Paused", size / 2, size / 2);
    }
  }

  // ---- Input ----

  // Queue a turn. Each queued turn is checked against the one before it,
  // so a quick "up, left" while heading right gives two clean turns, and
  // a reverse or a repeat never takes up a slot.
  function queueTurn(dir) {
    if (paused) return;
    var last = queue.length ? queue[queue.length - 1] : state.dir;
    if (dir === last || Snake.isOpposite(dir, last)) return;
    if (queue.length < MAX_QUEUE) queue.push(dir);
  }

  function togglePause() {
    paused = !paused;
    queue = [];
    draw();
  }

  var KEYS = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
    W: "up", S: "down", A: "left", D: "right"
  };

  document.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "p" || e.key === "P") {
      e.preventDefault();
      if (!e.repeat) togglePause();
      return;
    }
    var dir = KEYS[e.key];
    if (dir) {
      e.preventDefault(); // stop arrow keys from scrolling the page
      queueTurn(dir);
    }
  });

  // Swipe on the board.
  var touchStart = null;

  canvas.addEventListener("touchstart", function (e) {
    var t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });

  canvas.addEventListener("touchend", function (e) {
    if (!touchStart) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStart.x;
    var dy = t.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      queueTurn(dx > 0 ? "right" : "left");
    } else {
      queueTurn(dy > 0 ? "down" : "up");
    }
  });

  // On-screen arrow buttons.
  document.querySelectorAll("[data-dir]").forEach(function (btn) {
    btn.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      queueTurn(btn.getAttribute("data-dir"));
    });
  });

  // ---- Loop ----

  setInterval(function () {
    if (paused) return;
    if (queue.length) state = Snake.turn(state, queue.shift());
    state = Snake.step(state);
    draw();
  }, STEP_MS);

  draw();
})();
