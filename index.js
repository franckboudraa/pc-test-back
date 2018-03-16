const express = require('express');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(helmet()); // security mod

// Wrapping readFile function in Promise
const readFile = (path, opts = 'utf8') =>
  new Promise((res, rej) => {
    fs.readFile(path, opts, (err, data) => {
      if (err) rej(err);
      else res(data);
    });
  });

// Create a stream for logging SQL queries
const stream = fs.createWriteStream(path.join(__dirname, 'logs/queries.log'), {
  flags: 'a'
});

app.get('/:model/:method', async (req, res) => {
  const { model, method } = req.params;

  try {
    const data = await readFile(
      path.join(__dirname, `assets/sql/${model}/${method}.sql`)
    );
    stream.write(data + '\n'); // Log each query
    res.send('ok');
  } catch (error) {
    res.status(500).send('An error occured');
  }
});

app.listen(process.env.port || 3000, () => console.log('Server started'));
