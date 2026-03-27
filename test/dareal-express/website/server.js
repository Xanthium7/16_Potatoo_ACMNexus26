const express = require('../index.js'); // Uses out fully clean-room express version
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

app.get('/', (req, res) => {
    // We read the HTML file from disk to prove dynamic static-ish file serving capabilities 
    const htmlPath = path.join(__dirname, 'index.html');
    
    fs.readFile(htmlPath, 'utf8', (err, data) => {
        if (err) {
            res.nativeRes.statusCode = 500;
            res.send('Server Error loading index.html');
            return;
        }
        // Utilizing native headers to instruct the browser to parse HTML directly!
        res.nativeRes.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(data);
    });
});

// An internal API route serving the frontend javascript queries with JSON
app.get('/api/ping', (req, res) => {
    const payload = {
        status: "ok",
        message: "dareal-express internal route mapped perfectly!",
        time: new Date().toLocaleTimeString()
    };
    
    res.nativeRes.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(payload));
});

// Boot the Web Server
app.listen(PORT, () => {
    console.log(`✨ Premium Clean Room Website powered locally!`);
    console.log(`🌐 Ready on http://localhost:${PORT}`);
    console.log(`   (Hit CTRL+C to terminate)`);
});
