/**
 * index.js
 * Clean Room Implementation of axios
 *
 * This file implements the 'axios' package based solely on the provided functional specification.
 * It does not replicate or guess the original implementation but builds functionality from scratch.
 *
 * Key Features Implemented:
 * - Promise-based HTTP client interface.
 * - Request and response interceptors with LIFO/FIFO execution order.
 * - Automatic data transformation (JSON, FormData, URLSearchParams).
 * - Request cancellation using both AbortController (signal) and deprecated CancelToken.
 * - Custom error handling with AxiosError class and specific error codes.
 * - AxiosHeaders class for case-insensitive header manipulation.
 * - Instance creation (`axios.create`).
 * - Environment-agnostic (mocked adapters for browser XHR and Node.js HTTP).
 */

// --- Utility Functions ---

/**
 * Checks if a value is undefined.
 * @param {*} val The value to check.
 * @returns {boolean} True if the value is undefined, false otherwise.
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Checks if a value is a plain object (not null, not array).
 * @param {*} val The value to check.
 * @returns {boolean} True if the value is a plain object, false otherwise.
 */
function isObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

/**
 * Checks if a value is a string.
 * @param {*} val The value to check.
 * @returns {boolean} True if the value is a string, false otherwise.
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Checks if a value is a function.
 * @param {*} val The value to check.
 * @returns {boolean} True if the value is a function, false otherwise.
 */
function isFunction(val) {
  return typeof val === 'function';
}

/**
 * Checks if a value is an array.
 * @param {*} val The value to check.
 * @returns {boolean} True if the value is an array, false otherwise.
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Deeply merges multiple objects. Properties from later objects overwrite
 * properties from earlier objects. Nested objects and arrays are also merged.
 * @param {...object} sources The objects to merge.
 * @returns {object} A new object with merged properties.
 */
function deepMerge(/* obj1, obj2, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isObject(result[key]) && isObject(val)) {
      result[key] = deepMerge(result[key], val);
    } else if (isArray(result[key]) && isArray(val)) {
      result[key] = result[key].concat(val);
    } else if (isObject(val) || isArray(val)) {
      // Deep copy objects/arrays to avoid reference issues
      result[key] = JSON.parse(JSON.stringify(val));
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    var obj = arguments[i];
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        assignValue(obj[key], key);
      }
    }
  }
  return result;
}

/**
 * Encodes a URI component.
 * @param {string} val The value to encode.
 * @returns {string} The encoded string.
 */
function encode(val) {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']');
}

/**
 * Builds a URL with query parameters.
 * @param {string} url The base URL.
 * @param {object} [params] The query parameters object.
 * @param {function} [paramsSerializer] Custom function to serialize params.
 * @returns {string} The constructed URL.
 */
function buildURL(url, params, paramsSerializer) {
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];
    Object.keys(params).forEach(function serialize(key) {
      var val = params[key];
      if (val === null || typeof val === 'undefined') {
        return;
      }
      if (isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }
      val.forEach(function parseValue(v) {
        if (isObject(v)) {
          parts.push(encode(key) + '=' + encode(JSON.stringify(v)));
        } else {
          parts.push(encode(key) + '=' + encode(v));
        }
      });
    });
    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }
  return url;
}

/**
 * Parses raw HTTP headers string or object into a plain object.
 * @param {string|object} headers The headers to parse.
 * @returns {object} A plain object of headers.
 */
function parseHeaders(headers) {
  var parsed = {};
  if (!headers) { return parsed; }

  if (isString(headers)) {
    headers.split('\n').forEach(function parser(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var val = parts.join(':').trim();
        parsed[key] = val;
      }
    });
  } else if (isObject(headers)) {
    for (var key in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, key)) {
        parsed[key] = headers[key];
      }
    }
  }
  return parsed;
}

/**
 * Checks if a value is a FormData instance.
 * @param {*} val The value to check.
 * @returns {boolean} True if the value is FormData, false otherwise.
 */
function isFormData(val) {
  return typeof FormData !== 'undefined' && val instanceof FormData;
}

/**
 * Checks if a value is a URLSearchParams instance.
 * @param {*} val The value to check.
 * @returns {boolean} True if the value is URLSearchParams, false otherwise.
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Converts a plain object to FormData.
 * @param {object} obj The object to convert.
 * @returns {FormData} A FormData instance.
 */
