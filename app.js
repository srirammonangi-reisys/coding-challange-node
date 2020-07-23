const express = require('express')
const app = express()

const db = require('./db');
const pool = db.pool;

const host = 'api.sam.gov';
const api_key = '9PdfUrRuXuBUsMK0kgApHBn0tyFAlA2VjcV44rRT';

const port = 3000

app.get('/orgAwardedAmount', async (req, res) => {
  const quoted = (s) => `'${s}'`
  let orgs = req.query.orgs.split('|').map(o => quoted(o));
  let from = req.query.from;
  let to = req.query.to;

  console.log('Get org awarded amount request', orgs, from, to);

  let q = `SELECT * FROM opportunities WHERE to_date(opportunity_data ->> 'postedDate', 'YYYY-MM-DD') < '${to}' AND to_date(opportunity_data ->> 'postedDate', 'YYYY-MM-DD') > '${from}' AND opportunity_data ->> 'department' IN (${orgs.join(',')});`
  console.log(q);
  let results = await pool.query(q);
  console.log(results);
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))
