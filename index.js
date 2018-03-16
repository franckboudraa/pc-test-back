const express = require('express');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

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
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;
  const { model, method } = req.params;

  const db = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE
  });

  try {
    const data = await readFile(
      path.join(__dirname, `assets/sql/${model}/${method}.sql`)
    );
    const [rows, fields] = await db.execute(data);
    stream.write(data + '\n'); // Log each query
    res.send(rows);
  } catch (error) {
    res.status(500).send('An error occured');
  }
});

app.listen(process.env.port || 3000, () => console.log('Server started'));