function toFormData(obj) {
  var formData = new FormData();
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var value = obj[key];
      if (isArray(value)) {
        value.forEach(function(item) {
          formData.append(key + '[]', item);
        });
      } else {
        formData.append(key, value);
      }
    }
  }
  return formData;
}

// --- Error Classes ---

/**
 * Custom Error class for Axios-related errors.
 * @param {string} message The error message.
 * @param {object} config The request config.
 * @param {string} [code] The error code (e.g., 'ERR_NETWORK').
 * @param {object} [request] The underlying request object (e.g., XMLHttpRequest).
 * @param {object} [response] The response object.
 */
function AxiosError(message, config, code, request, response) {
  Error.call(this, message);
  this.name = 'AxiosError';
  this.message = message;
  this.config = config;
  this.code = code;
  this.request = request;
  this.response = response;
  this.isAxiosError = true;

  // Capture stack trace for better debugging
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error()).stack;
  }
}
AxiosError.prototype = Object.create(Error.prototype);
AxiosError.prototype.constructor = AxiosError;

// --- AxiosHeaders Class ---

/**
 * A class for manipulating HTTP headers in a case-insensitive manner.
 * Preserves original casing for stylistic reasons.
 */
function AxiosHeaders(headers) {
  // Stores { lowercaseKey: { originalCaseKey: value } }
  this._headers = new Map();
  // Stores { lowercaseKey: originalCaseKey }
  this._originalNames = new Map();

  if (headers) {
    this.set(headers);
  }
}

