const http = require('http'); // Required for Node.js HTTP server functionality

/**
 * A simple EventEmitter implementation.
 * Used as a base for Server, Namespace, and Socket classes.
 */
class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    /**
     * Registers a listener for a specific event.
     * @param {string} eventName The name of the event to listen for.
     * @param {function} listener The callback function to execute when the event occurs.
     * @returns {this} The EventEmitter instance, allowing for method chaining.
     */
    on(eventName, listener) {
        if (typeof eventName !== 'string' || eventName.length === 0) {
            console.warn('EventEmitter.on: Event name must be a non-empty string.');
            return this;
        }
        if (typeof listener !== 'function') {
            console.warn(`EventEmitter.on: Listener for event '${eventName}' must be a function.`);
            return this;
        }
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(listener);
        return this;
    }

    /**
     * Emits an event, invoking all registered listeners for that event.
     * @param {string} eventName The name of the event to emit.
     * @param {...any} args Any number of arguments to pass to the listeners.
     * @returns {this} The EventEmitter instance, allowing for method chaining.
     */
    emit(eventName, ...args) {
        if (typeof eventName !== 'string' || eventName.length === 0) {
            console.warn('EventEmitter.emit: Event name must be a non-empty string.');
            return this;
        }
        if (this.listeners[eventName]) {
            // Create a shallow copy to prevent issues if listeners are removed during iteration
            const currentListeners = [...this.listeners[eventName]];
            currentListeners.forEach(listener => {
                try {
                    listener(...args);
                } catch (e) {
                    console.error(`Error in listener for event '${eventName}':`, e);
                }
            });
        }
        return this;
    }
}

/**
 * Represents an individual client connection to the Socket.IO server or a specific namespace.
 */
class Socket extends EventEmitter {
    /**
     * @param {string} id A unique identifier for this socket.
     * @param {Namespace} namespace The namespace this socket belongs to.
     */
    constructor(id, namespace) {
        super();
        this.id = id;
        this.namespace = namespace;
        this.rooms = new Set(); // Rooms this socket has joined within its namespace
    }

    /**
     * Emits an event to this specific client socket. Only this client will receive the event.
     * In a clean room server-side implementation, this conceptually sends data to the client.
     * For demonstration, it will log the event.
     * @param {string} eventName The name of the event to emit.
     * @param {...any} args Any number of serializable data arguments to send along with the event.
     * @returns {Socket} The Socket instance, allowing for method chaining.
     */
    emit(eventName, ...args) {
        if (typeof eventName !== 'string' || eventName.length === 0) {
            console.warn('Socket.emit: Event name must be a non-empty string.');
            return this;
        }
        // This is the server sending an event *to* the client.
        // In a real Socket.IO, this would serialize and send data over the wire.
        // For this clean room, we'll simulate by logging or by having a mock client handler.
        // For simplicity, we'll just log here.
        // console.log(`[Socket ${this.id} in ${this.namespace.path}] Sending to client: '${eventName}'`, args);
        return this;
    }

    /**
     * Adds this socket to a specified room.
     * @param {string} room The name of the room to join.
     * @returns {Socket} The Socket instance, allowing for method chaining.
     */
    join(room) {
        if (typeof room !== 'string' || room.length === 0) {
            console.warn('Socket.join: Room name must be a non-empty string.');
            return this;
        }
        this.rooms.add(room);
        this.namespace._addSocketToRoom(this.id, room);
        return this;
    }

    /**
     * Removes this socket from a specified room.
     * @param {string} room The name of the room to leave.
     * @returns {Socket} The Socket instance, allowing for method chaining.
     */
    leave(room) {
        if (typeof room !== 'string' || room.length === 0) {
            console.warn('Socket.leave: Room name must be a non-empty string.');
            return this;
        }
        this.rooms.delete(room);
        this.namespace._removeSocketFromRoom(this.id, room);
        return this;
    }
}

/**
 * Represents a logical separation of communication channels within the Socket.IO server.
 */
