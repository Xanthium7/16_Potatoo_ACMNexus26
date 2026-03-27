const express = require('./index.js');
const app = express();

// 1. Test standard middleware
app.use((req, res, next) => {
    console.log(`[Middleware Log] ${req.method} request made to: ${req.url}`);
    next(); // Pass control to the next handler
});

// 2. Test basic GET route with HTML response
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Copy Express!</h1><p>The routing engine works.</p>');
});

// 3. Test JSON response and query parameters
app.get('/api/user', (req, res) => {
    // Try visiting: http://localhost:3000/api/user?name=Sankar
    const name = req.query.name || 'Guest';
    res.json({
        status: 'success',
        user: name,
        message: 'JSON response functional'
    });
});

// 4. Test method chaining and status codes
app.post('/api/data', (req, res) => {
    res.status(201).send('Data created successfully');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Copy Express server is running at http://localhost:${PORT}`);
});