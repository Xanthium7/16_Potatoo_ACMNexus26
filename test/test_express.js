const express = require('./dareal-express/index.js');
const http = require('http');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello World from private Express clone!');
});

app.get('/api', (req, res) => {
  // FIX 1: Manually stringify the JSON and use res.send()
  res.send(JSON.stringify({ success: true, fake: "yes" }));
});

// Start the server (No need to assign to 'const server' since it returns undefined)
app.listen(PORT, () => {
  console.log(`Test server initialized successfully on port ${PORT}`);

  // Test the primary GET route 
  http.get(`http://localhost:${PORT}/`, (res) => {
    let rawData = '';
    res.on('data', chunk => { rawData += chunk; });
    res.on('end', () => {
      console.log('Received GET / response text: ', rawData);

      // Next, test the JSON GET route mappings
      http.get(`http://localhost:${PORT}/api`, (res2) => {
        let rawData2 = '';
        res2.on('data', chunk => { rawData2 += chunk; });
        res2.on('end', () => {
          console.log('Received GET /api JSON response: ', rawData2);

          // Cleanup and prevent terminal hanging!
          console.log('\nAll core endpoints effectively resolved. Terminating test server context.');

          // FIX 2: Access the server instance directly from the app object
          app.server.close();
        });
      });
    });
  }).on('error', err => {
    console.error('Request processing error:', err.message);
    app.server.close(); // FIX 2 applied here as well
  });
});