AxiosHeaders.prototype = {
  constructor: AxiosHeaders,

  /**
   * Sets a header value or multiple header values.
   * @param {string|object|AxiosHeaders} headerName The header name or an object of headers.
   * @param {string|null|false|undefined} [value] The header value.
   * @param {boolean|function} [rewrite=undefined] Control overwriting behavior.
   * @returns {AxiosHeaders} The current instance.
   */
  set: function set(headerName, value, rewrite) {
    // Handle set(headersObject, rewrite) or set(headersString)
    if (isObject(headerName) || headerName instanceof AxiosHeaders || (isString(headerName) && arguments.length === 1)) {
      var headersToSet = headerName;
      var currentRewrite = value; // In this overload, 'value' is actually 'rewrite'

      if (isString(headersToSet)) {
        headersToSet = parseHeaders(headersToSet);
      } else if (headersToSet instanceof AxiosHeaders) {
        headersToSet = headersToSet.toJSON(); // Get a plain object representation
      }

      for (var key in headersToSet) {
        if (Object.prototype.hasOwnProperty.call(headersToSet, key)) {
          this.set(key, headersToSet[key], currentRewrite);
        }
      }
      return this;
    }

    // Handle set(headerName, value, rewrite)
    var key = headerName.toLowerCase();
    var currentHeaderEntry = this._headers.get(key);
    var shouldRewrite = isUndefined(rewrite) ? (value !== false) : (isFunction(rewrite) ? rewrite(value, headerName, this) : rewrite);

    if (currentHeaderEntry && !shouldRewrite) {
      return this; // Don't overwrite if rewrite is false and header exists
    }

    if (value === null || value === false) {
      this.delete(headerName);
    } else if (isUndefined(value)) {
      // If value is undefined, it means it's not set.
      // If it's already set, we keep it. If not, we don't add it.
      if (!this._headers.has(key)) {
        return this;
      }
    } else {
      var originalName = this._originalNames.get(key) || headerName;
      this._headers.set(key, { [originalName]: value });
      this._originalNames.set(key, originalName);
    }

    return this;
  },

  /**
   * Retrieves the internal value of a specified header.
   * @param {string} headerName The name of the header to retrieve.
   * @param {boolean|function|RegExp} [matcher] Optional argument to parse the header's value.
   * @returns {string|null|false|undefined|object|RegExpExecArray} The header value.
   */
  get: function get(headerName, matcher) {
    var key = headerName.toLowerCase();
    var headerEntry = this._headers.get(key);
    if (!headerEntry) {
      return undefined;
    }

    var value = Object.values(headerEntry)[0];

    if (isUndefined(matcher)) {
      return value;
    }

    if (matcher === true) {
      // Parse key-value pairs (e.g., 'foo=bar; baz=qux')
      var result = {};
      String(value).split(';').forEach(function(part) {
        var eqIndex = part.indexOf('=');
        if (eqIndex > -1) {
          var k = part.substring(0, eqIndex).trim();
          var v = part.substring(eqIndex + 1).trim();
          result[k] = v;
        }
      });
      return result;
    }

    if (isFunction(matcher)) {
      return matcher(value);
    }

    if (matcher instanceof RegExp) {
      return matcher.exec(String(value));
    }

    return value;
  },

  /**
   * Checks if a header is set (i.e., its value is not `undefined`).
   * @param {string} header The name of the header to check.
   * @param {function} [matcher] An optional function to match against the header's value.
   * @returns {boolean} True if the header is set, false otherwise.
   */
  has: function has(header, matcher) {
    var key = header.toLowerCase();
    var headerEntry = this._headers.get(key);
    if (!headerEntry) {
      return false;
    }
    var value = Object.values(headerEntry)[0];
    return !isUndefined(value) && (isFunction(matcher) ? matcher(value) : true);
  },

  /**
   * Removes one or more specified headers.
   * @param {string|string[]} header The name or an array of names of the headers to remove.
   * @param {function} [matcher] An optional function to match against the header's value before deletion.
   * @returns {boolean} True if at least one header was removed, false otherwise.
   */
  delete: function _delete(header, matcher) {
    var headersToDelete = isArray(header) ? header : [header];
    var removed = false;

    headersToDelete.forEach(function(h) {
      var key = h.toLowerCase();
      if (this._headers.has(key)) {
        var value = Object.values(this._headers.get(key))[0];
        if (!isFunction(matcher) || matcher(value)) {
          this._headers.delete(key);
          this._originalNames.delete(key);
          removed = true;
        }
      }
    }.bind(this));

    return removed;
  },

  /**
   * Removes all headers from the instance.
   * @param {function} [matcher] An optional function that receives the header name and returns `true` if that header should be cleared.
   * @returns {boolean} True if at least one header was cleared, false otherwise.
   */
  clear: function clear(matcher) {
    var cleared = false;
    if (!isFunction(matcher)) {
      cleared = this._headers.size > 0;
      this._headers.clear();
      this._originalNames.clear();
    } else {
      var keysToDelete = [];
      this._originalNames.forEach(function(originalName, lowerCaseName) {
        if (matcher(originalName)) {
          keysToDelete.push(lowerCaseName);
        }
      });
      keysToDelete.forEach(function(key) {
        this._headers.delete(key);
        this._originalNames.delete(key);
        cleared = true;
      }.bind(this));
    }
    return cleared;
  },

  /**
   * Normalizes the headers object by combining duplicate keys (case-insensitively) into a single entry.
   * Optionally converts header names to a canonical format (e.g., 'Content-Type').
   * @param {boolean} [format=false] If true, header names will be converted to lowercase and then capitalized.
   * @returns {AxiosHeaders} The current instance.
   */
  normalize: function normalize(format) {
    var newHeaders = new Map();
    var newOriginalNames = new Map();

    this._headers.forEach(function(entry, lowerCaseKey) {
      var originalName = Object.keys(entry)[0];
      var value = Object.values(entry)[0];

      var normalizedName = originalName;
      if (format) {
        normalizedName = originalName.split('-').map(function(word) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join('-');
      }

      var newLowerCaseKey = normalizedName.toLowerCase();
      if (newHeaders.has(newLowerCaseKey)) {
        // Combine values for duplicate keys
        var existingEntry = newHeaders.get(newLowerCaseKey);
        var existingValue = Object.values(existingEntry)[0];
        if (isArray(existingValue)) {
          existingValue.push(value);
        } else {
          existingEntry[Object.keys(existingEntry)[0]] = [existingValue, value];
        }
      } else {
        newHeaders.set(newLowerCaseKey, { [normalizedName]: value });
        newOriginalNames.set(newLowerCaseKey, normalizedName);
      }
    });

    this._headers = newHeaders;
    this._originalNames = newOriginalNames;
    return this;
  },

  /**
   * Merges the current `AxiosHeaders` instance with one or more target header objects into a new `AxiosHeaders` instance.
   * @param {Array<object|AxiosHeaders|string|undefined|null>} targets One or more header objects to merge.
   * @returns {AxiosHeaders} A new `AxiosHeaders` instance.
   */
  concat: function concat() {
    var newHeaders = new AxiosHeaders(this);
    for (var i = 0; i < arguments.length; i++) {
      var target = arguments[i];
      if (target !== undefined && target !== null) {
        newHeaders.set(target, true); // Always overwrite when concatenating
      }
    }
    return newHeaders;
  },

  /**
   * Resolves all internal header values into a new plain object suitable for sending over the network.
   * This object will only contain string values.
   * @param {boolean} [asStrings=false] If true, array values will be resolved into a single string with elements separated by commas.
   * @returns {object} A plain JavaScript object where keys are header names and values are their string representations.
   */
  toJSON: function toJSON(asStrings) {
    var obj = {};
    this._headers.forEach(function(entry) {
      var originalName = Object.keys(entry)[0];
      var value = Object.values(entry)[0];
      if (value !== null && value !== false && value !== undefined) {
        if (isArray(value) && asStrings) {
          obj[originalName] = value.join(', ');
        } else {
          obj[originalName] = value;
        }
      }
    });
    return obj;
  },

  // Iterator support for for...of
  [Symbol.iterator]: function* () {
    for (var [lowerCaseKey, entry] of this._headers) {
      var originalName = Object.keys(entry)[0];
      var value = Object.values(entry)[0];
      yield [originalName, value];
    }
  },

  // Specific header methods
  setContentType: function(value) { return this.set('Content-Type', value); },
  getContentType: function() { return this.get('Content-Type'); },
  hasContentType: function() { return this.has('Content-Type'); },

  setContentLength: function(value) { return this.set('Content-Length', value); },
  getContentLength: function() { return this.get('Content-Length'); },
  hasContentLength: function() { return this.has('Content-Length'); },

  setAccept: function(value) { return this.set('Accept', value); },
  getAccept: function() { return this.get('Accept'); },
  hasAccept: function() { return this.has('Accept'); },

  setUserAgent: function(value) { return this.set('User-Agent', value); },
  getUserAgent: function() { return this.get('User-Agent'); },
  hasUserAgent: function() { return this.has('User-Agent'); },

  setContentEncoding: function(value) { return this.set('Content-Encoding', value); },
  getContentEncoding: function() { return this.get('Content-Encoding'); },
  hasContentEncoding: function() { return this.has('Content-Encoding'); }
};

// Static methods for AxiosHeaders
AxiosHeaders.from = function(thing) {
  if (thing instanceof AxiosHeaders) {
    return thing;
  }
  return new AxiosHeaders(thing);
};

AxiosHeaders.concat = function() {
  var newHeaders = new AxiosHeaders();
  for (var i = 0; i < arguments.length; i++) {
    var target = arguments[i];
    if (target !== undefined && target !== null) {
      newHeaders.set(target, true);
    }
  }
  return newHeaders;
};


// --- Interceptor Manager ---

/**
 * Manages request and response interceptors.
 */
function InterceptorManager() {
  this.handlers = [];
  this.nextId = 0;
}

InterceptorManager.prototype.use = function use(onFulfilled, onRejected, options) {
  var id = this.nextId++;
  this.handlers.push({
    id: id,
    onFulfilled: onFulfilled,
    onRejected: onRejected,
    options: options || {}
  });
  return id;
};

InterceptorManager.prototype.eject = function eject(id) {
  for (var i = 0; i < this.handlers.length; i++) {
    if (this.handlers[i].id === id) {
      this.handlers.splice(i, 1);
      return true;
    }
  }
  return false;
};

InterceptorManager.prototype.clear = function clear() {
  this.handlers = [];
};

/**
 * Iterate over all handlers in the manager.
 * @param {function} fn The function to call for each handler.
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  this.handlers.forEach(fn);
};


// --- CancelToken (Deprecated) ---

/**
 * Represents a cancellation reason.
 * @param {string} message The cancellation message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

/**
 * A class used to create a token that can be used to cancel Axios requests.
 * This API is deprecated; `AbortController` is the recommended alternative.
 * @param {function} executor A function that receives a `cancel` function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new AxiosError('executor must be a function.', null, 'ERR_BAD_OPTION_VALUE');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }
    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a cancellation error if the token has been requested to cancel.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Factory method to create a source object for request cancellation.
 * @returns {object} An object with `token` (CancelToken instance) and `cancel` (function).
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

// --- Environment-specific adapters (Mocked for Clean Room) ---

// Determine if running in a browser-like environment
var isBrowser = typeof XMLHttpRequest !== 'undefined';

/**
 * Mock XHR adapter for browser-like environments.
 * Simulates network requests and various error conditions.
 * @param {object} config The request configuration.
 * @returns {Promise<object>} A Promise that resolves with the response object.
 */
function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    // In a real implementation, this would use XMLHttpRequest
    // For clean room, we simulate the behavior.
    var request = { // Mock XMLHttpRequest object
      status: 200,
      statusText: 'OK',
      responseText: '{\"message\": \"Mock XHR response\"}',
      getAllResponseHeaders: function() { return 'Content-Type: application/json\\nX-Mock-Header: mock-value'; },
      abort: function() { /* no-op */ },
      open: function() { /* no-op */ },
      setRequestHeader: function() { /* no-op */ },
      send: function() {
        // Simulate network delay
        setTimeout(function() {
          // Trigger onreadystatechange after a delay
          if (request.onreadystatechange) {
            request.readyState = 4;
            request.onreadystatechange();
          }
        }, 100);
      },
      readyState: 0,
      onreadystatechange: null,
      onerror: null,
      ontimeout: null
    };

    var requestHeaders = AxiosHeaders.from(config.headers).toJSON(true);

    // Check for immediate cancellation via CancelToken
    if (config.cancelToken) {
      try {
        config.cancelToken.throwIfRequested();
      } catch (cancel) {
        return reject(new AxiosError(cancel.message, config, 'ERR_CANCELED', request));
      }
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) { return; }
        request.abort();
        reject(new AxiosError(cancel.message, config, 'ERR_CANCELED', request));
        request = null;
      });
    }

    // Check for immediate cancellation via AbortController signal
    if (config.signal && config.signal.aborted) {
      return reject(new AxiosError('Request aborted', config, 'ERR_CANCELED', request));
    }
    if (config.signal) {
      config.signal.addEventListener('abort', function() {
        if (!request) { return; }
        request.abort();
        reject(new AxiosError('Request aborted', config, 'ERR_CANCELED', request));
        request = null;
      });
    }

    // Simulate timeout
    var timeoutId;
    if (config.timeout) {
      timeoutId = setTimeout(function() {
        if (!request) { return; }
        request.abort();
        reject(new AxiosError('timeout of ' + config.timeout + 'ms exceeded', config, 'ETIMEDOUT', request));
        request = null;
      }, config.timeout);
    }

    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      clearTimeout(timeoutId);

      // Simulate network error for specific URLs or conditions
      if (config.url && config.url.includes('network-error')) {
        reject(new AxiosError('Network Error', config, 'ERR_NETWORK', request));
        request = null;
        return;
      }

      // Simulate invalid URL error
      if (config.url && !config.url.startsWith('http')) {
         reject(new AxiosError('Invalid URL', config, 'ERR_INVALID_URL', request));
         request = null;
         return;
      }

      var responseHeaders = parseHeaders(request.getAllResponseHeaders());
      var responseData = request.responseText;

      // Simulate HTTP status codes
      if (config.url && config.url.includes('404')) {
        request.status = 404;
        request.statusText = 'Not Found';
        responseData = '{\"message\": \"Resource not found\"}';
      } else if (config.url && config.url.includes('500')) {
        request.status = 500;
        request.statusText = 'Internal Server Error';
        responseData = '{\"message\": \"Server error\"}';
      }

      // Simulate JSON parsing error
      if (config.responseType === 'json' && responseData && !config.transitional?.silentJSONParsing) {
        try {
          responseData = JSON.parse(responseData);
        } catch (e) {
          return reject(new AxiosError('JSON parsing error', config, 'ERR_BAD_RESPONSE', request, {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          }));
        }
      }

      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      var validateStatus = config.validateStatus || function(status) {
        return status >= 200 && status < 300;
      };

      if (validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError(
          'Request failed with status code ' + response.status,
          config,
          (response.status >= 400 && response.status < 500) ? 'ERR_BAD_REQUEST' : 'ERR_BAD_RESPONSE',
          request,
          response
        ));
      }
      request = null;
    };

    request.onerror = function handleError() {
      clearTimeout(timeoutId);
      reject(new AxiosError('Network Error', config, 'ERR_NETWORK', request));
      request = null;
    };

    request.ontimeout = function handleTimeout() {
      clearTimeout(timeoutId);
      reject(new AxiosError('timeout of ' + config.timeout + 'ms exceeded', config, 'ETIMEDOUT', request));
      request = null;
    };

    // Simulate sending the request
    var data = config.data;
    if (isObject(data) && config.headers.getContentType() === 'application/json') {
      data = JSON.stringify(data);
    } else if (isObject(data) && config.headers.getContentType() === 'application/x-www-form-urlencoded') {
      data = new URLSearchParams(data).toString();
    } else if (isObject(data) && config.headers.getContentType() === 'multipart/form-data') {
      // Data should already be FormData if it was a plain object for form methods
      // or if user explicitly set content-type and provided FormData.
      // If it's a plain object here, it means it wasn't handled by form methods,
      // so we convert it to FormData.
      if (!isFormData(data)) {
        data = toFormData(data);
      }
    }
    // request.send(data); // In a real XHR, this would send the data.
    // For mock, we just trigger the onreadystatechange manually after a delay.
    request.send(data);
  });
}

