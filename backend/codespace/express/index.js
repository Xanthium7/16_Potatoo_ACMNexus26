const http = require('http');
const url = require('url');

/**
 * Represents the HTTP Request object.
 * A wrapper around Node.js's http.IncomingMessage.
 * This object encapsulates information about the incoming client request.
 * The detailed API surface is minimal as per specification.
 */
class Request {
  constructor(incomingMessage) {
    /**
     * @private
     * The raw Node.js IncomingMessage object.
     */
    this.originalRequest = incomingMessage;

    /**
     * The URL of the incoming request.
     * @type {string}
     */
    this.url = incomingMessage.url;

    /**
     * The HTTP method of the incoming request (e.g., 'GET', 'POST').
     * @type {string}
     */
    this.method = incomingMessage.method;

    /**
     * An object containing the request headers.
     * @type {object}
     */
    this.headers = incomingMessage.headers;

    // Additional properties like query parameters, body, etc.
    // are not explicitly detailed in the quick start specification,
    // so they are not implemented in this minimal clean room version.
  }
}

/**
 * Represents the HTTP Response object.
 * A wrapper around Node.js's http.ServerResponse.
 * This object provides methods for constructing and sending the HTTP response.
 */
class Response {
  constructor(serverResponse) {
    /**
     * @private
     * The raw Node.js ServerResponse object.
     */
    this.originalResponse = serverResponse;

    /**
     * The HTTP status code to be sent in the response.
     * Defaults to 200 (OK).
     * @type {number}
     */
    this.statusCode = 200;
  }

  /**
   * Sends an HTTP response to the client. The content type is automatically
   * inferred based on the type of the argument provided.
   * - String: sets 'Content-Type' to 'text/html'.
   * - Object (non-Buffer): sets 'Content-Type' to 'application/json' and sends JSON string.
   * - Buffer: sets 'Content-Type' to 'application/octet-stream' and sends raw buffer.
   *
   * @param {string | object | Buffer} body - The content to send as the HTTP response body.
   * @returns {Response} The Response object itself, allowing for method chaining.
   */
  send(body) {
    // Ensure the status code is set on the underlying Node.js response object
    this.originalResponse.statusCode = this.statusCode;

    // Infer Content-Type and send the body based on its type
    if (typeof body === 'string') {
      this.originalResponse.setHeader('Content-Type', 'text/html');
      this.originalResponse.end(body);
    } else if (typeof body === 'object' && body !== null && !Buffer.isBuffer(body)) {
      this.originalResponse.setHeader('Content-Type', 'application/json');
      try {
        this.originalResponse.end(JSON.stringify(body));
      } catch (e) {
        console.error('Error stringifying JSON response body:', e);
        // Fallback to plain text error if JSON serialization fails
        this.originalResponse.setHeader('Content-Type', 'text/plain');
        this.originalResponse.end('Error: Could not serialize response body to JSON.');
      }
    } else if (Buffer.isBuffer(body)) {
      this.originalResponse.setHeader('Content-Type', 'application/octet-stream');
      this.originalResponse.end(body);
    } else {
      // Default handling for other types, e.g., numbers, booleans, undefined
      // Convert to string and send as plain text
      this.originalResponse.setHeader('Content-Type', 'text/plain');
      this.originalResponse.end(String(body));
    }
    return this;
  }
}

/**
 * Represents an Express application instance.
 * This is the core object returned by calling the 'express()' function.
 * It provides the main API for configuring routes, middleware, and starting the HTTP server.
 */
class Application {
  constructor() {
    /**
     * @private
     * Stores registered routes. Each route is an object like { method: 'GET', path: '/foo', handler: Function }.
     * This clean room implementation uses simple string path matching.
     */
    this.routes = [];
  }

  /**
   * Routes HTTP GET requests to the specified path.
   * When a GET request matches the provided path, the associated callback function is executed.
   *
   * @param {string} path - The URL path for which to handle incoming GET requests.
   *                        This implementation supports simple string paths.
   * @param {function(Request, Response)} callback - A callback function invoked when a GET request
   *                                                  matches the path. It receives a Request object
   *                                                  and a Response object.
   * @returns {Application} The Application object itself, allowing for method chaining.
   * @throws {Error} If `path` is not a non-empty string or `callback` is not a function.
   */
  get(path, callback) {
    if (typeof path !== 'string' || path.length === 0) {
      throw new Error('app.get: \"path\" must be a non-empty string.');
    }
    if (typeof callback !== 'function') {
      throw new Error('app.get: \"callback\" must be a function.');
    }
    this.routes.push({ method: 'GET', path, handler: callback });
    return this;
  }

  /**
   * Starts an HTTP server and binds it to listen for connections on the specified port.
   * Once the server is successfully listening, an optional callback function is executed.
   *
   * @param {number} port - The port number on which the HTTP server should listen.
   * @param {function} [callback] - An optional callback function executed once the server
   *                                  has successfully started listening.
   * @returns {http.Server} An instance of Node.js's native HTTP server object,
   *                         which can be used for further server management or shutdown.
   * @throws {Error} If `port` is not a positive integer or `callback` is provided but not a function.
   */
  listen(port, callback) {
    if (typeof port !== 'number' || port <= 0 || !Number.isInteger(port)) {
      throw new Error('app.listen: \"port\" must be a positive integer.');
    }
    if (callback !== undefined && typeof callback !== 'function') {
      throw new Error('app.listen: \"callback\", if provided, must be a function.');
    }

    const server = http.createServer((req, res) => {
      const request = new Request(req);
      const response = new Response(res);

      const parsedUrl = url.parse(req.url);
      const pathname = parsedUrl.pathname; // Pathname without query string
      const method = req.method;

      let routeFound = false;
      for (const route of this.routes) {
        // Simple string comparison for path matching and method matching.
        // The specification mentions "string pattern, or a regular expression"
        // for paths, which would require more advanced routing logic.
        // This clean room implementation adheres to the explicit quick start
        // example of simple string paths.
        if (route.method === method && route.path === pathname) {
          routeFound = true;
          try {
            // Execute the route handler with the custom Request and Response objects
            route.handler(request, response);
          } catch (handlerError) {
            console.error('Error occurred in route handler for %s %s:', method, pathname, handlerError);
            // If the handler throws an error and the response has not yet been sent,
            // send a 500 Internal Server Error.
            if (!res.headersSent) {
              response.statusCode = 500;
              response.send('Internal Server Error');
            }
          }
          break; // Stop after finding the first matching route
        }
      }

      if (!routeFound) {
        // If no route matched the incoming request, send a 404 Not Found response.
        if (!res.headersSent) { // Ensure no headers were sent by any preceding logic
          response.statusCode = 404;
          response.send(`Cannot ${method} ${pathname}`);
        }
      }
    });

    // Start the server on the specified port.
    // The native http.Server object handles potential errors like port in use
    // by emitting an 'error' event.
    server.listen(port, callback);
    return server;
  }
}

/**
 * The default export of the package. When invoked without arguments,
 * it initializes and returns an Express Application instance.
 *
 * @returns {Application} An Express Application object, providing methods
 *                        for routing, middleware, and server management.
 */
function express() {
  return new Application();
}

// Export the express function as the default module export for CommonJS.
module.exports = express;
