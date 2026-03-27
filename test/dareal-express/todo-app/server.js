const express = require('../index.js');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 9090;

app.get('/', (req, res) => {
    try {
        const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        if (res.nativeRes && res.nativeRes.setHeader) {
            res.nativeRes.setHeader('Content-Type', 'text/html');
        }
        res.send(html);
    } catch (err) {
        if (res.nativeRes && res.nativeRes.setHeader) {
            res.nativeRes.setHeader('Content-Type', 'text/plain');
        }
        res.send('Error loading index.html: ' + err.message);
    }
});

let serverTodos = [
    { id: 1, text: "Explore dareal-express", done: true },
    { id: 2, text: "Build a beautiful web app", done: false },
    { id: 3, text: "Amaze the user with design", done: false }
];

app.get('/api/todos', (req, res) => {
    if (res.nativeRes && res.nativeRes.setHeader) {
        res.nativeRes.setHeader('Content-Type', 'application/json');
    }
    res.send(JSON.stringify(serverTodos));
});

app.listen(port, () => {
    console.log(`Todo App server running at http://localhost:${port}`);
});
