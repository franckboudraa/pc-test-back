const express = require('express');
const helmet = require('helmet');

const app = express();
app.use(helmet()); // security mod

app.get('/', async (req, res) => {
  res.send('hello world');
});

app.listen(process.env.port || 3000, () => console.log('Server started'));
