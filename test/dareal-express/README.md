# dareal-express

This is a **private, unlicensed** structural mimic of the fundamental core framework API associated with the `express` npm module. 

> **IMPORTANT DISCLAIMER**
> This is NOT the real expressive HTTP framework. This micro-framework attempts to provide the foundational syntax and routing conveniences (e.g. `app.get()`, `app.post()`, `res.send()`, `app.listen()`) purely using Node.js's underlying native asynchronous `http` module mechanics, intended for educational/private use. It has absolutely no package dependencies and incorporates zero external module code, safely guaranteeing it is entirely free of external licensing constraints! 

## Quick Start Example Usage

```javascript
const express = require('dareal-express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

// JSON responses seamlessly supported
app.get('/api', (req, res) => {
  res.json({ success: true, fake: "yes" });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
```
