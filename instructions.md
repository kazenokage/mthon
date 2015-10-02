# Your guide to Solinor mthon

## Background
The universe is full of stars - you know, like millions or even more! But as we're almost ready to embark from our boring solar system and roam the unknown, we need to know where we're going! Luckily enough, engineers have already come up with a navigational system that only need some small piece of software that'll show us the right way!

## The Task
You will be given a [JSON](http://www.json.org) representation of the stars where the first star is your *starting point*. The *goal* will be defined at the end of the dataset, with `EndPoint` telling the star's _id. Your task is to find the shortest path between these two vertices with an algorithm that is as fast as possible. Others tasks might follow.

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

### Tools
* You will need a text editor that can edit text. Plain and simple. You can also use your preferred IDE, or a trendy/lightweight/awesome-looking such as [Atom](https://atom.io)
* Google will be your best friend the next 24h
* Using git would make sense, but it's up to your team to decide if you're sensible enough.

### Local developing
You can download the package <HERE>. It contains multiple files but you should only worry about the one called algo.js. Inside it is a place where you can develop your algorithm. You can expect the data to look like what was shown above. The algorithm's output should be an array of ids that form the path from a to b.

Sample answer: `[0, 15, 77, 14, 12, 75]` 

To make the visualization run, you also need to provide array of connections (pairs) of stars, i.e. `[[1,4],[76,23]]`.

In order to test your algorithm locally, open the index.html file from the package, open the developer tools of your browser and find the JavaScript console (you might need to enable the dev-tools for your browser, Google and the organizers can help you with this). 

## How to submit
Go to mthon.solinor.com, and click the link *submit*. Remember to choose your own team from the dropdown! Press submit only once after choosing your algo.js file. You will get a response whether your algorithm is performing correctly or not. Or you might crash our system (it's easy to get up and running again, no worries). Crashing our system recurringly will give you negative points, so don't push your luck here.

## How we will score you
Your solution will be scored by the following criteria:
* Does it complete the given task
* How fast it is
* The length of your solution (path)
* The mathematical proofing
* Code format and structure


