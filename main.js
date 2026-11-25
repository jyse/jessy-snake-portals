// DOM glue: screens, drawing, input, the game loop and saved best score.
(function () {
  var MAX_QUEUE = 2;      // turns remembered between steps
  var SWIPE_MIN_PX = 20;  // shorter finger moves are ignored
  var BEST_KEY = "snake.best";

  function $(id) {
    return document.getElementById(id);
  }

  var canvas = $("board");
  var ctx = canvas.getContext("2d");
  var scoreEl = $("score");
  var screens = {
    start: $("screen-start"),
    game: $("screen-game"),
    over: $("screen-over")
  };

  var state = Snake.createState();
  var queue = [];
  var paused = false;
  var screen = "start";
  var timer = null;

  // ---- Saved best score (stays in this browser only) ----

  // localStorage can be missing or blocked (private windows, strict
  // settings), so reads and writes never let an error stop the game.
  function loadBest() {
    try {
      var n = parseInt(localStorage.getItem(BEST_KEY), 10);
      return n > 0 ? n : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBest(n) {
    try {
      localStorage.setItem(BEST_KEY, String(n));
    } catch (e) {
      // Not saved; the game still works.
    }
  }

  var best = loadBest();

  // ---- Screens ----

  function showScreen(name) {
    screen = name;
    Object.keys(screens).forEach(function (key) {
      screens[key].hidden = key !== name;
    });
  }

  function showStart() {
    $("start-best").textContent = best;
    showScreen("start");
    $("start-btn").focus();
  }

  function startGame() {
    clearTimeout(timer);
    state = Snake.createState();
    queue = [];
    paused = false;
    showScreen("game");
    draw();
    timer = setTimeout(tick, Snake.stepMs(state.score));
  }

  function endGame() {
    clearTimeout(timer);
    var isNewBest = state.score > best;
    if (isNewBest) {
      best = state.score;
      saveBest(best);
    }
    $("over-score").textContent = state.score;
    $("over-best").textContent = best;
    $("new-best").hidden = !isNewBest;
    showScreen("over");
    $("again-btn").focus();
  }

  $("start-btn").addEventListener("click", startGame);
  $("again-btn").addEventListener("click", startGame);
  $("home-btn").addEventListener("click", showStart);

  // ---- Drawing ----

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function draw() {
    var size = canvas.width;
    var cell = size / state.grid;

    ctx.fillStyle = cssVar("--board");
    ctx.fillRect(0, 0, size, size);

    if (state.food) {
      ctx.fillStyle = cssVar("--food");
      ctx.beginPath();
      ctx.arc(
        (state.food.x + 0.5) * cell,
        (state.food.y + 0.5) * cell,
        cell * 0.38,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

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

    scoreEl.textContent = state.score;
  }

  // ---- Input ----

  // Queue a turn. Each queued turn is checked against the one before it,
  // so a quick "up, left" while heading right gives two clean turns, and
  // a reverse or a repeat never takes up a slot.
  function queueTurn(dir) {
    if (screen !== "game" || paused) return;
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
    // Outside a game, leave keys alone so Enter/Space press the buttons.
    if (screen !== "game") return;
    if (e.key === " "|| e.key === "p" || e.key === "P") {
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

  // setTimeout instead of setInterval so each step can use the current
  // speed, which gets faster as the score goes up.
  function tick() {
    if (screen !== "game") return;
    if (!paused) {
      if (queue.length) state = Snake.turn(state, queue.shift());
      state = Snake.step(state);
      draw();
      if (state.over) {
        endGame();
        return;
      }
    }
    timer = setTimeout(tick, Snake.stepMs(state.score));
  }

  showStart();
})();
