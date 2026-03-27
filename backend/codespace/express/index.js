const http = require('http');

// Helper to check Node.js version as per specification constraints.
// "A minimum Node.js version of 18 or higher is necessary for installation and execution."
const currentNodeVersion = process.versions.node.split('.').map(Number);
if (currentNodeVersion[0] < 18) {
  console.warn(`Warning: This package requires Node.js version 18 or higher. You are running ${process.versions.node}. It may not function as expected.`);
}

/**
 * Custom Response object to be passed to route handlers.
 * Provides the `send` method as specified.
 * @class
 */
class CleanRoomResponse {
  constructor(nativeRes) {
    this.nativeRes = nativeRes;
    this.sent = false; // To prevent sending multiple responses
  }

  /**
   * Sends an HTTP response back to the client.
   * Specification: "This method takes content as an argument and uses it as the body of the response, effectively ending the request-response cycle."
   * Specification: "The documentation does not specify the behavior of 'ResponseObject.send' if the 'body' argument is not a string."
   * For clean room, adhering strictly to 'string' type and throwing for others due to no explicit coercion rule.
   *
   * @param {string} body - The content to be sent as the body of the HTTP response.
   * @throws {Error} If `body` is not a string or if response has already been sent.
   */
  send(body) {
    if (this.sent) {
      console.warn('Warning: Response already sent. Cannot send multiple responses.');
      return; // Silently ignore subsequent calls to send after the first one.
    }

    if (typeof body !== 'string') {
      throw new Error('ResponseObject.send: body must be a string.');
    }

    // Default headers and status code as per typical HTTP response.
    this.nativeRes.setHeader('Content-Type', 'text/plain');
    this.nativeRes.statusCode = 200; 
    this.nativeRes.end(body);
    this.sent = true;
  }
}

/**
 * Represents an Express-like application instance.
 * Provides `get` for routing and `listen` for starting the server.
 * @class
 */
class CleanRoomApplication {
  constructor() {
    this.routes = [];
    this.server = null; // Holds the http.Server instance
  }

  /**
   * Registers a handler function for HTTP GET requests on a specified URL path.
   * Specification: "The 'get' method must accept a string representing a URL path as its first argument and a function as its second argument."
   * Specification: "The documentation does not specify the behavior of 'ApplicationInstance.get' when provided with invalid or malformed 'path' strings."
   * For clean room, validating types and throwing errors for invalid inputs to ensure robust behavior.
   *
   * @param {string} path - The URL path (e.g., '/' or '/users') to which the handler function should respond.
   * @param {function} handler - A callback function invoked when a GET request matches the specified path.
   * @returns {CleanRoomApplication} The application instance itself, allowing for method chaining.
   * @throws {Error} If `path` is not a string or `handler` is not a function.
   */
  get(path, handler) {
    if (typeof path !== 'string' || path.length === 0) {
      throw new Error('ApplicationInstance.get: path must be a non-empty string.');
    }
    if (typeof handler !== 'function') {
      throw new Error('ApplicationInstance.get: handler must be a function.');
    }

    this.routes.push({ method: 'GET', path, handler });
    return this;
  }

  /**
   * Starts the HTTP server and binds it to a specific port, making it listen for incoming connections.
   * Specification: "The 'listen' method must accept a number representing the port as its first argument."
   * Specification: "The 'listen' method must optionally accept a function as its second argument, which serves as a callback."
   * Specification: "The documentation does not specify the behavior of 'ApplicationInstance.listen' if the 'port' argument is not a valid number."
   * For clean room, validating port range and type, and callback type.
   *
   * @param {number} port - The numerical port number on which the HTTP server should listen.
   * @param {function} [callback] - Optional function invoked after the server has successfully started.
   * @throws {Error} If `port` is not a valid positive integer or if `callback` is provided but not a function.
   */
  listen(port, callback) {
    if (typeof port !== 'number' || !Number.isInteger(port) || port <= 0 || port > 65535) {
      throw new Error('ApplicationInstance.listen: port must be a positive integer between 1 and 65535.');
    }
    if (callback && typeof callback !== 'function') {
      throw new Error('ApplicationInstance.listen: callback must be a function if provided.');
    }

    // Create the Node.js native HTTP server.
    this.server = http.createServer((req, res) => {
      const cleanRoomRes = new CleanRoomResponse(res);

      // Find the first route that matches the incoming request's method and URL.
      // This simplistic matching only considers exact path matches for GET requests.
      const matchedRoute = this.routes.find(route =>
        route.method === req.method && route.path === req.url
      );

      if (matchedRoute) {
        try {
          // Invoke the registered handler with the native request and our custom response object.
          matchedRoute.handler(req, cleanRoomRes);
        } catch (handlerError) {
          // In case of an error within the handler, log it and send a 500 if response hasn't been sent yet.
          console.error(`Error in route handler for ${req.method} ${req.url}:`, handlerError);
          if (!cleanRoomRes.sent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Internal Server Error');
          }
        }
      } else {
        // If no route matches, send a 404 Not Found response.
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`Cannot ${req.method} ${req.url}`);
      }
    });

    // Start the server and bind it to the specified port.
    this.server.listen(port, () => {
      // The optional callback is executed once the server has successfully started listening.
      if (callback) {
        callback();
      }
    });

    // Handle server-level errors, e.g., port already in use (EADDRINUSE).
    // Specification notes: "The documentation does not explicitly detail error handling mechanisms for ... runtime failures (e.g., server unable to start due to port unavailability)."
    // Logging is a minimalist approach consistent with clean room principles.
    this.server.on('error', (err) => {
      console.error(`Server failed to start or encountered an error on port ${port}: ${err.message}`);
    });
  }
}

/**
 * The default export of the 'express' package.
 * When invoked, it initializes and returns a new Express application object.
 * Specification: "when called without arguments".
 * Specification: "The documentation does not explicitly define behavior for invoking the default 'express' function with arguments."
 * As a minimalist framework, it implicitly ignores any arguments if provided, focusing only on the return value to remain unopinionated.
 *
 * @returns {CleanRoomApplication} An Express application instance.
 */
function createApplication() {
  return new CleanRoomApplication();
}

module.exports = createApplication;
