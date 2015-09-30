# Your guide to Solinor mthon

## The Task
You will be given a JSON representation of a graph and two vertices (a, b) that can be found from it. Your task is to find the shortest path between these two vertices with an algorithm that is as fast as possible. Others tasks might follow.

## The Data
Each vertex has an id, and x, y, and z coordinates. The maximum distance between two vertices is at most 30 units. Calculating the neighbors for each vertex is your job (inspecting the data might help you to do this faster).

### Data sample
```
{
  "stars": [{
    "_id": 2,
    "position": {
      "x": 33,
      "y": 69,
      "z": 91
    }
  }, {
    "_id": 5,
    "position": {
      "x": 93,
      "y": 18,
      "z": 70
    }
  },
  ...
  ]
}
```

## How to develop
You can download the package <HERE>. It contains multiple files but you should only worry about the one called algo.js. Inside it is a place where you can develop your algorithm. You can expect the data to look like what was shown above. The algorithm's output should be an array of ids that form the path from a to b.

Sample answer: `[0, 15, 77, 14, 12, 75]` 

In order to test your algorithm locally, open the index.html file from the package, open the developer tools of your browser and find the JavaScript console (you might need to enable the dev-tools for your browser, Google and the organizers can help you with this).

## How to submit
Go to mthon.solinor.com/viz, and find the submission form from the top of the page. Remember to choose your own team from the dropdown! Press submit only once after choosing your algo.js file. You will get a response whether your algorithm is performing correctly or not. Or you might crash our system (it's easy to get up and running again, no worries).

### Algo.js
