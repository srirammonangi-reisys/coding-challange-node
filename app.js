const express = require('express')
const app = express()

const db = require('./db');
const pool = db.pool;

const host = 'api.sam.gov';
const api_key = '9PdfUrRuXuBUsMK0kgApHBn0tyFAlA2VjcV44rRT';

const port = 3000

app.get('/orgAwardedAmount', async (req, res) => {
  let orgs = req.query.orgs.split(',');
  let from = req.query.from;
  let to = req.query.to;

  console.log('Get org awarded amount request', orgs, from, to);
});



app.listen(port, () => console.log(`Listening at http://localhost:${port}`))
