# ubik

A local server thing for ES6 prototyping.

## Usage
Install globally

````shell
npm install -g ubik
````

Then serve your current working directory
````shell
ubik
````

`ubik` expects two directories to be present:
````
project
├─ pages
└─ public
````

## Page functions
Any route that doesn't match a static file will be served from `/pages`, for
example:

| Route | File |
| - | - |
| `localhost:3000` | `/pages/index.js` |
| `localhost:3000/banana` | `/pages/banana.js` or `/pages/banana/index.js` |

Pages can be nested to make any route you like.

To create a valid page, export a default function with node http request and
response arguments then send something back:
````js
export default (req, res) => {
  res.end('Hello, world!');
}
````

The `req` object is decorated with `pathname` and `query` properties.
````
http://localhost:3000/banana?brand=chiquita
````
````js
req.pathname // '/banana'
req.query // { brand: 'chiquita' }
````

## Static files
Anything in `/public` is served as expected.
