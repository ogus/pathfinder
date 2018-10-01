(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof module === 'object' && module.exports) {
      module.exports = factory();
  } else {
      root.Pathfinder = factory();
  }
}(this, function () {
  "use strict";

  /**
   * Binary Heap
   * These heap is used to store & retrieve nodes of the graph during the pathfinding process
   * @constructor
   * @param func The score function used to sort heap elements
   */
  function BinaryHeap(func) {
    this.data = [];
    this.score = func;
  }

  BinaryHeap.prototype = {
    push: function(element) {
      this.data.push(element);
      this.sinkDown(this.data.length - 1);
    },

    pop: function() {
      let result = this.data[0];
      let end = this.data.pop();
      if (this.data.length > 0) {
        this.data[0] = end;
        this.bubbleUp(0);
      }
      return result;
    },

    remove: function(element) {
      let idx = this.data.indexOf(element);
      let end = this.data.pop();
      if (idx !== this.data.length - 1) {
        this.data[i] = end;
        if (this.score(end) < this.score(element)) {
          this.sinkDown(idx);
        }
        else {
          this.bubbleUp(idx);
        }
      }
    },

    size: function() {
      return this.data.length;
    },

    rescoreElement: function(element) {
      this.sinkDown(this.data.indexOf(element));
    },

    sinkDown: function(n) {
      let element = this.data[n];
      let score = this.score(element);
      let idx = 0, parent = null;
      while (n > 0) {
        idx = ((n + 1) >> 1) - 1;
        parent = this.data[idx];
        if (score < this.score(parent)) {
          this.data[idx] = element;
          this.data[n] = parent;
          n = idx;
        }
        else {
          break;
        }
      }
    },

    bubbleUp: function(n) {
      let element = this.data[n];
      let score = this.score(element);
      let idx_1, idx_2, child, child_score = 0, swap = null;
      while (true) {
        idx_2 = (n + 1) << 1;
        idx_1 = idx_2 - 1;
        swap = null;
        if (idx_1 < this.data.length) {
          child_score = this.score(this.data[idx_1]);
          if (child_score < score) {
            swap = idx_1;
          }
        }
        if (idx_2 < this.data.length) {
          if (this.score(this.data[idx_2]) < (swap === null ? score : child_score)) {
            swap = idx_2;
          }
        }
        if (swap !== null) {
          this.data[n] = this.data[swap];
          this.data[swap] = element;
          n = swap;
        }
        else {
          break;
        }
      }
    }
  };

  /**
   * A simple example of a graph that can be used for pathfinding
   *
   * The graph contains nodes data, and needs two methods:
   *  - query a specific node
   *  - query the neighbors of a node
   *
   * @constructor
   */
  var Graph = function () {
    this.nodes = {};
  };

  Graph.prototype = {
    createId: function (a,b) {
      return "" + a + "," + b;
    },
    /**
     * Node query method
     */
    getNodeById: function(id) {
      if(this.nodes.hasOwnProperty(id)) {
        return this.nodes[id];
      }
      return null;
    },

    /**
     * Neighbors query method
     */
    getNeighbors: function(node) {
      let result = [], neighbor = null;
      for (let i = 0; i < node.neighbors.length; i++) {
        neighbor = this.getNodeById(node.neighbors[i]);
        if(neighbor != null) {
          result.push(neighbor);
        }
      }
      return result;
    },

    /**
     * Utility method to create a graph from a 2D Array of values
     * @param array A 2D Array
     * @param func A function used to convert each array value into a graph node
     */
    createFrom2DArray: function(array, func) {
      if (typeof func !== "function") {
        func = function (array, row, column) {
          return {row: row, column: column, value: array[row][column], cost: 0};
        };
      }

      this.nodes = {};
      let rows = array.length, columns = array[0].length;
      let node = null;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          node = func(array, i, j);
          if (node != null) {
            node.id = this.createId(i, j);

            node.neighbors = [];
            node.neighbors.push(this.createId(i-1,j));
            node.neighbors.push(this.createId(i+1,j));
            node.neighbors.push(this.createId(i,j-1));
            node.neighbors.push(this.createId(i,j+1));

            this.nodes[node.id] = node;
          }
        }
      }
    }
  };

  /**
   * Distance function used as a heuristic for travel cost from *a* to *b*
   */
  function heuristic(a, b) {
    return Math.abs(a.column - b.column) + Math.abs(a.row - b.row);
  }

  /**
   * Breadth First Search algorithm
   *
   * Compute the shortest path in a graph without considering travel cost
   * It searchs for the end node by testing successively all nodes
   * around the start node: it is similar to a flood fill.
   *
   * @param graph A graph object with nodes
   * @param start_node A node from the graph
   * @param end_node A node from the graph
   */
  function bfs(graph, start_node, end_node) {
    if (!start_node || !end_node) {
      return createPath(null, null);
    }

    let border = [];
    border.push(start_node);

    let node = null, next_node = null, neighbors = [];
    while (border.length > 0) {
      node = border.shift();

      if (node.id == end_node.id) {
        return createPath(start_node, end_node);
      }

      neighbors = graph.getNeighbors(node);
      for (let i = 0; i < neighbors.length; i++) {
        next_node = neighbors[i];

        if (!next_node.parent_node) {
          next_node.parent_node = node;
          border.push(next_node);
        }
      }
    }
    return createPath(start_node, null);
  };

  /**
   * Greedy Best First Search algorithm
   *
   * The algorithm uses a distance heuristic to find quickly a path from the
   * start node to the end node, by first testing nodes with a low heuristic
   *
   * @param graph A graph object with nodes
   * @param start_node A node from the graph
   * @param end_node A node from the graph
   */
  function greedy(graph, start_node, end_node) {
    if (!start_node || !end_node) {
      return createPath(null, null);
    }

    let border = new BinaryHeap(function (node) {
      return node.f;
    });
    border.push(start_node);

    let node = null, next_node = null, neighbors = [], new_cost = 0;
    while (border.size() > 0) {
      node = border.pop();

      if (node.id == end_node.id) {
        return createPath(start_node, end_node);
      }

      neighbors = graph.getNeighbors(node);
      for (let i = 0; i < neighbors.length; i++) {
        next_node = neighbors[i];

        if (!next_node.parent_node) {
          next_node.f = next_node.f || heuristic(next_node, end_node);
          next_node.parent_node = node;
          border.push(next_node);
        }
      }
    }

    return createPath(start_node, null);
  };

  /**
   * Dijkstra algorithm
   *
   * The algorithm takes in consideration the cost to travel each node, and
   * uses a heap to first test nodes with a low travel cost.
   * This ensure the path found is the shortest
   *
   * @param graph A graph object with nodes
   * @param start_node A node from the graph
   * @param end_node A node from the graph
   */
  function dijkstra(graph, start_node, end_node) {
    if (!start_node || !end_node) {
      return createPath(null, null);
    }

    let border = new BinaryHeap(function (node) {
      return node.f;
    });
    border.push(start_node);

    let node = null, next_node = null, neighbors = [], new_cost = 0;
    while (border.size() > 0) {
      node = border.pop();

      if (node.id == end_node.id) {
        return createPath(start_node, end_node);
      }

      neighbors = graph.getNeighbors(node);
      for (let i = 0; i < neighbors.length; i++) {
        next_node = neighbors[i];
        new_cost = (node.f || 0) + (next_node.cost || 0);

        if (!next_node.visited || new_cost < next_node.f) {
          next_node.f = new_cost;
          next_node.parent_node = node;

          if (!next_node.visited) {
            next_node.visited = true;
            border.push(next_node);
          }
          else{
            border.rescoreElement(next_node);
          }
        }
      }
    }

    return createPath(start_node, null);
  };

  /**
   * A* algorithm
   *
   * The algorithm is a combination of the Dijkstra algorithm
   * and the Greedy Best First Search algorithm.
   * It considers both the travel cost of each node and the distance
   * to the end node to find the shortest path quickly
   *
   * @param graph A graph object with nodes
   * @param start_node A node from the graph
   * @param end_node A node from the graph
   */
  function astar(graph, start_node, end_node) {
    if (!start_node || !end_node) {
      return createPath(null, null);
    }

    let border = new BinaryHeap(function (node) {
      return node.f;
    });
    border.push(start_node);

    let node = null, next_node = null, neighbors = [], new_cost = 0;
    while (border.size() > 0) {
      node = border.pop();

      if (node.id == end_node.id) {
        return createPath(start_node, end_node);
      }

      neighbors = graph.getNeighbors(node);
      for (let i = 0; i < neighbors.length; i++) {
        next_node = neighbors[i];
        new_cost = (node.g || 0) + (next_node.cost || 0);

        if (!next_node.visited || new_cost < next_node.g) {
          next_node.g = new_cost; // sum of all reach cost
          next_node.f = next_node.g + heuristic(next_node, end_node); // actual cost

          next_node.parent_node = node;
          if (!next_node.visited) {
            next_node.visited = true;
            border.push(next_node);
          }
          else{
            border.rescoreElement(next_node);
          }
        }
      }
    }

    return createPath(start_node, null);
  };

  /**
   * Export the result of the pathfinding algorithm
   * by travelling backward thgough all nodes in the shortest path

   * @param start The start node
   * @param end The end node
   */
  function createPath(start, end) {
    let result = {
      path: [],
      cost: 0
    };

    if (start != null && end != null) {
      let node = end;
      while (node.id !== start.id) {
        result.cost += node.f ? node.cost : 1;
        result.path.push(node);
        node = node.parent_node;
      }
      result.path.push(start);
    }
    return result;
  }


  /**
   * Object definition for export
   */
  var Pathfinder = {};

  // Static attributes / methods
  Pathfinder.Graph = Graph;
  Pathfinder.bfs = bfs;
  Pathfinder.greedy = greedy;
  Pathfinder.dijkstra = dijkstra;
  Pathfinder.astar = astar;

  // Promise methods
  Pathfinder.async = function (type, graph, start_node, end_node) {
    return new Promise(function(resolve, reject) {
      if (type === "bfs") {
        resove(bfs(graph, start_node, end_node));
      }
      else if (type === "greedy") {
        resove(greedy(graph, start_node, end_node));
      }
      else if (type === "dijkstra") {
        resove(dijkstra(graph, start_node, end_node));
      }
      else if (type === "astar") {
        resove(astar(graph, start_node, end_node));
      }
    });
  }

  // Web Worker
  if (typeof self !== "undefined") {
    self.onmessage = function(e) {
      let type = e.data.type;
      let path = null;

      if (type === "bfs") {
        path = bfs(graph, start_node, end_node);
      }
      else if (type === "greedy") {
        path = greedy(graph, start_node, end_node);
      }
      else if (type === "dijkstra") {
        path = dijkstra(graph, start_node, end_node);
      }
      else if (type === "astar") {
        path = astar(graph, start_node, end_node);
      }
      postMessage(path);
    }
  }

  return Pathfinder;
}));