class Namespace extends EventEmitter {
    /**
     * @param {string} path The path or identifier for the namespace (e.g., '/admin').
     * @param {Server} server The parent Socket.IO Server instance.
     */
    constructor(path, server) {
        super();
        this.path = path;
        this.server = server;
        this.sockets = new Map(); // Map<socketId, Socket> - Sockets connected to this namespace
        this.rooms = new Map();   // Map<roomName, Set<socketId>> - Sockets organized by room within this namespace
    }

    /**
     * Internal method to add a socket to this namespace.
     * Emits the 'connection' event for this namespace.
     * @param {Socket} socket The socket instance to add.
     * @private
     */
    _addSocket(socket) {
        this.sockets.set(socket.id, socket);
        this.emit('connection', socket); // Emit 'connection' event for this namespace
    }

    /**
     * Internal method to remove a socket from this namespace.
     * @param {string} socketId The ID of the socket to remove.
     * @param {string} reason The reason for disconnection.
     * @private
     */
    _removeSocket(socketId, reason = 'server shutting down') {
        const socket = this.sockets.get(socketId);
        if (socket) {
            this.sockets.delete(socketId);
            // Remove from all rooms it might have joined
            socket.rooms.forEach(room => this._removeSocketFromRoom(socketId, room));
            // Emit 'disconnect' event on the socket itself (server-side listener)
            // The spec says 'Socket.on' for 'disconnect' receives the reason.
            socket.emit('disconnect', reason); 
        }
    }

    /**
     * Internal method to add a socket to a room within this namespace.
     * @param {string} socketId The ID of the socket.
     * @param {string} room The name of the room.
     * @private
     */
    _addSocketToRoom(socketId, room) {
        if (!this.rooms.has(room)) {
            this.rooms.set(room, new Set());
        }
        this.rooms.get(room).add(socketId);
    }

    /**
     * Internal method to remove a socket from a room within this namespace.
     * @param {string} socketId The ID of the socket.
     * @param {string} room The name of the room.
     * @private
     */
    _removeSocketFromRoom(socketId, room) {
        if (this.rooms.has(room)) {
            this.rooms.get(room).delete(socketId);
            if (this.rooms.get(room).size === 0) {
                this.rooms.delete(room); // Clean up empty rooms
            }
        }
    }

    /**
     * Emits an event to all connected sockets within this specific namespace.
     * @param {string} eventName The name of the event to emit.
     * @param {...any} args Any number of serializable data arguments.
     * @returns {Namespace} The Namespace instance, allowing for method chaining.
     */
    emit(eventName, ...args) {
        if (typeof eventName !== 'string' || eventName.length === 0) {
            console.warn('Namespace.emit: Event name must be a non-empty string.');
            return this;
        }
        this.sockets.forEach(socket => {
            socket.emit(eventName, ...args); // Emit to client
        });
        return this;
    }

    /**
     * Specifies a room within this namespace to target for subsequent event emissions.
     * @param {string} room The name of the room to target.
     * @returns {{emit: function(...any): Namespace}} An object with an `emit` method.
     */
    to(room) {
        if (typeof room !== 'string' || room.length === 0) {
            console.warn('Namespace.to: Room name must be a non-empty string.');
            // Return a no-op emitter to prevent errors in chained calls
            return { emit: () => this };
        }

        const self = this;
        return {
            /**
             * Emits an event to sockets in the specified room within this namespace.
             * @param {string} eventName The name of the event to emit.
             * @param {...any} args Any number of serializable data arguments.
             * @returns {Namespace} The Namespace instance, allowing for method chaining.
             */
            emit: function(eventName, ...args) {
                if (typeof eventName !== 'string' || eventName.length === 0) {
                    console.warn('Namespace.to().emit: Event name must be a non-empty string.');
                    return self;
                }
                if (self.rooms.has(room)) {
                    self.rooms.get(room).forEach(socketId => {
                        const socket = self.sockets.get(socketId);
                        if (socket) {
                            socket.emit(eventName, ...args); // Emit to client
                        }
                    });
                }
                return self; // Return the Namespace instance for chaining
            }
        };
    }

