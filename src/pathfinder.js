(function (root, factory) {
  if (typeof define === 'function' && define.amd) { define([], factory); }
  else if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.Pathfinder = factory(); }
}(this, function () {
  'use strict';

  // Priority queue structure used for border expansion during pathfinding
  var Border = function () {
    this.data = [];
    this.compare = function (a, b) {
      return b.score - a.score;
    };
  }

  Border.prototype = {
    _up: function (idx) {
      var item = this.data[idx];
      var parent = null, current = null;
      while (idx > 0) {
        parent = (idx - 1) >> 1;
        current = this.data[parent];
        if (this.compare(item, current) < 0) {
          break;
        }
        this.data[idx] = current;
        idx = parent;
      }
      this.data[idx] = item;
    },

    _down: function (idx) {
      var half = this.data.length >> 1;
      var item = this.data[idx];
      var left = null, right = null, best = null;
      while (idx < half) {
        left = (idx << 1) + 1;
        right = left + 1;
        best = this.data[left];
        if (right < this.data.length && this.compare(this.data[right], best) > 0) {
          left = right;
          best = this.data[right];
        }
        if (this.compare(best, item) < 0) {
          break;
        }
        this.data[idx] = best;
        idx = left;
      }
      this.data[idx] = item;
    },

    push: function (node, score) {
      score = (typeof score != 'undefined') ? score : 0;
      this.data.push({node: node, score: score});
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
      return top.node;
    },

    length: function () {
      return this.data.length;
    }
  };

  // Graph-like structure to keep track of nodes links and costs during pathfinding
  var Path = function () {
    this.nodes = [];
    this.costs = {};
    this.links = {};
  }

  Path.prototype = {
    start: function (startNode) {
      this.nodes.push(startNode);
      this.links[0] = null;
      this.costs[0] = 0;
    },

    link: function (currentNode, nextNode, cost) {
      if (!this.contains(currentNode)) {
        this.nodes.push(currentNode);
      }
      if (!this.contains(nextNode)) {
        this.nodes.push(nextNode);
      }
      var nextIndex = this.nodes.indexOf(nextNode);
      this.links[nextIndex] = this.nodes.indexOf(currentNode);
      this.costs[nextIndex] = (typeof cost != 'undefined') ? cost : 0;
    },

    cost: function (node) {
      return this.contains(node) ? this.costs[this.nodes.indexOf(node)] : 0;
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
  };


  // Graph structure, to store nodes data and adjacency properties
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
        var idx1 = this.getNodeId(node1);
        var idx2 = this.getNodeId(node2)
        if (this.edges[idx1].hasOwnProperty(idx2)) {
          return this.edges[idx1][idx2];
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
    path.start(startNode);
    var border = new Array();
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
    var path = new Path();
    path.start(startNode);
    var border = new Border();
    border.push(startNode);
    var currentNode = null, nextNode = null, adjacentNodes = null;
    while (border.length() > 0) {
      currentNode = border.pop();
      if (currentNode === endNode) {
        return path.export(endNode);
      }
      adjacentNodes = graph.getAdjacentNodes(currentNode);
      for (var i = 0; i < adjacentNodes.length; i++) {
        nextNode = adjacentNodes[i];
        if (!path.contains(nextNode)) {
          var h = heuristic(nextNode, endNode);
          path.link(currentNode, nextNode);
          border.push(nextNode, h);
        }
      }
    }
    return path.export(currentNode);
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
    var path = new Path();
    path.start(startNode);
    var border = new Border();
    border.push(startNode);
    var currentNode = null, nextNode = null, adjacentNodes = null;
    var newCost = 0;
    while (border.length() > 0) {
      currentNode = border.pop();
      if (currentNode === endNode) {
        return path.export(endNode);
      }
      adjacentNodes = graph.getAdjacentNodes(currentNode);
      for (var i = 0; i < adjacentNodes.length; i++) {
        nextNode = adjacentNodes[i];
        newCost = path.cost(currentNode) + graph.getCost(currentNode, nextNode);
        if (!path.contains(nextNode) || newCost < path.cost(nextNode)) {
          path.link(currentNode, nextNode, newCost);
          border.push(nextNode, newCost);
        }
      }
    }
    return path.export(currentNode);
  };

  /**
   * A-star algorithm
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
    var path = new Path();
    path.start(startNode);
    var border = new Border();
    border.push(startNode);
    var currentNode = null, nextNode = null, adjacentNodes = null;
    var newCost = 0;
    while (border.length() > 0) {
      currentNode = border.pop();
      if (currentNode === endNode) {
        return path.export(endNode);
      }
      adjacentNodes = graph.getAdjacentNodes(currentNode);
      for (var i = 0; i < adjacentNodes.length; i++) {
        nextNode = adjacentNodes[i];
        newCost = path.cost(currentNode) + graph.getCost(currentNode, nextNode);
        if (!path.contains(nextNode) || newCost < path.cost(nextNode)) {
          var h = heuristic(nextNode, endNode);
          path.link(currentNode, nextNode, newCost);
          border.push(nextNode, newCost + h);
        }
      }
    }
    return path.export(currentNode);
  };


  /**
   * Public API definition
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
      }
    },

    Graph: Graph
  };

  return Pathfinder;
}));
