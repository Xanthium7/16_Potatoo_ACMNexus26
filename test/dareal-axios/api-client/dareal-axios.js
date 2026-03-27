// index.js

// --- Environment Detection ---
const IS_NODE = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
const IS_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Check if native URLSearchParams is available (Node.js 10+ and all modern browsers)
const hasNativeURLSearchParams = typeof URLSearchParams !== 'undefined';
// Check if native FormData is available (Node.js 18+ and all modern browsers)
const constr_FormData = typeof FormData !== 'undefined' ? FormData : undefined;

// --- Utility Functions ---

/**
 * Checks if a value is a plain object.
 * @param {*} val
 * @returns {boolean}
 */
function isObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

/**
 * Checks if a value is a string.
 * @param {*} val
 * @returns {boolean}
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Checks if a value is a function.
 * @param {*} val
 * @returns {boolean}
 */
function isFunction(val) {
  return typeof val === 'function';
}

/**
 * Checks if a value is undefined.
 * @param {*} val
 * @returns {boolean}
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Deeply merges two objects. Simple properties overwrite, objects are merged recursively.
 * Assumes source properties take precedence.
 * @param {object} target
 * @param {object} source
 * @returns {object} The merged object.
 */
function merge(target, source) {
  if (!isObject(target) || !isObject(source)) {
    return source; // If either is not an object, source takes precedence
  }
  const output = { ...target }; // Start with a shallow copy of target
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (isObject(source[key]) && isObject(target[key])) {
        // If both are objects, merge recursively
        output[key] = merge(target[key], source[key]);
      } else if (Array.isArray(source[key])) {
        // Arrays are replaced
        output[key] = [...source[key]];
      } else {
        // Other types are overwritten
        output[key] = source[key];
      }
    }
  }
  return output;
}

/**
 * Extends an object with properties from another object.
 * @param {object} a - The target object.
 * @param {object} b - The source object.
 * @param {object} [thisArg] - The `this` context for functions.
 * @returns {object} The extended target object.
 */
function extend(a, b, thisArg) {
  for (const key in b) {
    if (Object.prototype.hasOwnProperty.call(b, key)) {
      if (thisArg && isFunction(b[key])) {
        a[key] = b[key].bind(thisArg);
      } else {
        a[key] = b[key];
      }
    }
  }
  return a;
}

/**
 * Serializes an object or URLSearchParams to a URL query string.
 * @param {object | URLSearchParams} params - The parameters to serialize.
 * @returns {string} The URL query string.
 */