    /**
     * An alias for the `to` method.
     * @param {string} room The name of the room to target.
     * @returns {{emit: function(...any): Namespace}} An object with an `emit` method.
     */
    in(room) {
        return this.to(room);
    }
}

/**
 * The core class representing the Socket.IO server.
 */
class Server extends EventEmitter {
    /**
     * Creates a new Socket.IO Server instance.
     * @param {http.Server | null} httpServer An optional Node.js `http.Server` instance.
     * @param {object} [options={}] Optional configuration options.
     * @param {number} [options.pingInterval=25000] Heartbeat interval in milliseconds.
     * @param {number} [options.pingTimeout=5000] Heartbeat timeout in milliseconds.
     */
    constructor(httpServer, options = {}) {
        super();
        this._httpServer = null;
        this._isInternalHttpServer = false; // True if Server created its own HTTP server
        this._options = {
            pingInterval: 25000, // Default from spec
            pingTimeout: 5000,   // Default from spec
            ...options
        };

        this._namespaces = new Map(); // Map<path, Namespace>
        this._defaultNamespace = this.of('/'); // Create default namespace '/'
        this._nextGlobalSocketId = 0; // Global unique ID counter for sockets

        // Handle initial httpServer or port number if provided to the factory function
        if (httpServer) {
            this._attachHttpServer(httpServer);
        }
    }

    /**
     * Internal method to attach or set the underlying HTTP server.
     * @param {http.Server} serverInstance The Node.js HTTP server instance.
     * @private
     */
    _attachHttpServer(serverInstance) {
        if (this._httpServer && this._isInternalHttpServer) {
            // If we previously created an internal HTTP server, close it first.
            this._httpServer.close();
        }
        this._httpServer = serverInstance;
        this._isInternalHttpServer = false; // No longer an internal server if one is provided
        // In a real Socket.IO, Engine.IO would attach its handlers to this server.
        // For this clean room, we just hold the reference.
    }

    /**
     * Starts the Socket.IO server listening on a specified port.
     * This method is typically used when the Server instance was created without an existing `http.Server` or port number.
     * @param {number} port The port number on which the server should listen.
     * @param {function} [callback] An optional callback function invoked once the server starts listening.
     * @returns {Server} The Server instance, allowing for method chaining.
     */
    listen(port, callback) {
        if (typeof port !== 'number' || port <= 0 || port > 65535) {
            console.warn('Server.listen: Port must be a valid number (1-65535).');
            if (callback) callback(new Error('Invalid port number'));
            return this;
        }

        if (!this._httpServer) {
            this._httpServer = http.createServer();
            this._isInternalHttpServer = true;
        }

        this._httpServer.listen(port, () => {
            // console.log(`Socket.IO server (mock) listening on port ${port}`);
            if (callback) callback();
        });

        // In a real Socket.IO, this is where Engine.IO would start listening for HTTP/WebSocket traffic.
        // For this clean room, we'll provide a way to simulate client connections.
        return this;
    }

    /**
     * Closes the underlying HTTP server if it was created internally by this Socket.IO server.
     * Note: The spec doesn't explicitly mention a `close` method, but it's good practice.
     * @param {function} [callback] An optional callback function invoked once the server is closed.
     */
    close(callback) {
        if (this._httpServer && this._isInternalHttpServer) {
            this._httpServer.close(callback);
            this._httpServer = null;
            this._isInternalHttpServer = false;
            // Disconnect all sockets across all namespaces
            this._namespaces.forEach(namespace => {
                namespace.sockets.forEach(socket => {
                    namespace._removeSocket(socket.id, 'server shutting down');
                });
            });
        } else if (callback) {
            callback(); // If no internal server to close, just call callback
        }
    }

    /**
     * Internal method to simulate a new client connection.
     * This is for testing and demonstrating the API's 'connection' event.
     * @param {string} [namespacePath='/'] The path of the namespace to connect to.
     * @returns {Socket} The newly created Socket instance.
     * @private
     */
    _simulateConnection(namespacePath = '/') {
        const namespace = this.of(namespacePath);
        const socketId = `s${this._nextGlobalSocketId++}`; // Unique ID across all namespaces
        const newSocket = new Socket(socketId, namespace);

        namespace._addSocket(newSocket); // This will emit 'connection' on the namespace
        this.emit('connection', newSocket); // Also emit 'connection' on the Server itself

        return newSocket;
    }

