(function (window, document) {
  'use strict';

  var DOM = {
    tileset: null,
    canvas: null,
    methodInputs: null,
    toolInputs: null
  };

  var ENV = {
    ctx: null,
    grid: null,
    startCell: null,
    endCell: null,
    tileSize: 40,
    debug: false
  };

  var Mouse = {
    column: 0,
    row: 0,
    clicking: false,
    currentValue: null
  };

  window.onload = function () {
    initDOM();
    initEventListener();
    initEnvironment();

    drawGrid();
    computePath();
  }

  /**
   * Initialization
   */

  function initDOM() {
    DOM.methodInputs = document.getElementsByName("search_method");
    DOM.toolInputs = document.getElementsByName("map_tool");
    DOM.tileset = document.getElementById("tileset");
    DOM.canvas = document.getElementById("canvas");
    DOM.canvas.height = 10 * ENV.tileSize;
    DOM.canvas.width = 12 * ENV.tileSize;
  }

  function initEventListener() {
    for (var i = 0; i < DOM.methodInputs.length; i++) {
      DOM.methodInputs[i].addEventListener("change", function(e) {
        computePath();
      });
    }

    for (var i = 0; i < DOM.toolInputs.length; i++) {
      DOM.toolInputs[i].addEventListener("change", function(e) {
        Config.toolTile = parseInt(e.target.value);
      });
    }

    DOM.canvas.addEventListener("mousemove", mouseMove);
    DOM.canvas.addEventListener("mousedown", mouseDown);
    DOM.canvas.addEventListener("mouseup", mouseUp);
    DOM.canvas.addEventListener("mouseout", mouseOut);
  }

  function initEnvironment() {
    ENV.ctx = DOM.canvas.getContext("2d");
    var rows = 10, columns = 12;
    ENV.grid = createGrid(10, 12);
    ENV.startCell = {
      row: Math.floor(Math.random() * rows),
      column: Math.floor(Math.random() * columns)
    };
    ENV.endCell = {
      row: Math.floor(Math.random() * rows),
      column: Math.floor(Math.random() * columns)
    };
    if (ENV.startCell.row == ENV.endCell.row && ENV.startCell.column == ENV.endCell.column) {
      ENV.startCell.row = (ENV.startCell.row + 2) % rows;
    }
  }

  function getMethodInput() {
    for (var i = 0; i < DOM.methodInputs.length; i++) {
      if (DOM.methodInputs[i].checked) {
        return DOM.methodInputs[i].value;
      }
    }
  }

  function getToolInput() {
    for (var i = 0; i < DOM.toolInputs.length; i++) {
      if (DOM.toolInputs[i].checked) {
        return DOM.toolInputs[i].value;
      }
    }
  }

  /**
   * Grid / Graph creation
   */

  function createGrid(rows, columns) {
    var grid = new Array(rows);
    for (var r = 0; r < rows; r++) {
      grid[r] = new Array(columns);
      for (var c = 0; c < columns; c++) {
        grid[r][c] = createTile(r, c, 0);
      }
    }
    return grid;
  }

  function gridToGraph(grid) {
    var rows = ENV.grid.length, columns = ENV.grid[0].length;
    var graph = new Pathfinder.Graph();
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < columns; c++) {
        graph.addNode(ENV.grid[r][c]);
        if (r + 1 < rows) {
          var cost = ENV.grid[r][c].cost + ENV.grid[r+1][c].cost
          graph.addEdge(ENV.grid[r][c], ENV.grid[r+1][c], cost);
        }
        if (c + 1 < columns) {
          var cost = ENV.grid[r][c].cost + ENV.grid[r][c+1].cost
          graph.addEdge(ENV.grid[r][c], ENV.grid[r][c+1], cost);
        }
      }
    }
    return graph;
  }

  function createTile(row, column, value) {
    return {
      row: row,
      column: column,
      value: value,
      cost: (value < 2) ? (1 + value * 3) : 99999
    };
  }

  /**
   * Pathfinding
   */

   function heuristic(a, b) {
     return Math.max(Math.abs(a.row - b.row), Math.abs(a.column - b.column));
   }

  function computePath() {
    var searchMethod = getMethodInput();
    var graph = gridToGraph();
    var startNode = graph.get(function (node) {
      return node.column == ENV.startCell.column && node.row == ENV.startCell.row;
    });
    var endNode = graph.get(function (node) {
      return node.column == ENV.endCell.column && node.row == ENV.endCell.row;
    });

    var result = null;
    switch (searchMethod) {
      case "bfs":
        result = Pathfinder.searchBFS(graph, startNode, endNode);
        break;
      case "greedy":
        result = Pathfinder.searchGreedyBFS(graph, startNode, endNode, heuristic);
        break;
      case "dijkstra":
        result = Pathfinder.searchDijkstra(graph, startNode, endNode);
        break;
      case "astar":
        result = Pathfinder.searchAStar(graph, startNode, endNode, heuristic);
        break;
    }
    console.log(result);
    drawResult(result);
  }

  /**
   * Canvas Drawing
   */

  function drawResult(result) {
    drawGrid();
    drawPath(result);
    drawStartEndCell();
  }

  function drawGrid() {
    var rows = ENV.grid.length, columns = ENV.grid[0].length;
    var tileSize = ENV.tileSize;
    var x = 0, y = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < columns; c++) {
        x = c * tileSize; y = r * tileSize;
        ENV.ctx.drawImage(DOM.tileset, ENV.grid[r][c].value*64,0, 64,64, x,y, tileSize,tileSize);
        ENV.ctx.drawImage(DOM.tileset, ENV.grid[r][c].value*64,0, 64,64, x,y, tileSize,tileSize);

        if (r == ENV.startCell.row && c == ENV.startCell.column) {
          ENV.ctx.drawImage(DOM.tileset, 3*64,0, 64,64, x,y, tileSize,tileSize);
          ENV.ctx.drawImage(DOM.tileset, 3*64,0, 64,64, x,y, tileSize,tileSize);
        }
        if (r == ENV.endCell.row && c == ENV.endCell.column) {
          ENV.ctx.drawImage(DOM.tileset, 4*64,0, 64,64, x,y, tileSize,tileSize);
          ENV.ctx.drawImage(DOM.tileset, 4*64,0, 64,64, x,y, tileSize,tileSize);
        }
      }
    }
  }

  function drawStartEndCell() {
    var size = ENV.tileSize;
    var x = 0, y = 0;

    x = size * ENV.startCell.column;
    y = size * ENV.startCell.row;
    ENV.ctx.drawImage(DOM.tileset, 3*64,0, 64,64, x,y, size,size);
    ENV.ctx.drawImage(DOM.tileset, 3*64,0, 64,64, x,y, size,size);

    x = size * ENV.endCell.column;
    y = size * ENV.endCell.row;
    ENV.ctx.drawImage(DOM.tileset, 4*64,0, 64,64, x,y, size,size);
    ENV.ctx.drawImage(DOM.tileset, 4*64,0, 64,64, x,y, size,size);
  }

  function drawPath(path) {
    if(path.length == 0) return;

    ENV.ctx.lineWidth = 10;
    ENV.ctx.strokeStyle = "rgba(190,170,135,0.8)";
    ENV.ctx.lineJoin = "round";

    var x = ENV.tileSize * (0.5 + path[0].column);
    var y = ENV.tileSize * (0.5 + path[0].row);
    ENV.ctx.beginPath();
    ENV.ctx.moveTo(x, y);
    for (var i = 1; i < path.length; i++) {
      x = ENV.tileSize * (0.5 + path[i].column);
      y = ENV.tileSize * (0.5 + path[i].row);
      ENV.ctx.lineTo(x, y);
    }
    ENV.ctx.stroke();
    ENV.ctx.closePath();
  }

  /**
   * Event Listener
   */

  function mouseDown(e) {
    var coord = getMouseCoord(e);
    var cell = coordToGrid(coord.x, coord.y);
    Mouse.row = cell.row;
    Mouse.column = cell.column;
    if(cell.row == ENV.startCell.row && cell.column == ENV.startCell.column) {
      Mouse.currentValue = 'start';
    }
    else if(cell.row == ENV.endCell.row && cell.column == ENV.endCell.column) {
      Mouse.currentValue = 'end';
    }
    else {
      Mouse.currentValue = getToolInput();
      ENV.grid[cell.row][cell.column] = Mouse.currentValue;
    }
    Mouse.clicking = true;
    computePath();
  }

  function mouseMove(e) {
    if (Mouse.clicking) {
      var coord = getMouseCoord(e);
      var cell = coordToGrid(coord.x, coord.y);
      if (cell.row != Mouse.row || cell.column != Mouse.column) {
        Mouse.row = cell.row;
        Mouse.column = cell.column;
        if(Mouse.currentValue == 'start') {
          ENV.startCell = cell;
        }
        else if (Mouse.currentValue == 'end') {
          ENV.endCell = cell;
        }
        else {
          ENV.grid[cell.row][cell.column] = Mouse.currentValue;
        }
        computePath();
      }
    }
  }

  function mouseUp (e) {
    Mouse.clicking = false;
  }

  function mouseOut (e) {
    Mouse.clicking = false;
  }

  function getMouseCoord(e) {
    var rect = DOM.canvas.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * DOM.canvas.width),
      y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * DOM.canvas.height)
    };
  }

  function coordToGrid(x, y) {
    return {
      row: Math.floor(y / ENV.tileSize),
      column: Math.floor(x / ENV.tileSize)
    };
  }

})(window, window.document);
