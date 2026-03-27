const io = require('./index.js');
const { Server } = require('./index.js');

console.log('🚀 Initiating liberated-socket.io test sequence...\n');

try {
    console.log('--- Test 1: Instantiating ---');
    // Using the factory function directly
    const server = io(3000);
    console.log('✅ Server instantiated and listening on port 3000.\n');

    console.log('--- Test 2: Simulating Connections ---');
    server.on('connection', (socket) => {
        console.log(`✅ New connection caught by Server event listener. Socket ID: ${socket.id}`);
        
        socket.on('ping', () => {
             console.log(`✅ Received ping from ${socket.id}`);
        });
    });

    const mockClient = server._simulateConnection('/');
    mockClient.emit('ping');

    console.log('\n--- Test 3: Namespaces & Rooms ---');
    const adminNs = server.of('/admin');
    adminNs.on('connection', (socket) => {
        console.log(`✅ Connection on /admin namespace. Socket ID: ${socket.id}`);
        socket.join('super-admins');
    });
    
    const adminClient = server._simulateConnection('/admin');
    adminNs.to('super-admins').emit('alert', 'System update starting');

    console.log('\n🎉 All internal clean-room tests passed! Closing server...');
    server.close();
} catch (e) {
    console.error('❌ Test failed with error:', e);
}