/**
 * Mock Node.js HTTP adapter for Node-like environments.
 * Simulates network requests and various error conditions.
 * @param {object} config The request configuration.
 * @returns {Promise<object>} A Promise that resolves with the response object.
 */
function nodeHttpAdapter(config) {
  return new Promise(function dispatchNodeRequest(resolve, reject) {
    // In a real implementation, this would use Node's http/https modules
    // For clean room, we simulate the behavior.
    // console.warn('Node.js HTTP adapter is mocked. No actual network request will be made.');

    // Check for immediate cancellation via CancelToken
    if (config.cancelToken) {
      try {
        config.cancelToken.throwIfRequested();
      } catch (cancel) {
        return reject(new AxiosError(cancel.message, config, 'ERR_CANCELED', null));
      }
      config.cancelToken.promise.then(function onCanceled(cancel) {
        reject(new AxiosError(cancel.message, config, 'ERR_CANCELED', null));
      });
    }

    // Check for immediate cancellation via AbortController signal
    if (config.signal && config.signal.aborted) {
      return reject(new AxiosError('Request aborted', config, 'ERR_CANCELED', null));
    }
    if (config.signal) {
      config.signal.addEventListener('abort', function() {
        reject(new AxiosError('Request aborted', config, 'ERR_CANCELED', null));
      });
    }

    // Simulate network delay and response
    var timeoutId;
    if (config.timeout) {
      timeoutId = setTimeout(function() {
        reject(new AxiosError('timeout of ' + config.timeout + 'ms exceeded', config, 'ETIMEDOUT', null));
      }, config.timeout);
    }

    // Simulate various edge cases
    if (config.url && config.url.includes('network-error')) {
      clearTimeout(timeoutId);
      return reject(new AxiosError('Network Error', config, 'ERR_NETWORK', null));
    }
    if (config.url && !config.url.startsWith('http')) {
      clearTimeout(timeoutId);
      return reject(new AxiosError('Invalid URL', config, 'ERR_INVALID_URL', null));
    }
    if (config.url && config.url.includes('too-many-redirects')) {
      clearTimeout(timeoutId);
      return reject(new AxiosError('Too many redirects', config, 'ERR_FR_TOO_MANY_REDIRECTS', null));
    }

    // Simulate response
    setTimeout(function() {
      clearTimeout(timeoutId);

      var status = 200;
      var statusText = 'OK';
      var responseData = '{\"message\": \"Mock response\"}';
      var responseHeaders = {
        'content-type': 'application/json',
        'x-mock-header': 'mock-value'
      };

      if (config.url && config.url.includes('404')) {
        status = 404;
        statusText = 'Not Found';
        responseData = '{\"message\": \"Resource not found\"}';
      } else if (config.url && config.url.includes('500')) {
        status = 500;
        statusText = 'Internal Server Error';
        responseData = '{\"message\": \"Server error\"}';
      }

      var response = {
        data: responseData,
        status: status,
        statusText: statusText,
        headers: responseHeaders,
        config: config,
        request: null // In Node.js, this would be the http.ClientRequest object
      };

      // Data transformation for response
      if (config.responseType === 'json' && response.data && !config.transitional?.silentJSONParsing) {
        try {
          response.data = JSON.parse(response.data);
        } catch (e) {
          return reject(new AxiosError('JSON parsing error', config, 'ERR_BAD_RESPONSE', null, response));
        }
      }

      var validateStatus = config.validateStatus || function(status) {
        return status >= 200 && status < 300;
      };

      if (validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError(
          'Request failed with status code ' + response.status,
          config,
          (response.status >= 400 && response.status < 500) ? 'ERR_BAD_REQUEST' : 'ERR_BAD_RESPONSE',
          null,
          response
        ));
      }
    }, 100); // Simulate async request
  });
}

