let $board = $("#board");
let initialRows = $("#new_rows").val();
let initialCols = $("#new_cols").val();
const difficulty = 0.12;

// Definimos funcionalidad de boton "change board size"
$("#new_game_button").on("click", function () {
  initialRows = $("#new_rows").val();
  initialCols = $("#new_cols").val();
  createBoard(initialRows, initialCols);
});

// Funcionalidad del boton de guardar el juego
let loadedData = {};
$("#save_game_button").on("click", function () {
  localStorage.removeItem("savedLocally");
  loadedData = JSON.stringify(saveBoard());
  localStorage.setItem("savedLocally", loadedData);
});

// Funcionalidad del boton de cargar el juego guardado
$("#restore_game_button").on("click", function () {
  restoreBoard();
});

// Funcion que inicializa el board dado los parametros row y cols
function createBoard(rows, cols) {
  $board.empty();
  for (let i = 0; i < rows; i++) {
    const $row = $("<div>").addClass("row");
    for (let j = 0; j < cols; j++) {
      const $col = $("<div>")
        .addClass("col hidden")
        .attr("data-row", i)
        .attr("data-col", j);
      if (Math.random() < difficulty) {
        $col.addClass("mine");
      }
      $row.append($col);
    }
    $board.append($row);
  }
}

// Funcion de reseteo
function restart() {
  createBoard(initialRows, initialCols);
}

// Funcion para guardar el board actual
function saveBoard() {
  let savingBoard = [];
  let rows = $("#board")[0].childNodes;
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].childNodes.length; j++) {
      savingBoard.push({
        classes: rows[i].childNodes[j].className,
        datasetLocation: rows[i].childNodes[j].dataset,
        text: rows[i].childNodes[j].firstChild
          ? rows[i].childNodes[j].firstChild.data
          : "",
      });
    }
  }
  return savingBoard;
}

// Funcion para reestablecer el board guardado
function restoreBoard() {
  let savedBoard = JSON.parse(localStorage.getItem("savedLocally"));
  if (savedBoard) {
    $board.empty();
    let rows = savedBoard[savedBoard.length - 1].datasetLocation.row;
    let cols = savedBoard[savedBoard.length - 1].datasetLocation.col;
    let position = 0;
    for (let i = 0; i <= rows; i++) {
      const $row = $("<div>").addClass("row");
      for (let j = 0; j <= cols; j++) {
        const $col = $("<div>")
          .addClass(savedBoard[position].classes)
          .attr("data-row", i)
          .attr("data-col", j)
          .text(savedBoard[position].text);
        position++;
        $row.append($col);
      }
      $board.append($row);
    }
  } else {
    alert("No saved board!");
  }
}

// Funcion fin de juego
function gameOver(winner) {
  let message = null;
  let icon = null;
  if (winner) {
    message = "Congrats! You won";
    icon = "fa fa-flag";
  } else {
    message = "Too bad! You lost";
    icon = "fa fa-bomb";
  }
  $(".col.mine").html("");
  $(".col.mine").append($("<i>").addClass(icon));
  $(".col:not(.mine)").html(function () {
    const $cell = $(this);
    const count = getMineCount($cell.data("row"), $cell.data("col"));
    originalColours(count, $cell);
    return count === 0 ? "" : count;
  });
  $(".col.hidden").removeClass("hidden");
  setTimeout(function () {
    alert(message);
    restart();
  }, 1000);
}

// Funcion para revelar el estado del casillero
function reveal(oi, oj) {
  const revealed = {};
  function helper(i, j) {
    if (i >= initialRows || j >= initialCols || i < 0 || j < 0) return;
    const key = `${i} ${j}`;
    if (revealed[key]) return;
    const $cell = $(`.col.hidden[data-row=${i}][data-col=${j}]`);
    const mineCount = getMineCount(i, j);
    if (!$cell.hasClass("hidden") || $cell.hasClass("mine")) {
      return;
    }
    $cell.removeClass("hidden");
    if (mineCount) {
      $cell.text(mineCount);
      originalColours(mineCount, $cell);
      return;
    }
    for (let di = -1; di <= 1; di++) {
      for (let dj = -1; dj <= 1; dj++) {
        helper(i + di, j + dj);
      }
    }
  }
  helper(oi, oj);
}

// Funcion helper para reveal que calcula el numero de bombas en el vecindario del casillero
function getMineCount(i, j) {
  let count = 0;
  for (let di = -1; di <= 1; di++) {
    for (let dj = -1; dj <= 1; dj++) {
      const ni = i + di;
      const nj = j + dj;
      if (ni >= initialRows || nj >= initialCols || nj < 0 || ni < 0) continue;
      const $cell = $(`.col.hidden[data-row=${ni}][data-col=${nj}]`);
      if ($cell.hasClass("mine")) count++;
    }
  }
  return count;
}

// Funcion para colorear el numero de bombas vecinas segun juego original
function originalColours(mineCount, $cell) {
  if (mineCount === 1) {
    $cell.addClass("one");
  }
  if (mineCount === 2) {
    $cell.addClass("two");
  }
  if (mineCount === 3) {
    $cell.addClass("three");
  }
  if (mineCount === 4) {
    $cell.addClass("four");
  }
  if (mineCount === 5) {
    $cell.addClass("five");
  }
  if (mineCount === 6) {
    $cell.addClass("six");
  }
  if (mineCount === 7) {
    $cell.addClass("seven");
  }
  if (mineCount === 8) {
    $cell.addClass("eight");
  }
}

// Funcion onClick de los casilleros
$board.on("click", ".col.hidden", function () {
  const $cell = $(this);
  const row = $cell.data("row");
  const col = $cell.data("col");

  if ($cell.hasClass("isFlagged")) return;

  if ($cell.hasClass("mine")) {
    gameOver(false);
  } else {
    reveal(row, col);
    if ($(".col.hidden").length === $(".col.mine").length) gameOver(true);
  }
});

// Funcion para poner bandera en el casillero (click derecho)
$board.on("contextmenu", ".col.hidden", function () {
  const $cell = $(this);
  if ($cell.hasClass("isFlagged")) {
    $cell.removeClass("isFlagged");
    $cell.html("");
  } else {
    $cell.addClass("isFlagged");
    $cell.html('<i class="fa fa-flag"></i>');
  }
});

restart();
