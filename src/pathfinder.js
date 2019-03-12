(function (root, factory) {
  if (typeof define === 'function' && define.amd) { define([], factory); }
  else if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.Pathfinder = factory(); }
}(this, function () {
  'use strict';

  var Queue = function (data, compare) {
    this.data = (typeof data !== 'undefined') ? data : [];
    this.compare = (typeof compare == 'function') ? compare : function (a, b) {
      return b - a;
    };
    if (this.data.length > 0) {
      for (var i = (this.data.length >> 1) - 1; i >= 0; i--) {
        this._down(i);
      }
    }
  }

  Queue.prototype = {
    _up: function (idx) {
      var item = this.data[idx];
      var parent = null, current = null;
      while (idx > 0) {
        parent = (idx - 1) >> 1;
        current = this.data[parent];
        if (this.compare(item, current) >= 0) {
          break;
        }
        data[idx] = current;
        idx = parent;
      }
      data[idx] = item;
    },

    _down: function (idx) {
      var half = this.data.length >> 1;
      var item = this.data[idx];
      var left = null, right = null, best = null;
      while (idx < half) {
        left = (idx << 1) + 1;
        right = left + 1;
        best = data[left];
        if (right < this.data.length && this.compare(data[right], best) < 0) {
          left = right;
          best = data[right];
        }
        if (this.compare(best, item) >= 0) {
          break;
        }
        data[idx] = best;
        idx = left;
      }
      data[idx] = item;
    },

    push: function (item) {
      this.data.push(item);
      this._up(this.data.length - 1);
    },

    pop: function () {
      if (this.data.length == 0) {
        return null;
      }
      var top = this.data[0];
      var bottom = this.data.pop();
      if (this.data.length > 0) {
        this.data[0] = bottom;
        this._down(0);
      }
      return top;
    },

    length: function () {
      return this.data.length;
    }
  };

  // function BinaryHeap(scoreFunction) {
  //   this.data = [];
  //   this.score = scoreFunction;
  // }
  //
  // BinaryHeap.prototype = {
  //   length: function () {
  //     return this.data.length;
  //   },
  //
  //   push: function (e) {
  //     this.data.push(e);
  //     this.sinkDown(this.data.length - 1);
  //   },
  //
  //   pop: function () {
  //     var result = this.data[0];
  //     var end = this.data.pop();
  //     if (this.data.length > 0) {
  //       this.data[0] = end;
  //       this.bubbleUp(0);
  //     }
  //     return result;
  //   },
  //
  //   sinkDown: function (n) {
  //     var element = this.data[n];
  //     var score = this.score(element);
  //     var idx = 0, parent = null;
  //     while (n > 0) {
  //       idx = ((n + 1) >> 1) - 1;
  //       parent = this.data[idx];
  //       if (score < this.score(parent)) {
  //         this.data[idx] = element;
  //         this.data[n] = parent;
  //         n = idx;
  //       }
  //       else {
  //         break;
  //       }
  //     }
  //   },
  //
  //   bubbleUp: function (n) {
  //     var element = this.data[n];
  //     var score = this.score(element);
  //     var idx1, idx2, child, child_score = 0, swap = null;
  //     while (true) {
  //       idx2 = (n + 1) << 1;
  //       idx1 = idx2 - 1;
  //       swap = null;
  //       if (idx1 < this.data.length) {
  //         child_score = this.score(this.data[idx1]);
  //         if (child_score < score) {
  //           swap = idx1;
  //         }
  //       }
  //       if (idx2 < this.data.length) {
  //         if (this.score(this.data[idx2]) < (swap === null ? score : child_score)) {
  //           swap = idx2;
  //         }
  //       }
  //       if (swap !== null) {
  //         this.data[n] = this.data[swap];
  //         this.data[swap] = element;
  //         n = swap;
  //       }
  //       else {
  //         break;
  //       }
  //     }
  //   }
  // };

  var Path = function (startNode) {
    this.nodes = [];
    this.links = {};
  }

  Path.prototype = {
    init: function (startNode) {
      this.nodes.push(startNode);
      this.links[0] = null;
    },

    link: function (currentNode, nextNode) {
      if (!this.contains(currentNode)) {
        this.nodes.push(currentNode);
      }
      if (!this.contains(nextNode)) {
        this.nodes.push(nextNode);
      }
      this.links[this.nodes.indexOf(nextNode)] = this.nodes.indexOf(currentNode);
    },

    contains: function (node) {
      return this.nodes.indexOf(node) > -1;
    },

    export: function (endNode) {
      var result = [];
      if (typeof endNode != 'undefined') {
        var nodeId = this.nodes.indexOf(endNode);
        while (nodeId > 0) {
          result.push(this.nodes[nodeId]);
          nodeId = this.links[nodeId];
        }
      }
      result.push(this.nodes[0]);
      result.reverse();
      return result;
    }
  }

  var Graph = function () {
    this.nodes = [];
    this.edges = {};
  }

  Graph.prototype = {
    get: function (func) {
      for (var i = 0; i < this.nodes.length; i++) {
        if (func(this.nodes[i])) {
          return this.nodes[i];
        }
      }
      return null;
    },

    getNodeId: function (node) {
      return this.nodes.indexOf(node);
    },

    hasNode: function (node) {
      return this.nodes.indexOf(node) > -1;
    },

    addNode: function (node) {
      if (!this.hasNode(node)) {
        this.nodes.push(node);
        this.edges[this.nodes.length - 1] = {};
      }
    },

    addEdge: function (node1, node2, weight) {
      weight = (weight !== undefined) ? weight : 0;
      this.addNode(node1);
      this.addNode(node2);
      this.edges[this.getNodeId(node1)][this.getNodeId(node2)] = weight;
      this.edges[this.getNodeId(node2)][this.getNodeId(node1)] = weight;
    },

    addDirectedEdge: function (node1, node2, weight) {
      weight = (weight !== undefined) ? weight : 0;
      this.addNode(node1);
      this.addNode(node2);
      this.edges[this.getNodeId(node1)][this.getNodeId(node2)] = weight;
    },

    getCost: function (node1, node2) {
      if (this.hasNode(node1) && this.hasNode(node2)) {
        var edge = this.edges[this.getNodeId(node1)];
        if (edge.hasOwnProperty(this.getNodeId(node1))) {
          return edge[node2];
        }
      }
      return null;
    },

    getAdjacentNodes: function (node) {
      if (this.hasNode(node)) {
        var nodeId = this.getNodeId(node);
        var adjacentId = Object.keys(this.edges[nodeId]);
        var adjacentNodes = [];
        for (var i = 0; i < adjacentId.length; i++) {
          adjacentNodes.push(this.nodes[adjacentId[i]]);
        }
        return adjacentNodes;
      }
      return null;
    },

    clear: function () {
      this.nodes = [];
      this.edges = {};
    }
  };

  /**
   * Breadth First Search algorithm
   *
   * Compute the shortest path in a graph without any heuristic.
   * It searchs for the end node by testing successively all nodes
   * around the start node () similar to a flood fill).
   *
   * @param graph A graph with nodes and edges
   * @param startNode A node from the graph
   * @param endNode A node from the graph
   */
  function bfs(graph, startNode, endNode) {
    var path = new Path();
    var border = new Array();
    if (!startNode || !endNode) {
      return path.export();
    }
    path.init(startNode);
    border.push(startNode);
    var currentNode = null, nextNode = null, adjacentNodes = null;
    while (border.length > 0) {
      currentNode = border.shift();
      if (currentNode === endNode) {
        return path.export(endNode);
      }
      adjacentNodes = graph.getAdjacentNodes(currentNode);
      for (var i = 0; i < adjacentNodes.length; i++) {
        nextNode = adjacentNodes[i];
        if (!path.contains(nextNode)) {
          path.link(currentNode, nextNode);
          border.push(nextNode);
        }
      }
    }
    return path.export(currentNode);
  };

  /**
   * Greedy Best First Search algorithm
   *
   * The algorithm uses a distance heuristic to optimize the search from the
   * start node to the end node, by choosing nodes with a low heuristic first.
   *
   * @param graph A graph with nodes and edges
   * @param startNode A node from the graph
   * @param endNode A node from the graph
   * @param heuristic A function that compute the proximity of two nodes
   */
  function bfsGreedy(graph, startNode, endNode, heuristic) {
    if (!startNode || !endNode) {
      return createPath(null);
    }
    var path = {};
    path[startNode] = null;
    // var border = new BinaryHeap(function (e) {
    //   return e.score;
    // });
    var border = new Queue([], function (a, b) {
      return b.score - a.score;
    });
    border.push({
      node: startNode,
      score: 0
    });
    var currentNode = null, nextNode = null, adjacentNodes = null;
    while (border.length() > 0) {
      currentNode = border.pop();
      if (currentNode === endNode) {
        return createPath(path, startNode, endNode);
      }
      adjacentNodes = graph.getAdjacentNodes(currentNode);
      for (var i = 0; i < adjacentNodes.length; i++) {
        nextNode = adjacentNodes[i];
        if (!path.hasOwnProperty(nextNode)) {
          path[nextNode] = currentNode;
          border.push({
            node: nextNode,
            score: heuristic(nextNode, endNode)
          });
        }
      }
    }
    return createPath(path, startNode, currentNode);
  };

  /**
   * Dijkstra algorithm
   *
   * The algorithm uses the travel cost between each node to optimize the search
   * from start to end, by choosing nodes with a low travel cost first.
   * This ensure the path found is the shortest.
   *
   * @param graph A graph with nodes and edges
   * @param startNode A node from the graph
   * @param endNode A node from the graph
   */
  function dijkstra(graph, startNode, endNode) {
    if (!startNode || !endNode) {
      return createPath(null);
    }
    var path = {};
    path[startNode] = null;
    var pathCost = {};
    pathCost[startNode] = 0;
    // var border = new BinaryHeap(function (e) {
    //   return e.score;
    // });
    var border = new Queue([], function (a, b) {
      return b.score - a.score;
    });
    border.push({
      node: startNode,
      score: 0
    });
    var currentNode = null, nextNode = null, adjacentNodes = null;
    var newCost = 0;
    while (border.length() > 0) {
      currentNode = border.pop();
      if (currentNode === endNode) {
        return createPath(path, startNode, endNode);
      }
      adjacentNodes = graph.getAdjacentNodes(currentNode);
      for (var i = 0; i < adjacentNodes.length; i++) {
        nextNode = adjacentNodes[i];
        newCost = pathCost[currentNode] + graph.getCost(currentNode, nextNode);
        if (!path.hasOwnProperty(nextNode) || newCost < pathCost[nextNode]) {
          path[nextNode] = currentNode;
          pathCost[nextNode] = newCost
          border.push({
            node: nextNode,
            score: newCost
          });
        }
      }
    }
    return createPath(path, startNode, currentNode);
  };

  /**
   * A* algorithm
   *
   * The algorithm is a combination of the Dijkstra algorithm
   * and the Greedy Best First Search algorithm.
   * It considers both the travel cost of each node and the distance
   * to the end node to optimize pathfinding.
   *
   * @param graph A graph with nodes and edges
   * @param startNode A node from the graph
   * @param endNode A node from the graph
   * @param heuristic A function that compute the proximity of two nodes
   */
  function astar(graph, startNode, endNode, heuristic) {
    if (!startNode || !endNode) {
      return createPath(null);
    }
    var path = {};
    path[startNode] = null;
    var pathCost = {};
    pathCost[startNode] = 0;
    // var border = new BinaryHeap(function (e) {
    //   return e.score;
    // });
    var border = new Queue([], function (a, b) {
      return b.score - a.score;
    });
    border.push({
      node: startNode,
      score: 0
    });
    var currentNode = null, nextNode = null, adjacentNodes = null;
    var newCost = 0;
    while (border.length() > 0) {
      currentNode = border.pop();
      if (currentNode === endNode) {
        return createPath(path, startNode, endNode);
      }
      adjacentNodes = graph.getAdjacentNodes(currentNode);
      for (var i = 0; i < neighbors.length; i++) {
        nextNode = adjacentNodes[i];
        newCost = pathCost[currentNode] + graph.getCost(currentNode, nextNode);
        if (!path.hasOwnProperty(nextNode) || newCost < pathCost[nextNode]) {
          path[nextNode] = currentNode;
          pathCost[nextNode] = newCost
          border.push({
            node: nextNode,
            score: newCost + heuristic(nextNode, endNode)
          });
        }
      }
    }
    return createPath(path, startNode, currentNode);
  };

  /**
   * Export the result of the pathfinding algorithm
   * by travelling backward thgough all nodes in the shortest path
   *
   * @param start The start node
   * @param end The end node
   */
  function createPath(path, start, end) {
    var result = new Array(0);
    if (path == null) {
      return result;
    }
    var node = end;
    while (node !== start) {
      result.push(node);
      node = path[node];
    }
    result.push(start);
    result.reverse();
    return result;
  }

  /**
   * Public API
   */

  var Pathfinder = {
    searchBFS: function (graph, startNode, endNode) {
      return bfs(graph, startNode, endNode);
    },

    searchGreedyBFS: function (graph, startNode, endNode, heuristic) {
      return bfsGreedy(graph, startNode, endNode, heuristic);
    },

    searchDijkstra: function (graph, startNode, endNode) {
      return dijkstra(graph, startNode, endNode);
    },

    searchAStar: function (graph, startNode, endNode, heuristic) {
      return astar(graph, startNode, endNode, heuristic);
    },

    search: function (type, graph, startNode, endNode, heuristic) {
      switch (type) {
        case "bfs":
          return bfs(graph, startNode, endNode);
        case "greedy-bfs":
          return bfsGreedy(graph, startNode, endNode, heuristic);
        case "dijkstra":
          return dijkstra(graph, startNode, endNode);
        case "astar":
          return astar(graph, startNode, endNode, heuristic);
        default:
          return null;
      }
    },

    searchAsync: function (type, graph, startNode, endNode, heuristic) {
      return new Promise(function(resolve, reject) {
        var result = Pathfinder.seatch(type, graph, startNode, endNode, heuristic);
        resolve(result);
      });
    },

    Instance: function (graph, heuristic) {
      this.graph = graph;
      this.heuristic = heuristic;

      this.seachBFS = function (startNode, endNode) {
        return bfs(this.graph, startNode, endNode);
      };

      this.searchGreedyBFS = function (startNode, endNode) {
        return bfsGreedy(this.graph, startNode, endNode, this.heuristic);
      };

      this.searchDijkstra = function (startNode, endNode) {
        return dijkstra(this.graph, startNode, endNode);
      };

      this.searchAStar = function (startNode, endNode, heuristic) {
        return astar(this.graph, startNode, endNode, this.heuristic);
      };

      this.search = function (type, startNode, endNode) {
        switch (type) {
          case "bfs":
            return bfs(this.graph, startNode, endNode);
          case "greedy-bfs":
            return bfsGreedy(this.graph, startNode, endNode, this.heuristic);
          case "dijkstra":
            return dijkstra(this.graph, startNode, endNode);
          case "astar":
            return astar(this.graph, startNode, endNode, this.heuristic);
          default:
            return null;
        }
      },

      this.searchAsync = function (type, startNode, endNode) {
        return new Promise(function(resolve, reject) {
          var result = this.search(type, startNode, endNode);
          resolve(result);
        }.bind(this));
      }
    },

    Graph: Graph
  };

  return Pathfinder;
}));