    /**
     * Registers a listener for a specific event on the server.
     * @param {string} eventName The name of the event to listen for.
     * @param {function} listener The callback function to execute when the event occurs.
     * @returns {Server} The Server instance, allowing for method chaining.
     */
    on(eventName, listener) {
        return super.on(eventName, listener);
    }

    /**
     * Emits an event to all connected sockets across all namespaces managed by this server.
     * @param {string} eventName The name of the event to emit.
     * @param {...any} args Any number of serializable data arguments.
     * @returns {Server} The Server instance, allowing for method chaining.
     */
    emit(eventName, ...args) {
        if (typeof eventName !== 'string' || eventName.length === 0) {
            console.warn('Server.emit: Event name must be a non-empty string.');
            return this;
        }
        // Emit to all sockets across all namespaces
        this._namespaces.forEach(namespace => {
            namespace.sockets.forEach(socket => {
                socket.emit(eventName, ...args); // Emit to client
            });
        });
        return this;
    }

    /**
     * Creates or retrieves a `Namespace` instance for the given path.
     * @param {string} namespacePath The path or identifier for the namespace.
     * @returns {Namespace} A `Namespace` instance.
     */
    of(namespacePath) {
        if (typeof namespacePath !== 'string' || namespacePath.length === 0) {
            throw new Error('Server.of: Namespace path must be a non-empty string.');
        }
        if (!this._namespaces.has(namespacePath)) {
            const newNamespace = new Namespace(namespacePath, this);
            this._namespaces.set(namespacePath, newNamespace);
        }
        return this._namespaces.get(namespacePath);
    }

    /**
     * Specifies a room to target for subsequent event emissions across all namespaces.
     * @param {string} room The name of the room to target.
     * @returns {{emit: function(...any): Server}} An object with an `emit` method.
     */
    to(room) {
        if (typeof room !== 'string' || room.length === 0) {
            console.warn('Server.to: Room name must be a non-empty string.');
            // Return a no-op emitter to prevent errors in chained calls
            return { emit: () => this };
        }

        const self = this;
        return {
            /**
             * Emits an event to sockets in the specified room across all namespaces.
             * @param {string} eventName The name of the event to emit.
             * @param {...any} args Any number of serializable data arguments.
             * @returns {Server} The Server instance, allowing for method chaining.
             */
            emit: function(eventName, ...args) {
                if (typeof eventName !== 'string' || eventName.length === 0) {
                    console.warn('Server.to().emit: Event name must be a non-empty string.');
                    return self;
                }
                self._namespaces.forEach(namespace => {
                    if (namespace.rooms.has(room)) {
                        namespace.rooms.get(room).forEach(socketId => {
                            const socket = namespace.sockets.get(socketId);
                            if (socket) {
                                socket.emit(eventName, ...args); // Emit to client
                            }
                        });
                    }
                });
                return self; // Return the Server instance for chaining
            }
        };
    }

    /**
     * An alias for the `to` method.
     * @param {string} room The name of the room to target.
     * @returns {{emit: function(...any): Server}} An object with an `emit` method.
     */
    in(room) {
        return this.to(room);
    }
}

/**
 * The default export of the package, acting as a factory function to create and return a new Socket.IO Server instance.
 * @param {http.Server | number} [httpServerOrPort] An optional Node.js `http.Server` instance or a port number.
 * @param {object} [options] Optional configuration options for the Socket.IO server.
 * @returns {Server} A new instance of the Socket.IO Server class.
 */
function io(httpServerOrPort, options) {
    if (typeof httpServerOrPort === 'number') {
        const server = new Server(null, options); // Create server without http instance initially
        server.listen(httpServerOrPort); // Then listen on the port
        return server;
    } else {
        return new Server(httpServerOrPort, options);
    }
}

// Named export for Server class
io.Server = Server;

// Export the factory function as default and Server as named
module.exports = io;
module.exports.Server = Server;
