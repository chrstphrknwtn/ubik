import path from 'path';
import http from 'http';
import { Server } from 'node-static';
import queryString from 'query-string';
import urlParse from 'url-parse-lax';

const PORT = 3000;
const staticServer = new Server(path.join(process.cwd(), 'public'), { cache: false });

function errorResponse(req, res, statusCode) {
  console.error(req, statusCode);
  res.statusCode = statusCode;
  res.end(String(res.statusCode));
}

const requestHandler = (req, res) => {
  staticServer.serve(req, res, (error, staticRes) => {
    // Not a static file, try to load a module from ./pages
    if (error && error.status === 404) {
      const parsedURL = urlParse(req.url);
      req.query = queryString.parse(parsedURL.query) || {};
      req.pathname = parsedURL.pathname;
      const moduleFile = parsedURL.pathname === '/' ? '/index' : parsedURL.pathname;
      const modulePath = path.join(process.cwd(), 'pages', moduleFile);
      try {
        const module = require(modulePath);
        module.default(req, res);
        console.log(`/pages${moduleFile}`, 200);
        delete require.cache[require.resolve(modulePath)];
      } catch (error_) {
        errorResponse(`/pages${moduleFile}`, res, error_.code === 'MODULE_NOT_FOUND' ? 404 : 500);
      }
    // A static file was served successfully
    } else {
      console.log(req.url, staticRes.status);
    }
  });
};

http.createServer(requestHandler).listen(PORT, error => {
  if (error) {
    return console.error(error);
  }

  console.log(`http://localhost:${PORT}`);
});