function buildURLSearchParams(params) {
  if (hasNativeURLSearchParams && params instanceof URLSearchParams) {
    return params.toString();
  }
  if (!isObject(params)) {
    return '';
  }
  const parts = [];
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];
      if (value === null || isUndefined(value)) {
        continue;
      }
      // Handle arrays for parameters (e.g., param=1&param=2)
      if (Array.isArray(value)) {
        value.forEach(val => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`));
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
  }
  return parts.join('&');
}

/**
 * Converts a plain object to FormData or URLSearchParams. Handles HTMLFormElement/FileList in browser.
 * This function provides a basic mechanism due to zero-dependency constraints.
 * For Node.js, if native FormData is not available, it defaults to URLSearchParams for objects.
 * Does not support File/Blob/Stream for Node.js without external dependencies.
 * @param {any} data - The data to convert.
 * @param {boolean} [asMultipart=false] - Whether to prefer multipart/form-data for objects.
 * @returns {FormData | URLSearchParams | string | Buffer | FileList | HTMLFormElement} The converted data.
 */
function toFormData(data, asMultipart = false) {
  if (constr_FormData && data instanceof constr_FormData) {
    return data;
  }
  if (IS_BROWSER) {
    if (data instanceof HTMLFormElement) return new constr_FormData(data);
    if (data instanceof FileList) {
      const formData = new constr_FormData();
      Array.from(data).forEach((file, index) => formData.append(`file_${index}`, file));
      return formData;
    }
  }

  if (isObject(data)) {
    if (constr_FormData && asMultipart) {
      // Use native FormData if available and multipart is requested for plain objects
      const formData = new constr_FormData();
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
          if (value !== null && !isUndefined(value)) {
            // Primitive types and strings appended directly
            // For objects/arrays, stringify to JSON
            formData.append(key, isObject(value) || Array.isArray(value) ? JSON.stringify(value) : value);
          }
        }
      }
      return formData;
    } else {
      // Fallback: Serialize to URLSearchParams string for consistency (Node.js without FormData or non-multipart)
      return buildURLSearchParams(data);
    }
  }
  return data; // Return as-is if not an object or specific browser types
}

// --- Error Handling ---

/**
 * Custom Error class for Axios.
 * @extends Error
 */
class AxiosError extends Error {
  /**
   * Creates an instance of AxiosError.
   * @param {string} message - The error message.
   * @param {string} [code] - An Axios-specific error code (e.g., 'ERR_NETWORK').
   * @param {object} [config] - The request configuration.
   * @param {*} [request] - The raw request object (e.g., XMLHttpRequest, http.ClientRequest).
   * @param {object} [response] - The response object.
   */
  constructor(message, code, config, request, response) {
    super(message);
    this.name = 'AxiosError';
    this.config = config;
    this.code = code;
    this.request = request;
    this.response = response;
    this.isAxiosError = true;

    // Capture stack trace for better debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AxiosError);
    } else {
      this.stack = (new Error()).stack;
    }
  }

  /**
   * Returns a JSON representation of the error.
   * @returns {object}
   */
  toJSON() {
    return {
      message: this.message,
      name: this.name,
      config: this.config,
      code: this.code,
      status: this.response ? this.response.status : null,
    };
  }
}

/**
 * Type guard function to check if a value is an AxiosError instance.
 * @param {*} payload - The value to check.
 * @returns {boolean}
 */
function isAxiosError(payload) {
  return isObject(payload) && payload.isAxiosError === true;
}

// --- Cancellation (Deprecated API) ---

/**
 * Represents a cancellation reason for deprecated CancelToken.
 * @deprecated
 */
class Cancel {
  /**
   * @param {string} message - The cancellation message.
   */
  constructor(message) {
    this.message = message;
  }
}

/**
 * Checks if a value is a `Cancel` object.
 * @param {*} value - The value to check.
 * @returns {boolean}
 * @deprecated Use `error.code === 'ERR_CANCELED'` instead with `AbortController`.
 */
function isCancel(value) {
  return value instanceof Cancel;
}

/**
 * Deprecated class for creating cancellation tokens.
 * @deprecated Use `AbortController` for request cancellation.
 */
class CancelToken {
  /**
   * @param {Function} executor - A function that receives a `cancel` function.
   */
  constructor(executor) {
    if (!isFunction(executor)) {
      throw new AxiosError('executor must be a function.', 'ERR_BAD_OPTION_VALUE', null, null, null, 'ERR_BAD_OPTION_VALUE');
    }

    let resolvePromise;
    this.promise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    const token = this;
    executor(function cancel(message) {
      if (!token.reason) {
        token.reason = new Cancel(message || 'Request aborted.');
        resolvePromise(token.reason);
      }
    });
  }

  /**
   * Throws a `Cancel` object if the token has been requested to cancel.
   * @throws {Cancel}
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }

  /**
   * Factory method to create a source object containing a new `CancelToken` and its `cancel` function.
   * @returns {{token: CancelToken, cancel: Function}}
   * @deprecated Use `AbortController` for request cancellation.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  }
}

// --- AxiosHeaders Class ---

// Map to store original casing for headers, keyed by lowercase name.
// This allows case-insensitive operations while preserving original casing.
const HEADERS_CASE_MAP = new Map();

/**
 * Stores the original casing of a header name.
 * @param {string} key - The header name.
 */
function storeHeaderCasing(key) {
  HEADERS_CASE_MAP.set(key.toLowerCase(), key);
}

/**
 * Retrieves the stored original casing for a header name.
 * @param {string} key - The header name.
 * @returns {string} The original-cased header name or the input key if not found.
 */
function getHeaderCasing(key) {
  return HEADERS_CASE_MAP.get(key.toLowerCase()) || key;
}

/**
 * A class for manipulating HTTP headers, providing case-insensitive operations.
 */
class AxiosHeaders {
  /**
   * @param {object | AxiosHeaders | string} [headers] - Optional initial headers.
   */
  constructor(headers) {
    // Internal storage: Map<lowercase_header_name, { originalKey: string, value: any }>
    this._headers = new Map();
    if (headers) {
      this.set(headers);
    }
  }

  /**
   * Internal helper to parse a raw HTTP header string.
   * @param {string} headerString - The raw header string (e.g., "Content-Type: application/json\\nAccept: text/html").
   * @returns { object } A plain object of parsed headers.
   */
_parseHeaderString(headerString) {
  const parsed = {};
  if (!isString(headerString)) return parsed;
  headerString.split('\n').forEach(line => {
    const parts = line.split(':');
    if (parts.length > 1) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      parsed[key] = value;
    }
  });
  return parsed;
}

/**
 * Sets a header value or merges multiple headers.
 * @param {string | object | AxiosHeaders} headerName - The header name or an object/AxiosHeaders to merge.
 * @param {string | null | false | undefined | Function} [value] - The header value.
 * @param {boolean | Function} [rewrite=undefined] - Overwrite behavior.
 * @returns {AxiosHeaders} The instance for chaining.
 */
set(headerName, value, rewrite = undefined) {
  if (isObject(headerName) || headerName instanceof AxiosHeaders) {
    const sourceHeaders = headerName instanceof AxiosHeaders ? headerName.toJSON() : headerName;
    for (const key in sourceHeaders) {
      if (Object.prototype.hasOwnProperty.call(sourceHeaders, key)) {
        // When bulk setting, 'value' parameter acts as 'rewrite' for individual headers
        this.set(key, sourceHeaders[key], value);
      }
    }
    return this;
  }

  if (!isString(headerName)) {
    return this;
  }

  const lowerCaseName = headerName.toLowerCase();
  storeHeaderCasing(headerName); // Store original casing

  const currentEntry = this._headers.get(lowerCaseName);
  const currentValue = currentEntry ? currentEntry.value : undefined;

  // Determine if overwrite should happen
  let shouldRewrite = rewrite;
  if (isFunction(rewrite)) {
    shouldRewrite = rewrite(currentValue, headerName, this._headers);
  } else if (isUndefined(rewrite)) { // Default behavior
    shouldRewrite = value !== false; // Overwrite unless new value is explicitly false
  }

  if (shouldRewrite || isUndefined(currentValue)) {
    if (value === null || value === false || isUndefined(value)) {
      this._headers.delete(lowerCaseName); // Remove header if value is null/false/undefined
    } else {
      this._headers.set(lowerCaseName, { originalKey: getHeaderCasing(headerName), value: value });
    }
  }
  return this;
}

/**
 * Retrieves the value of a header, optionally parsing it.
 * @param {string} headerName - The name of the header.
 * @param {boolean | RegExp | Function} [matcher] - Parsing/transformation option.
 * @returns {*} The header value, potentially parsed.
 */
get(headerName, matcher = undefined) {
  if (!isString(headerName)) {
    return undefined;
  }
  const lowerCaseName = headerName.toLowerCase();
  const entry = this._headers.get(lowerCaseName);
  let value = entry ? entry.value : undefined;

  if (isFunction(matcher)) {
    value = matcher(value, headerName, this._headers);
  } else if (matcher instanceof RegExp) {
    value = isString(value) ? matcher.exec(value) : null;
  } else if (matcher === true && isString(value)) {
    // Basic key-value pair parsing (e.g., "key1=val1; key2=val2")
    const parsed = {};
    value.split(';').forEach(part => {
      const [key, val] = part.split('=').map(s => s.trim());
      if (key && val) parsed[key] = val;
    });
    value = parsed;
  }
  return value;
}

/**
 * Checks if a header is set (i.e., its value is not undefined).
 * @param {string} headerName - The name of the header.
 * @param {Function} [matcher] - An optional function to match against the header value.
 * @returns {boolean}
 */
has(headerName, matcher = undefined) {
  if (!isString(headerName)) {
    return false;
  }
  const lowerCaseName = headerName.toLowerCase();
  const entry = this._headers.get(lowerCaseName);
  if (!entry || isUndefined(entry.value)) {
    return false;
  }
  if (isFunction(matcher)) {
    return matcher(entry.value, headerName, this._headers);
  }
  return true;
}

/**
 * Removes one or more headers.
 * @param {string | Array<string>} headerNames - The name(s) of the header(s) to remove.
 * @param {Function} [matcher] - Optional function to match against the header value for deletion.
 * @returns {boolean} True if at least one header was removed.
 */
delete (headerNames, matcher = undefined) {
  let removed = false;
  const names = Array.isArray(headerNames) ? headerNames : [headerNames];
  names.forEach(name => {
    if (!isString(name)) return;
    const lowerCaseName = name.toLowerCase();
    const entry = this._headers.get(lowerCaseName);
    if (entry) {
      if (isFunction(matcher) && !matcher(entry.value, name, this._headers)) {
        return; // Don't delete if matcher returns false
      }
      this._headers.delete(lowerCaseName);
      removed = true;
    }
  });
  return removed;
}

/**
 * Removes all headers, optionally filtered by a matcher.
 * @param {Function} [matcher] - Optional function that receives a header name and returns true to clear.
 * @returns {boolean} True if at least one header was cleared.
 */
clear(matcher = undefined) {
  let cleared = false;
  if (!matcher) {
    if (this._headers.size > 0) {
      this._headers.clear();
      cleared = true;
    }
  } else if (isFunction(matcher)) {
    const keysToDelete = [];
    this._headers.forEach((entry, lowerCaseName) => {
      if (matcher(entry.originalKey)) {
        keysToDelete.push(lowerCaseName);
      }
    });
    keysToDelete.forEach(key => {
      this._headers.delete(key);
      cleared = true;
    });
  }
  return cleared;
}

/**
 * Normalizes the headers by combining duplicate keys (case-insensitive) and retaining the last value.
 * Optionally formats header names to canonical form (e.g., 'content-type' -> 'Content-Type').
 * @param {boolean} [format=false] - If true, converts header names to canonical form.
 * @returns {AxiosHeaders} The instance for chaining.
 */
normalize(format = false) {
  const normalized = new Map();
  const originalOrderEntries = Array.from(this._headers.entries());

  originalOrderEntries.forEach(([lowerCaseName, entry]) => {
    let keyToUse = entry.originalKey;
    if (format) {
      keyToUse = this._canonicalizeHeaderName(entry.originalKey);
    }

    // Overwrite if key already exists (last one wins for canonical name)
    normalized.set(keyToUse.toLowerCase(), { originalKey: keyToUse, value: entry.value });
    storeHeaderCasing(keyToUse); // Update casing map
  });
  this._headers = normalized;
  return this;
}

/**
 * Internal helper to convert a header name to canonical HTTP header casing (e.g., 'Content-Type').
 * @param {string} name - The header name.
 * @returns {string} The canonicalized header name.
 */
_canonicalizeHeaderName(name) {
  return name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-');
}

/**
 * Merges the current `AxiosHeaders` instance with one or more target header objects into a new instance.
 * @param {...(AxiosHeaders | object | string | undefined | null)} targets - Headers to merge.
 * @returns {AxiosHeaders} A new `AxiosHeaders` instance.
 */
concat(...targets) {
  const newHeaders = new AxiosHeaders();
  // Start with current headers, explicitly copy them
  this._headers.forEach((entry, lowerCaseName) => {
    newHeaders._headers.set(lowerCaseName, { ...entry });
  });

  targets.forEach(target => {
    if (!target) return; // Ignore null/undefined

    let source;
    if (target instanceof AxiosHeaders) {
      source = target.toJSON();
    } else if (isObject(target)) {
      source = target;
    } else if (isString(target)) {
      source = new AxiosHeaders()._parseHeaderString(target);
    } else {
      return; // Ignore other types
    }

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        newHeaders.set(key, source[key], true); // Merge, always overwrite
      }
    }
  });
  return newHeaders;
}

/**
 * Resolves all internal header values into a new plain object with string values, suitable for network.
 * @param {boolean} [asStrings=false] - If true, array values are joined by commas.
 * @returns {object} A plain object of headers.
 */
toJSON(asStrings = false) {
  const obj = {};
  this._headers.forEach(entry => {
    let value = entry.value;
    if (value === null || value === false || isUndefined(value)) {
      return; // Skip null/false/undefined headers
    }
    if (Array.isArray(value)) {
      obj[entry.originalKey] = asStrings ? value.join(',') : value.map(String);
    } else if (isObject(value) && !isString(value)) { // Plain objects (not stringified)
      obj[entry.originalKey] = String(value); // Convert to string
    } else {
      obj[entry.originalKey] = String(value); // Ensure all values are strings
    }
  });
  return obj;
}

  /**
   * Static factory method to create an `AxiosHeaders` instance from raw headers.
   * @param {AxiosHeaders | object | string} [thing] - Headers input.
   * @returns {AxiosHeaders} A new or existing `AxiosHeaders` instance.
   */
  static from(thing) {
  if (thing instanceof AxiosHeaders) {
    return thing;
  }
  return new AxiosHeaders(thing);
}

  /**
   * Static factory method to create a new `AxiosHeaders` instance by merging multiple targets.
   * @param {...(AxiosHeaders | object | string | undefined | null)} targets - Headers to merge.
   * @returns {AxiosHeaders} A new `AxiosHeaders` instance.
   */
  static concat(...targets) {
  const newHeaders = new AxiosHeaders();
  return newHeaders.concat(...targets);
}
}

// --- Interceptor Manager ---

/**
 * Manages request and response interceptors.
 */
class InterceptorManager {
  constructor() {
    this.handlers = [];
    this.idCounter = 0; // Unique ID counter for interceptors
  }

  /**
   * Adds a new interceptor.
   * @param {Function} onFulfilled - The fulfillment handler.
   * @param {Function} [onRejected] - The rejection handler.
   * @param {object} [options] - Optional settings like `synchronous` or `runWhen`.
   * @returns {number} The ID of the added interceptor.
   */
  use(onFulfilled, onRejected, options) {
    this.handlers.push({
      onFulfilled: onFulfilled,
      onRejected: onRejected,
      synchronous: options && options.synchronous, // Note: synchronous option is primarily advisory in Promise chains
      runWhen: options && options.runWhen,
      id: this.idCounter++
    });
    return this.idCounter - 1;
  }

  /**
   * Removes a previously added interceptor.
   * @param {number} id - The ID of the interceptor to remove.
   * @returns {boolean} True if the interceptor was found and removed.
   */
  eject(id) {
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i] && this.handlers[i].id === id) {
        this.handlers.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes all registered interceptors.
   */
  clear() {
    this.handlers = [];
  }
}

// --- Request Dispatcher (Adapters) ---

/**
 * Adapter for browser environments using XMLHttpRequest.
 * @param {object} config - The request configuration.
 * @returns {Promise<object>} A Promise that resolves with the response or rejects with an AxiosError.
 */
function browserAdapter(config) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 1. Build URL
    let url = config.url;
    if (config.params) {
      const queryString = buildURLSearchParams(config.params);
      url += (url.indexOf('?') === -1 ? '?' : '&') + queryString;
    }
    // BaseURL logic: Prepend baseURL if URL is relative, or if absolute URLs are explicitly disallowed
    // Default `allowAbsoluteUrls` is `true`, meaning `baseURL` is NOT prepended to absolute URLs by default.
    if (config.baseURL) {
      const isAbsoluteURL = /^([a-z][a-z\d\+\-\.]{1,5}:)?\/\//i.test(url); // Regex for absolute URLs (e.g., http://, //, file://)
      if (!isAbsoluteURL || config.allowAbsoluteUrls === false) {
        url = config.baseURL + url;
      }
    }

    xhr.open(config.method.toUpperCase(), url, true);

    // 2. Set headers
    const requestHeaders = config.headers.toJSON();
    for (const key in requestHeaders) {
      if (Object.prototype.hasOwnProperty.call(requestHeaders, key)) {
        if (requestHeaders[key] !== null && !isUndefined(requestHeaders[key])) {
          xhr.setRequestHeader(key, String(requestHeaders[key]));
        }
      }
    }

    // Basic Auth header if 'auth' config is present and not explicitly set in headers
    if (config.auth && !config.headers.has('Authorization')) {
      const username = config.auth.username || '';
      const password = config.auth.password || '';
      // Using btoa for base64 encoding, only available in browsers
      if (typeof btoa === 'function') {
        xhr.setRequestHeader('Authorization', 'Basic ' + btoa(`${username}:${password}`));
      }
    }

    // XSRF protection (simplified: if withXSRFToken is true, check cookie and set header)
    if (config.withXSRFToken && config.xsrfCookieName && config.xsrfHeaderName && IS_BROWSER) {
      const xsrfToken = document.cookie.split('; ').find(row => row.startsWith(config.xsrfCookieName + '='));
      if (xsrfToken) {
        xhr.setRequestHeader(config.xsrfHeaderName, xsrfToken.split('=')[1]);
      }
    }

    // 3. Set timeout
    if (config.timeout && config.timeout > 0) {
      xhr.timeout = config.timeout;
    }

    // 4. Handle cancellation (AbortController is preferred, CancelToken deprecated)
    const abortController = config.signal;
    const cancelToken = config.cancelToken;

    function handleAbortController() {
      xhr.abort();
      reject(new AxiosError('Request aborted by AbortController.', 'ERR_CANCELED', config, xhr));
    }

    function handleCancelToken() {
      if (cancelToken.reason) { // Ensure reason exists
        xhr.abort();
        reject(new AxiosError(cancelToken.reason.message, 'ERR_CANCELED', config, xhr));
      }
    }

    if (abortController) {
      abortController.addEventListener('abort', handleAbortController);
      if (abortController.signal.aborted) {
        return handleAbortController(); // Already aborted
      }
    }
    if (cancelToken) {
      cancelToken.promise.then(handleCancelToken);
      try {
        cancelToken.throwIfRequested(); // Check if already canceled synchronously
      } catch (cancelErr) {
        // If already canceled, reject immediately
        return reject(new AxiosError(cancelErr.message, 'ERR_CANCELED', config, xhr));
      }
    }

    // 5. Event Handlers
    xhr.ontimeout = function () {
      if (abortController) abortController.removeEventListener('abort', handleAbortController);
      reject(new AxiosError(
        `timeout of ${config.timeout}ms exceeded`,
        config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        config,
        xhr
      ));
    };

    xhr.onerror = function () {
      // xhr.status is 0 for network errors (including CORS/Mixed Content)
      if (abortController) abortController.removeEventListener('abort', handleAbortController);
      reject(new AxiosError(
        'Network Error',
        'ERR_NETWORK',
        config,
        xhr
      ));
    };

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }

      if (abortController) abortController.removeEventListener('abort', handleAbortController);

      // Check for network errors or server issues before processing response
      if (xhr.status === 0) {
        // This can also indicate CORS/Mixed Content issues
        reject(new AxiosError('Network Error', 'ERR_NETWORK', config, xhr));
        return;
      }

      const responseHeaders = new AxiosHeaders(xhr.getAllResponseHeaders());
      let responseData = xhr.response; // Raw response based on responseType

      // Data transformation based on responseType and Content-Type
      const responseContentType = responseHeaders.get('content-type');
      if (config.responseType === 'json' || (config.responseType === 'text' && responseContentType && responseContentType.toLowerCase().includes('json')) || (config.transitional && config.transitional.forcedJSONParsing && responseContentType && !responseContentType.toLowerCase().includes('json'))) {
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch (e) {
          // Handle JSON parsing errors based on transitional options
          if (!config.transitional || !config.transitional.silentJSONParsing) {
            // Default: pass raw text if parsing fails (and not silent)
            responseData = xhr.responseText;
          } else {
            // silentJSONParsing: just pass raw text without error
            responseData = xhr.responseText;
          }
        }
      } else if (config.responseType === 'arraybuffer' || config.responseType === 'blob' || config.responseType === 'stream') {
        responseData = xhr.response; // Already handled by XHR responseType. 'stream' will be treated as Blob/ArrayBuffer by XHR.
      } else if (config.responseType === 'document') {
        responseData = xhr.responseXML;
      } else { // 'text' or default (treated as text)
        responseData = xhr.responseText;
      }

      const response = {
        data: responseData,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: responseHeaders.toJSON(),
        config: config,
        request: xhr,
      };

      // Validate status
      const validateStatus = config.validateStatus || function (status) {
        return status >= 200 && status < 300;
      };

      if (validateStatus(xhr.status)) {
        resolve(response);
      } else {
        reject(new AxiosError(
          `Request failed with status code ${xhr.status}`,
          xhr.status >= 400 && xhr.status < 500 ? 'ERR_BAD_REQUEST' : 'ERR_BAD_RESPONSE',
          config,
          xhr,
          response
        ));
      }
    };

    // 6. Progress events (rate-limited)
    let lastUploadProgressUpdate = 0;
    let lastDownloadProgressUpdate = 0;
    const progressLimit = 1000 / 3; // Max 3 times per second

    if (config.onUploadProgress) {
      xhr.upload.onprogress = function (event) {
        const now = Date.now();
        if (now - lastUploadProgressUpdate > progressLimit || event.loaded === event.total) {
          lastUploadProgressUpdate = now;
          config.onUploadProgress({
            loaded: event.loaded,
            total: event.total,
            progress: event.total ? (event.loaded / event.total) : 0,
            bytes: event.loaded,
            estimated: event.total, // Simplified, no actual estimate
            rate: null, // Cannot easily calculate rate without more data
            upload: true,
            download: false,
          });
        }
      };
    }

    if (config.onDownloadProgress) {
      xhr.onprogress = function (event) {
        const now = Date.now();
        if (now - lastDownloadProgressUpdate > progressLimit || event.loaded === event.total) {
          lastDownloadProgressUpdate = now;
          config.onDownloadProgress({
            loaded: event.loaded,
            total: event.total,
            progress: event.total ? (event.loaded / event.total) : 0,
            bytes: event.loaded,
            estimated: event.total,
            rate: null,
            upload: false,
            download: true,
          });
        }
      };
    }

    // 7. Set responseType for XHR
    xhr.responseType = config.responseType || 'json'; // Default to json

    // 8. Prepare request data
    let requestData = config.data;
    const contentType = config.headers.get('Content-Type');
    const isFormMethod = config._isFormRequest;

    if (isObject(requestData)) {
      if (isFormMethod || (contentType && contentType.toLowerCase().includes('multipart/form-data'))) {
        // For *Form methods or explicit multipart/form-data, use FormData conversion
        requestData = toFormData(requestData, true); // Use native FormData for browser
        // XHR automatically sets Content-Type: multipart/form-data with boundary for FormData objects
      } else if (contentType && contentType.toLowerCase().includes('application/x-www-form-urlencoded')) {
        requestData = buildURLSearchParams(requestData);
      } else {
        // Default to JSON for plain objects if Content-Type not specified
        requestData = JSON.stringify(requestData);
        if (!config.headers.has('Content-Type')) {
          xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        }
      }
    } else if (isFormMethod && (requestData instanceof HTMLFormElement || requestData instanceof FileList)) {
      // Handle direct HTML Form elements or FileList for *Form methods
      requestData = toFormData(requestData, true);
    }

    xhr.send(requestData);
  });
}

/**
 * Adapter for Node.js environments using Node's built-in http/https modules.
 * This implementation has known limitations due to the "zero-dependency" constraint,
 * especially regarding redirects, robust multipart/form-data, agents, and proxies.
 * @param {object} config - The request configuration.
 * @returns {Promise<object>} A Promise that resolves with the response or rejects with an AxiosError.
 */
function nodeAdapter(config) {
  return new Promise((resolve, reject) => {
    // 1. Check cancellation early
    if (config.cancelToken) {
      try {
        config.cancelToken.throwIfRequested();
      } catch (cancelErr) {
        return reject(new AxiosError(cancelErr.message, 'ERR_CANCELED', config, null));
      }
    }
    if (config.signal && config.signal.aborted) {
      return reject(new AxiosError('Request aborted by AbortController.', 'ERR_CANCELED', config, null));
    }

    // 2. Warn about unsupported features due to zero-dependency
    if (config.maxRedirects && config.maxRedirects > 0) {
      console.warn('Axios (clean-room): `maxRedirects` is not fully supported without external dependencies in Node.js. Request will not follow redirects.');
    }
    if (config.proxy) {
      console.warn('Axios (clean-room): `proxy` is not fully supported without external dependencies in Node.js.');
    }
    if (config.httpAgent || config.httpsAgent) {
      console.warn('Axios (clean-room): `httpAgent`/`httpsAgent` are not fully supported without external dependencies in Node.js.');
    }
    // Other unsupported Node.js specific features like `maxContentLength`, `maxBodyLength`, `decompress`, `insecureHTTPParser`, `maxRate`, `httpVersion`, `http2Options` are silently ignored for simplicity.

    // 3. Build URL and parse
    let urlObj;
    try {
      let requestUrl = config.url;
      // BaseURL logic
      if (config.baseURL) {
        const isAbsoluteURL = /^([a-z][a-z\d\+\-\.]{1,5}:)?\/\//i.test(requestUrl);
        if (!isAbsoluteURL || config.allowAbsoluteUrls === false) {
          requestUrl = config.baseURL + requestUrl;
        }
      }
      urlObj = new URL(requestUrl);
    } catch (e) {
      return reject(new AxiosError(`Invalid URL: ${config.url}`, 'ERR_INVALID_URL', config));
    }

    if (config.params) {
      const queryString = buildURLSearchParams(config.params);
      if (queryString) {
        urlObj.search = `${urlObj.search ? urlObj.search + '&' : '?'}${queryString}`;
      }
    }

    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? require('https') : require('http');

    // 4. Prepare headers and request data
    const headers = config.headers.toJSON();
    let requestData = config.data;
    const contentType = config.headers.get('Content-Type');
    const isFormMethod = config._isFormRequest;

    if (isObject(requestData)) {
      if (isFormMethod || (contentType && contentType.toLowerCase().includes('multipart/form-data'))) {
        // For *Form methods or explicit multipart/form-data, attempt FormData conversion.
        // Node.js's http/https modules don't directly handle FormData objects. It requires conversion.
        // Without `form-data` package, this is a severe limitation for Node.js. Fallback to URL-encoded.
        console.warn('Axios (clean-room): `multipart/form-data` for plain objects in Node.js is limited without `form-data` package. Falling back to `application/x-www-form-urlencoded`.');
        requestData = buildURLSearchParams(requestData);
        headers['Content-Type'] = 'application/x-www-form-urlencoded'; // Override Content-Type
      } else if (contentType && contentType.toLowerCase().includes('application/x-www-form-urlencoded')) {
        requestData = buildURLSearchParams(requestData);
      } else {
        // Default to JSON for plain objects if Content-Type not specified
        requestData = JSON.stringify(requestData);
        if (!config.headers.has('Content-Type')) {
          headers['Content-Type'] = 'application/json;charset=utf-8';
        }
      }
    }

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: config.method.toUpperCase(),
      headers: headers,
      timeout: config.timeout || 0,
      // `agent`, `socketPath`, `proxy` are ignored for simplicity due to zero-dependency.
    };

    // Basic Auth header if 'auth' config is present and not explicitly set in headers
    if (config.auth && !config.headers.has('Authorization')) {
      const username = config.auth.username || '';
      const password = config.auth.password || '';
      // Node.js uses Buffer for base64 encoding
      headers['Authorization'] = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    }

    // Set Content-Length if there's request data that can be measured easily
    if (requestData && (isString(requestData) || Buffer.isBuffer(requestData))) {
      options.headers['Content-Length'] = Buffer.byteLength(requestData);
    } else if (requestData) {
      // For other data types (e.g., Stream), Content-Length might not be easily determinable here.
      // This is a simplification and might lead to issues with chunked encoding if not handled.
    }

    const req = httpModule.request(options, res => {
      let responseDataBuffer = Buffer.from([]);

      // Progress events (simplified for Node.js)
      let lastDownloadProgressUpdate = 0;
      const progressLimit = 1000 / 3;
      const totalSize = res.headers['content-length'] ? parseInt(res.headers['content-length'], 10) : 0;

      res.on('data', chunk => {
        responseDataBuffer = Buffer.concat([responseDataBuffer, chunk]);
        if (config.onDownloadProgress) {
          const now = Date.now();
          if (now - lastDownloadProgressUpdate > progressLimit || responseDataBuffer.length === totalSize) {
            lastDownloadProgressUpdate = now;
            config.onDownloadProgress({
              loaded: responseDataBuffer.length,
              total: totalSize,
              progress: totalSize ? (responseDataBuffer.length / totalSize) : 0,
              bytes: responseDataBuffer.length,
              estimated: totalSize,
              rate: null, // Cannot easily calculate rate
              upload: false,
              download: true,
            });
          }
        }
      });

      res.on('end', () => {
        const responseHeaders = new AxiosHeaders(res.headers);
        let data = responseDataBuffer;

        // Response decoding/parsing
        const responseEncoding = config.responseEncoding || 'utf8'; // Node.js specific
        const responseContentType = responseHeaders.get('content-type');

        if (config.responseType === 'arraybuffer') {
          data = responseDataBuffer.buffer.slice(responseDataBuffer.byteOffset, responseDataBuffer.byteOffset + responseDataBuffer.byteLength); // Extract ArrayBuffer from Buffer
        } else if (config.responseType === 'json' || (config.responseType === 'text' && responseContentType && responseContentType.toLowerCase().includes('json')) || (config.transitional && config.transitional.forcedJSONParsing && responseContentType && !responseContentType.toLowerCase().includes('json'))) {
          try {
            data = JSON.parse(responseDataBuffer.toString(responseEncoding));
          } catch (e) {
            if (!config.transitional || !config.transitional.silentJSONParsing) {
              data = responseDataBuffer.toString(responseEncoding);
            } else {
              data = responseDataBuffer.toString(responseEncoding);
            }
          }
        } else if (config.responseType === 'text' || !config.responseType) {
          data = responseDataBuffer.toString(responseEncoding);
        } else if (config.responseType === 'stream') {
          // For 'stream', the specification notes the `httpFollow` package buffering the entire stream.
          // For zero-dependency, we return the full buffered data as it's already read.
          console.warn('Axios (clean-room): `responseType: "stream"` is not fully supported in Node.js without `pipeline` or `follow-redirects` packages. Returning buffered data.');
          data = responseDataBuffer; // Return the Buffer directly
        }

        const response = {
          data: data,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: responseHeaders.toJSON(),
          config: config,
          request: req,
        };

        const validateStatus = config.validateStatus || function (status) {
          return status >= 200 && status < 300;
        };

        if (validateStatus(res.statusCode)) {
          resolve(response);
        } else {
          reject(new AxiosError(
            `Request failed with status code ${res.statusCode}`,
            res.statusCode >= 400 && res.statusCode < 500 ? 'ERR_BAD_REQUEST' : 'ERR_BAD_RESPONSE',
            config,
            req,
            response
          ));
        }
      });
    });

    req.on('error', error => {
      if (config.signal) config.signal.removeEventListener('abort', abortHandler); // Ensure cleanup
      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return reject(new AxiosError(
          `timeout of ${config.timeout}ms exceeded`,
          config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
          config,
          req
        ));
      }
      reject(new AxiosError('Network Error', 'ERR_NETWORK', config, req, { request: req }));
    });

    // Handle request timeout
    let timeoutId;
    if (config.timeout && config.timeout > 0) {
      timeoutId = setTimeout(() => {
        req.destroy(new AxiosError(
          `timeout of ${config.timeout}ms exceeded`,
          config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
          config,
          req
        ));
        req.abort(); // Also abort the underlying request
      }, config.timeout);
      // Ensure clearing timeout on success or error before it fires
      req.on('response', () => clearTimeout(timeoutId));
      req.on('error', () => clearTimeout(timeoutId));
    }

    // AbortController integration for Node.js
    let abortHandler;
    if (config.signal) {
      abortHandler = () => {
        req.destroy(new AxiosError('Request aborted by AbortController.', 'ERR_CANCELED', config, req));
        config.signal.removeEventListener('abort', abortHandler); // Clean up listener
      };
      config.signal.addEventListener('abort', abortHandler);
    }
    // CancelToken integration for Node.js
    if (config.cancelToken) {
      config.cancelToken.promise.then(reason => {
        if (!req._canceled) { // Ensure only one cancellation
          req._canceled = true;
          req.destroy(new AxiosError(reason.message, 'ERR_CANCELED', config, req));
        }
      });
    }

    // Send request data
    if (requestData) {
      if (requestData instanceof Buffer || isString(requestData)) {
        req.write(requestData);
      } else {
        // If it's a stream or other complex type, this simplified adapter won't handle it
        console.warn('Axios (clean-room): Request data type not fully supported for Node.js without external dependencies (e.g., streams). Attempting to stringify.');
        req.write(String(requestData)); // Attempt to stringify
      }
    }
    req.end();
  });
}

// Select the appropriate default adapter based on environment
const defaultAdapter = IS_BROWSER ? browserAdapter : (IS_NODE ? nodeAdapter : function (config) {
  return Promise.reject(new AxiosError('Environment not supported (neither browser nor Node.js).', 'ERR_NOT_SUPPORT', config));
});


// --- Axios Core Definition ---

/**
 * Creates an Axios instance.
 * @param {object} [instanceConfig] - Default configuration for this instance.
 */
function Axios(instanceConfig) {
  // Merge instance defaults with global defaults
  this.defaults = instanceConfig ? merge(Axios.defaults, instanceConfig) : merge({}, Axios.defaults);

  // Initialize interceptor managers for this instance
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager(),
  };
}

/**
 * Sends an HTTP request.
 * @param {string | object} configOrUrl - The request URL or configuration object.
 * @param {object} [config] - Optional configuration object (if url is provided).
 * @returns {Promise<object>} A Promise that resolves with the response.
 */
Axios.prototype.request = function (configOrUrl, config) {
  let requestConfig = config || {};

  // Handle URL overload: axios(url[, config])
  if (isString(configOrUrl)) {
    requestConfig.url = configOrUrl;
    if (isObject(config)) {
      requestConfig = merge(requestConfig, config);
    }
  } else if (isObject(configOrUrl)) {
    requestConfig = merge(requestConfig, configOrUrl);
  } else {
    return Promise.reject(new AxiosError('Invalid arguments for request: Must be a string (URL) or an object (config).', 'ERR_BAD_OPTION_VALUE'));
  }

  // Merge with instance defaults
  requestConfig = merge(this.defaults, requestConfig);

  // Set default method if not specified
  if (!requestConfig.method) {
    requestConfig.method = 'get';
  }
  requestConfig.method = requestConfig.method.toLowerCase();

  // Create AxiosHeaders instance by merging common, method-specific, and request-specific headers
  // `requestConfig.headers` is initially a plain object from merged defaults.
  const finalHeaders = AxiosHeaders.concat(
    requestConfig.headers.common, // Global common headers
    requestConfig.headers[requestConfig.method], // Method-specific headers
    requestConfig.headers // Request-specific headers (if any were directly in config.headers field)
  );
  requestConfig.headers = finalHeaders; // Replace plain object with AxiosHeaders instance

  // Apply `transformRequest`
  // `transformRequest` functions are applied only to 'PUT', 'POST', 'PATCH', and 'DELETE' request methods.
  if (['put', 'post', 'patch', 'delete'].includes(requestConfig.method)) {
    const transformRequest = Array.isArray(requestConfig.transformRequest) ? requestConfig.transformRequest : (isFunction(requestConfig.transformRequest) ? [requestConfig.transformRequest] : []);
    transformRequest.forEach(transform => {
      // Each transform function receives data and headers (as a plain object), and should return transformed data
      requestConfig.data = transform(requestConfig.data, requestConfig.headers.toJSON());
    });
  }

  // Chain interceptors: Request (LIFO), then Adapter, then Response (FIFO)
  let chain = [defaultAdapter, undefined]; // Adapter is the primary handler, with no reject handler initially

  // Request interceptors (executed in reverse order - LIFO)
  // Each interceptor can modify the config or return a new Promise
  this.interceptors.request.handlers.slice().reverse().forEach(handler => {
    // Check `runWhen` predicate
    const run = !handler.runWhen || handler.runWhen(requestConfig);
    if (run && (handler.onFulfilled || handler.onRejected)) {
      chain.unshift(handler.onFulfilled, handler.onRejected); // Add to beginning of chain
    }
  });

  // Response interceptors (executed in order - FIFO)
  // Each interceptor receives the result of its predecessor
  this.interceptors.response.handlers.forEach(handler => {
    if (handler.onFulfilled || handler.onRejected) {
      chain.push(handler.onFulfilled, handler.onRejected); // Add to end of chain
    }
  });

  let promise = Promise.resolve(requestConfig); // Start with the processed config

  // Build the promise chain
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// --- HTTP Method Shorthands ---

// Methods without data in body (GET, DELETE, HEAD, OPTIONS)
const methodsNoData = ['delete', 'get', 'head', 'options'];
methodsNoData.forEach(method => {
  Axios.prototype[method] = function (url, config) {
    return this.request(url, merge(config || {}, { method: method }));
  };
});

// Methods with data in body (POST, PUT, PATCH)
const methodsWithData = ['post', 'put', 'patch'];
methodsWithData.forEach(method => {
  Axios.prototype[method] = function (url, data, config) {
    return this.request(url, merge(config || {}, { method: method, data: data }));
  };
});

// Form Methods (POST, PUT, PATCH with Content-Type: multipart/form-data)
const methodsForm = ['postForm', 'putForm', 'patchForm'];
methodsForm.forEach(method => {
  const baseMethod = method.slice(0, -4); // Extract 'post', 'put', 'patch'
  Axios.prototype[method] = function (url, data, config) {
    const newConfig = merge(config || {}, {
      method: baseMethod,
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' }, // Explicitly set Content-Type
      _isFormRequest: true // Internal flag for adapter to apply specific form data logic
    });
    return this.request(url, newConfig);
  };
});

/**
 * Creates a new Axios instance with a custom configuration.
 * @param {object} [config] - Optional default configuration for the new instance.
 * @returns {Axios} A new Axios instance.
 */
Axios.prototype.create = function (config) {
  return new Axios(config);
};

/**
 * Constructs a URL from the instance's config and provided config, but does not perform a request.
 * @param {object} [config] - Optional configuration to merge for URL construction.
 * @returns {string} The constructed URL.
 */
Axios.prototype.getUri = function (config) {
  const mergedConfig = merge(this.defaults, config || {});
  let url = mergedConfig.url || '';

  // BaseURL logic
  if (mergedConfig.baseURL) {
    const isAbsoluteURL = /^([a-z][a-z\d\+\-\.]{1,5}:)?\/\//i.test(url);
    if (!isAbsoluteURL || mergedConfig.allowAbsoluteUrls === false) {
      url = mergedConfig.baseURL + url;
    }
  }

  if (mergedConfig.params) {
    const queryString = buildURLSearchParams(mergedConfig.params);
    if (queryString) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + queryString;
    }
  }
  return url;
};

// --- Global Defaults for Axios ---
Axios.defaults = {
  method: 'get',
  timeout: 0,
  // Headers are structured as a plain object for defaults,
  // and converted to AxiosHeaders later in the request pipeline.
  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*', // Default Accept header
    },
    // Specific headers for different methods can be added here
    // E.g., post: { 'Content-Type': 'application/json' }
  },
  // Function to validate HTTP status codes
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
  // Default request data transformer: automatically JSON.stringify plain objects
  transformRequest: [(data, headers) => {
    // Only transform if it's a plain object and Content-Type isn't already set
    if (isObject(data) && !headers['Content-Type'] && !headers['content-type']) {
      return JSON.stringify(data);
    }
    return data;
  }],
  // Default response data transformer: no-op, parsing already handled by adapter
  transformResponse: [(data) => data],
  responseType: 'json', // Default response type
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  withXSRFToken: false, // XSRF protection off by default
  allowAbsoluteUrls: true, // Default as per spec.
  // Node.js specific options (most will be ignored/simplified due to zero-dependency in this clean-room impl)
  maxRedirects: 5,
  responseEncoding: 'utf8',
  // Transitional options for backward compatibility
  transitional: {
    silentJSONParsing: false,
    forcedJSONParsing: false,
    clarifyTimeoutError: false,
    legacyInterceptorReqResOrdering: false, // My implementation follows the current (post v1) order
  }
};


// --- Create the default Axios instance ---
const axios = new Axios();

// Extend the default instance (which is a function object) with Axios prototype methods
// This allows calling `axios(config)` directly while also having `axios.get()`, etc.
extend(axios, Axios.prototype, axios);

// Add static methods and properties to the default `axios` object
axios.create = function (config) {
  return new Axios(config);
};
axios.isCancel = isCancel;
axios.isAxiosError = isAxiosError;
axios.CancelToken = CancelToken; // Deprecated
axios.AxiosHeaders = AxiosHeaders; // Expose the AxiosHeaders class

// Deprecated utility methods `axios.all` and `axios.spread` are intentionally omitted as per spec notes.

// --- Export the default Axios instance ---
module.exports = axios;
