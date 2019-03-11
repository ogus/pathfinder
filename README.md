# Pathfinder

> A collection of common pathfinding algorithms

Pathfinding is the process of *finding* the shortest *path* in a graph between two nodes.

The module currently contains 3 different algorithm:
 + Breadth First Search
 + Greedy Breadth First Search
 + Dijkstra
 + A*

I encourage you to read [the article](https://www.redblobgames.com/pathfinding/a-star/introduction.html) by Amit Patel, which gives more details about each algorithm.


## Usage

The module provides many different ways to compute pathfinding, from any of the given algorithm, with static methods, instance methods, or asynchronous wrappers.

Because pathfinding algorithms need a graph to work with, a `Graph` class is included with basic methods for instanciation and modification. However, you can also use your perfectly optimized home-made graph structure instead. Check the [API](#api) to make sure it contains the required methods.

```js
var Pathfinder = require('pathfinder');

// Build a graph
var MapGraph = new Pathfinder.Graph();
MapGraph.addNode("town");
MapGraph.addNode("forest");
MapGraph.addNode("river");
MapGraph.addNode("treasure");
// It is quicker to go through the forest than through the river
MapGraph.addEdge("town", "forest", 5);
MapGraph.addEdge("town", "river", 10);
MapGraph.addEdge("forest", "treasure", 2);
MapGraph.addEdge("river", "treasure", 2);

// Find a path
var path = Pathfinder.searchAStar(MapGraph, "town", "treasure");
console.log(path);
//output: ["town", "forest", "treasure"]
```

## API

### Static methods

#### `Pathfinder.seachBFS(graph, startNode, endNode)`

#### `Pathfinder.searchGreedyBFS(graph, startNode, endNode, heuristic)`

#### `Pathfinder.searchDijkstra(graph, startNode, endNode)`

#### `Pathfinder.searchAStar(graph, startNode, endNode, heuristic)`

### Pathfinder instance

#### `new Pathfinder.Instance(graph, heuristic)`

#### `instance.seachBFS(startNode, endNode)`

#### `instance.searchGreedyBFS(startNode, endNode, heuristic)`

#### `instance.searchDijkstra(startNode, endNode)`

#### `instance.searchAStar(startNode, endNode, heuristic)`

### Custom Graph


## Installation

You can install the module with [npm](https://www.npmjs.com/)
```sh
npm install pathfinder
```

You can import the module with a CDN like [unpkg](https://unpkg.com/)
```html
<script type="text/javascript" src="https://unpkg.com/pathfinder@latest"></script>
```

You can clone the repository & include the `pathfinder.js` file in your project:
```sh
git clone https://github.com/ogus/pathfinder.git
```


## License

This project is licensed under the WTFPL - see [LICENSE](LICENSE) for more details
