const express = require('express')
const app = express()

const db = require('./db');
const pool = db.pool;

const host = 'api.sam.gov';
const api_key = '9PdfUrRuXuBUsMK0kgApHBn0tyFAlA2VjcV44rRT';

const port = 3000

app.get('/', async (req, res) => {
  await pool.query('select * from opportunities limit 10').then(data => {
    console.log(data);
    res.send(data);
  });
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))
