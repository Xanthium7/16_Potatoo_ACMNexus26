const io = require('./index.js');
const http = require('http');

const PORT = 3000;

// Creating a pure Node.js HTTP server (without any Express dependencies)
const httpServer = http.createServer((req, res) => {
    // We parse the URL natively to capture query parameters
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    
    // Check if the route is /ping
    if (requestUrl.pathname === '/ping') {
        const msg = requestUrl.searchParams.get('msg') || 'Bare ping test';

        // 1. We simulate an internal client connecting to the Socket Server
        const simulatedClient = socketServer._simulateConnection('/');
        
        // 2. We command the internal client to fire a 'terminal_ping' event
        simulatedClient.emit('terminal_ping', msg);
        
        // 3. We respond to the terminal curl request indicating success
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`✅ Raw HTTP to Socket Ping dispatched!\nMessage payload: "${msg}"\n`);
    } else {
        // Fallback for an unhandled route
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found\n');
    }
});

// We attach our liberated Socket.IO core to the raw HTTP server
const socketServer = io(httpServer);

// --- Socket Event Listeners ---
socketServer.on('connection', (socket) => {
    console.log(`[Socket Core] 🟢 New logic client connected (ID: ${socket.id})`);
    
    // Intercept our custom 'terminal_ping' event from the simulated client
    socket.on('terminal_ping', (message) => {
        console.log(`[Socket Core] 📩 Received terminal ping message: "${message}"`);
    });
});

// Start our new standalone server
httpServer.listen(PORT, () => {
    console.log(`🚀 Dedicated Socket Test Server is LIVE on port ${PORT}`);
    console.log(`\nTo ping this standalone server, open your terminal and run:`);
    console.log(`👉  curl "http://localhost:3000/ping?msg=Stand_Alone_Works!"\n`);
});