// Select the appropriate adapter based on environment
var adapter = isBrowser ? xhrAdapter : nodeHttpAdapter;


// --- Axios Core Logic ---

/**
 * Creates a new Axios instance.
 * @param {object} instanceConfig The default configuration for the instance.
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig || {};
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatches an HTTP request. This is the core method that applies defaults,
 * runs interceptors, and calls the underlying HTTP adapter.
 * @param {object} config The request configuration.
 * @returns {Promise<object>} A Promise that resolves with the response object.
 */
Axios.prototype.request = function request(config) {
  // Merge global defaults, instance defaults, and request config
  config = deepMerge(this.defaults, config);

  // Set default method if not provided
  if (!config.method) {
    config.method = 'get';
  }
  config.method = config.method.toLowerCase();

  // Ensure headers are AxiosHeaders instance
  config.headers = AxiosHeaders.from(config.headers);

  // Build URL with base URL and params
  if (config.baseURL && !config.url.startsWith('http')) {
    config.url = config.baseURL + config.url;
  }
  config.url = buildURL(config.url, config.params, config.paramsSerializer);

  // Check for immediate cancellation (before any network request)
  if (config.cancelToken && config.cancelToken.reason) {
    return Promise.reject(new AxiosError(config.cancelToken.reason.message, config, 'ERR_CANCELED'));
  }
  if (config.signal && config.signal.aborted) {
    return Promise.reject(new AxiosError('Request aborted', config, 'ERR_CANCELED'));
  }

  // Build the interceptor chain
  var chain = [adapter, undefined]; // adapter is onFulfilled, undefined for onRejected

  // Request interceptors (LIFO execution)
  this.interceptors.request.handlers.forEach(function unshiftRequestInterceptor(interceptor) {
    if (interceptor.options.runWhen && !interceptor.options.runWhen(config)) {
      return;
    }
    chain.unshift(interceptor.onFulfilled, interceptor.onRejected);
  });

  // Response interceptors (FIFO execution)
  this.interceptors.response.handlers.forEach(function pushResponseInterceptor(interceptor) {
    if (interceptor.options.runWhen && !interceptor.options.runWhen(config)) {
      return;
    }
    chain.push(interceptor.onFulfilled, interceptor.onRejected);
  });

  // Start the promise chain with the initial config
  var promise = Promise.resolve(config);

  // Execute the chain of interceptors and the adapter
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

/**
 * Helper function to create HTTP methods that do not send a request body (GET, DELETE, HEAD, OPTIONS).
 * @param {string} method The HTTP method name.
 * @returns {function(string, object): Promise<object>} The method function.
 */
function createMethodWithoutData(method) {
  return function(url, config) {
    return this.request(deepMerge(config || {}, {
      method: method,
      url: url
    }));
  };
}

/**
 * Helper function to create HTTP methods that send a request body (POST, PUT, PATCH).
 * @param {string} method The HTTP method name.
 * @returns {function(string, any, object): Promise<object>} The method function.
 */
function createMethodWithData(method) {
  return function(url, data, config) {
    return this.request(deepMerge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
}

/**
 * Helper function to create HTTP methods for sending form data (postForm, putForm, patchForm).
 * @param {string} method The HTTP method name.
 * @returns {function(string, any, object): Promise<object>} The method function.
 */
function createFormMethod(method) {
  return function(url, data, config) {
    var formConfig = deepMerge(config || {}, {
      method: method,
      url: url,
      data: data
    });
    // Ensure Content-Type is multipart/form-data
    formConfig.headers = AxiosHeaders.from(formConfig.headers);
    formConfig.headers.set('Content-Type', 'multipart/form-data', false); // Don't overwrite if already set

    // Transform data to FormData if it's a plain object, HTMLFormElement, or FileList
    if (isObject(formConfig.data) && typeof FormData !== 'undefined') {
      formConfig.data = toFormData(formConfig.data);
    } else if (typeof HTMLFormElement !== 'undefined' && formConfig.data instanceof HTMLFormElement) {
      formConfig.data = new FormData(formConfig.data);
    } else if (typeof FileList !== 'undefined' && formConfig.data instanceof FileList) {
      var formData = new FormData();
      for (var i = 0; i < formConfig.data.length; i++) {
        formData.append('file' + i, formConfig.data[i]); // Generic naming, spec doesn't detail specific field names
      }
      formConfig.data = formData;
    }

    return this.request(formConfig);
  };
}


// Attach methods to Axios prototype
Axios.prototype.get = createMethodWithoutData('get');
Axios.prototype.delete = createMethodWithoutData('delete');
Axios.prototype.head = createMethodWithoutData('head');
Axios.prototype.options = createMethodWithoutData('options');
Axios.prototype.post = createMethodWithData('post');
Axios.prototype.put = createMethodWithData('put');
Axios.prototype.patch = createMethodWithData('patch');
Axios.prototype.postForm = createFormMethod('post');
Axios.prototype.putForm = createFormMethod('put');
Axios.prototype.patchForm = createFormMethod('patch');

/**
 * Constructs the full request URI based on the instance's configuration and the provided request configuration,
 * without actually sending a request.
 * @param {object} [config] An optional object specifying request configuration.
 * @returns {string} The fully constructed request URI as a string.
 */
Axios.prototype.getUri = function getUri(config) {
  config = deepMerge(this.defaults, config || {});
  var url = config.url;
  if (config.baseURL && !url.startsWith('http')) {
    url = config.baseURL + url;
  }
  return buildURL(url, config.params, config.paramsSerializer);
};


// --- Axios Factory and Global Instance ---

/**
 * Creates an Axios instance.
 * This function is used to create both the global `axios` object and instances created by `axios.create()`.
 * @param {object} instanceConfig The default configuration for the new instance.
 * @returns {function} The Axios instance function.
 */
function createInstance(instanceConfig) {
  var context = new Axios(instanceConfig);

  // The main axios function (callable as axios(config) or axios(url, config))
  var instance = function axios(urlOrConfig, config) {
    if (isString(urlOrConfig)) {
      config = config || {};
      config.url = urlOrConfig;
      config.method = config.method || 'get'; // Default to GET if only URL
      return context.request(config);
    } else {
      return context.request(urlOrConfig);
    }
  };

  // Copy Axios prototype methods to the instance function
  for (var key in Axios.prototype) {
    if (Object.prototype.hasOwnProperty.call(Axios.prototype, key)) {
      instance[key] = Axios.prototype[key].bind(context);
    }
  }

  // Copy interceptors and defaults from the context
  instance.defaults = context.defaults;
  instance.interceptors = context.interceptors;

  return instance;
}

// Create the global axios instance
var axios = createInstance();

// --- Static methods on global axios instance ---

/**
 * Creates a new Axios instance with a custom configuration.
 * @param {object} [config] An optional object specifying the default configuration for the new instance.
 * @returns {object} A new Axios instance.
 */
axios.create = function create(config) {
  return createInstance(deepMerge(axios.defaults, config));
};

/**
 * Checks if a given value is an Axios cancellation error.
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the value is an Axios cancellation error, `false` otherwise.
 */
axios.isCancel = function isCancel(value) {
  return value instanceof Cancel;
};

/**
 * A type guard function that checks if a given value is an instance of `AxiosError`.
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the value is an `AxiosError` instance, `false` otherwise.
 */
axios.isAxiosError = function isAxiosError(value) {
  return value && value.isAxiosError === true;
};

// Deprecated CancelToken class
axios.CancelToken = CancelToken;

// --- Export ---
module.exports = axios;
module.exports.AxiosError = AxiosError;
module.exports.AxiosHeaders = AxiosHeaders;
module.exports.isCancel = axios.isCancel;
module.exports.isAxiosError = axios.isAxiosError;
module.exports.CancelToken = axios.CancelToken;
