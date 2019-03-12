# Pathfinder

 A collection of common pathfinding algorithms


## Intro

Pathfinding is the process of *finding* the shortest *path* in a graph between two nodes. It is commonly used in game for movement planning, or for solving mazes.

This module aims to provide a pathfinding library that is easy to use, and easy to customize.

 + It contains 4 different pathfinding algorithms:
  + Breadth First Search
  + Greedy Breadth First Search
  + Dijkstra
  + A*

 + You can choose to execute each algorithm with a static method, or instanciate a new object to handle all pathfinding operations.

 + The module also contains a built-in graph structure, but you can easily provide your own.

The implementation is mainly based on an [article](https://www.redblobgames.com/pathfinding/a-star/introduction.html) by [@redblobgames](https://github.com/redblobgames), which gives more details about each algorithm.


## Usage


```js
var Pathfinder = require('pathfinder');

// Build a graph
var MyGraph = new Pathfinder.Graph();
MyGraph.addNode("town");
MyGraph.addNode("forest");
MyGraph.addNode("river");
MyGraph.addNode("treasure");
// It is quicker to go through the forest than through the river
MyGraph.addEdge("town", "forest", 5);
MyGraph.addEdge("town", "river", 10);
MyGraph.addEdge("forest", "treasure", 2);
MyGraph.addEdge("river", "treasure", 2);

// Find a path
var path = Pathfinder.searchAStar(MyGraph, "town", "treasure");
console.log(path);
//output: ["town", "forest", "treasure"]
```

## API

### Static methods

#### `Pathfinder.seachBFS(graph, startNode, endNode)`

#### `Pathfinder.searchGreedyBFS(graph, startNode, endNode, heuristic)`

#### `Pathfinder.searchDijkstra(graph, startNode, endNode)`

#### `Pathfinder.searchAStar(graph, startNode, endNode, heuristic)`

#### `Pathfinder.search(type, graph, startNode, endNode, heuristic)`

#### `Pathfinder.searchAsync(type, graph, startNode, endNode, heuristic)`

### Pathfinder instance


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
