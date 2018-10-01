"use strict";

const TILE_SIZE = 40;
const ROWS = 10;
const COLUMNS = 14;

var canvas, ctx;
var grid, graph, start_node, end_node;
var tileset, $method_list, $tool_list, $info_text;

var config = {
  method: 'bfs',
  tile: 0,
  show_all: false
};

var mouseObject = {
  last_column: 0,
  last_row: 0,
  clicking: false,
  value: null
};

window.onload = function () {
  grid = createGrid(ROWS, COLUMNS);
  graph = new Pathfinder.Graph();

  createStartEndNodes();

  canvas = document.getElementById("canvas");
  canvas.width = COLUMNS*TILE_SIZE; canvas.height = ROWS*TILE_SIZE;
  ctx = canvas.getContext("2d");

  $method_list = document.getElementsByName("search_method");
  $tool_list = document.getElementsByName("map_tool");
  $info_text = document.getElementById("info");
  tileset = document.getElementById("tileset");

  setEventListener();
  computePath();
}

function setEventListener() {
  for (var i = 0; i < $method_list.length; i++) {
    $method_list[i].addEventListener("change", (e) => {
      config.method = e.target.value;
      computePath();
    });

    if($method_list[i].checked) {
      config.method = $method_list[i].value;
    }
  }

  for (var i = 0; i < $tool_list.length; i++) {
    $tool_list[i].addEventListener("change", function(e) {
      config.tile = parseInt(e.target.value);
    });

    if($tool_list[i].checked) {
      config.tile = $tool_list[i].value;
    }
  }

  canvas.addEventListener("mousemove", mouseMove);
  canvas.addEventListener("mousedown", mouseDown);
  canvas.addEventListener("mouseup", mouseUp);
  canvas.addEventListener("mouseout", mouseOut);
}

function computePath(){
  createGraph();

  let start = graph.getNodeById(graph.createId(start_node.row, start_node.column));
  let end = graph.getNodeById(graph.createId(end_node.row, end_node.column));
  let t = performance.now();

  let result = {};
  switch (config.method) {
    case "bfs":
      result = Pathfinder.bfs(graph, start, end);
      break;
    case "greedy":
      result = Pathfinder.greedy(graph, start, end);
      break;
    case "dijkstra":
      result = Pathfinder.dijkstra(graph, start, end);
      break;
    case "astar":
      result = Pathfinder.astar(graph, start, end);
      break;
  }
  result.time = performance.now() - t;

  drawGrid(grid);
  drawResult(result);
  drawStartEndNode(start_node, end_node);
  displayInfo(result);
}

function createGrid(rows, columns) {
  let g = new Array(rows);
  for (let i = 0; i < g.length; i++) {
    g[i] = new Array(columns);
    for (let j = 0; j < g[i].length; j++) {
      g[i][j] = 0;
    }
  }
  return g;
}

function createGraph() {
  graph.createFrom2DArray(grid, function (array, row, col) {
    if (array[row][col] == 2) return null;
    let c = array[row][col] == 0 ? 1 : 3;
    return {
      row: row, column: col,
      value: array[row][col],
      cost: c
    };
  });
}

function createStartEndNodes() {
  start_node = {
    row: Math.floor(Math.random() * ROWS),
    column: Math.floor(Math.random() * COLUMNS)
  };
  end_node = {
    row: Math.floor(Math.random() * ROWS),
    column: Math.floor(Math.random() * COLUMNS)
  };
  if (end_node.row == start_node.row && end_node.column == start_node.column) {
    end_node.row = (end_node.row + 1) % ROWS;
    end_node.column = (end_node.column + 1) % COLUMNS;
  }
}


function drawGrid(grid) {
  let x = 0, y = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      x = j * TILE_SIZE;
      y = i * TILE_SIZE;
      ctx.drawImage(tileset, grid[i][j]*64,0, 64,64, x,y, TILE_SIZE,TILE_SIZE);
    }
  }
}

function drawResult(res) {
  if(res.path.length == 0) return;

  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(190,170,135,0.8)";
  ctx.lineJoin = "round";

  let x = TILE_SIZE * (0.5 + res.path[0].column);
  let y = TILE_SIZE * (0.5 + res.path[0].row);
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (var i = 1; i < res.path.length; i++) {
    x = TILE_SIZE * (0.5 + res.path[i].column);
    y = TILE_SIZE * (0.5 + res.path[i].row);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.closePath();
}

function drawStartEndNode(start, end) {
    let x = TILE_SIZE * start.column;
    var y = TILE_SIZE * start.row;
    ctx.drawImage(tileset, 3*64,0, 64,64, x,y, TILE_SIZE, TILE_SIZE);
    x = TILE_SIZE * end.column;
    y = TILE_SIZE * end.row;
    ctx.drawImage(tileset, 4*64,0, 64,64, x,y, TILE_SIZE, TILE_SIZE);
}

function displayInfo(result) {
  let p = $info_text.children[0];
  p.textContent = "Path Length: " + result.path.length + " tile" + (result.path.length > 1 ? "s" : "")
  + " / Computed Cost: " + result.cost
  + " / Computation Time: " + (result.time).toFixed(3) + " ms";
}



function mouseDown(e) {
  let cell = coordToGrid(getMousePosition(e));
  if(cell.row == start_node.row && cell.column == start_node.column) {
    mouseObject.last_column = cell.column;
    mouseObject.last_row = cell.row;
    mouseObject.value = "start";
  }
  else if(cell.row == end_node.row && cell.column == end_node.column) {
    mouseObject.last_column = cell.column;
    mouseObject.last_row = cell.row;
    mouseObject.value = "end";
  }
  else if(cell.value == 0 || cell.value == 1 || cell.value == 2 ){
    grid[cell.row][cell.column] = config.tile;
    mouseObject.value = config.tile;
  }
  mouseObject.clicking = true;
  computePath();
}

function mouseMove(e){
  if(mouseObject.clicking){
    let new_cell = coordToGrid(getMousePosition(e));
    if(mouseObject.value == "start"){
      start_node.row = new_cell.row;
      start_node.column = new_cell.column;
    }
    else if(mouseObject.value == "end"){
      end_node.row = new_cell.row;
      end_node.column = new_cell.column;
    }
    else{
      grid[new_cell.row][new_cell.column] = config.tile;
    }
    mouseObject.last_row = new_cell.row;
    mouseObject.last_column = new_cell.column;
    computePath();
  }
}

function mouseUp(e){ mouseObject.clicking = false; }
function mouseOut(e){ mouseObject.clicking = false; }

function getMousePosition(e){
  let rect = canvas.getBoundingClientRect();
  return {
    x: Math.round( (e.clientX - rect.left)/(rect.right - rect.left) * canvas.width ),
    y: Math.round( (e.clientY - rect.top)/(rect.bottom - rect.top) * canvas.height )
  };
}

function coordToGrid(position) {
  let r = Math.floor(position.y/TILE_SIZE);
  let c = Math.floor(position.x/TILE_SIZE);
  return {
    column: c,
    row: r,
    value: grid[r][c]
  };
}
