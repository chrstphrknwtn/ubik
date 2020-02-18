import path from 'path';
import http from 'http';
import connect from 'connect';
import queryString from 'query-string';
import urlParse from 'url-parse-lax';
import clearModule from 'clear-module';
import serveStatic from 'serve-static';

const PORT = 3000;
const publicPath = path.join(process.cwd(), 'public');
const pagesPath = path.join(process.cwd(), 'pages');

const moduleServer = (req, res, next) => {
  // Decorate request
  const parsedURL = urlParse(req.url);
  req.query = queryString.parse(parsedURL.query) || {};
  req.pathname = parsedURL.pathname;

  // Ignore typical static files that fallthrough from static server
  if (req.pathname.match(/[.](html|css|js|svg|jpe?g|png|gif|txt|pdf)$/)) {
    return next();
  }

  // Load module
  try {
    const modulePath = path.join(pagesPath, parsedURL.pathname);
    console.log(modulePath);
    const module = require(modulePath);
    module.default(req, res);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      return next(`Cannot GET ${req.pathname}`);
    }
  }

  // Empty require cache to ensure all imports are fresh for every req/res
  if (process.env.NODE_ENV !== 'production') {
    clearModule.all();
  }

  next();
};

const app = connect();
app.use(serveStatic(publicPath));
app.use(moduleServer);

const server = http.createServer(app);
server.listen(PORT);

// Handle server start success
server.addListener('listening', () => {
  console.log(`http://localhost:${server.address().port}`);
});

// Handle server start error
server.addListener('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.log(`http://localhost:${PORT} is already in use. Trying another port.`);
    setTimeout(() => {
      server.listen(0);
    }, 1000);
  } else {
    console.error(error);
    server.shutdown();
  }
});
