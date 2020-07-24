const express = require('express')
const app = express()
var cors = require('cors')

app.use(cors());

const db = require('./db');
const pool = db.pool;

const host = 'api.sam.gov';
const api_key = '9PdfUrRuXuBUsMK0kgApHBn0tyFAlA2VjcV44rRT';

const port = 3000

app.get('/orgAwardedAmount', cors(), async (req, res) => {
  const quoted = (s) => `'${s}'`
  let orgs = req.query.orgs.split('|').map(o => quoted(o));
  let from = req.query.from;
  let to = req.query.to;
  console.log('Get org awarded amount request', orgs, from, to);

  let q = `SELECT * FROM opportunities WHERE to_date(opportunity_data ->> 'postedDate', 'YYYY-MM-DD') < '${to}' AND to_date(opportunity_data ->> 'postedDate', 'YYYY-MM-DD') > '${from}' AND opportunity_data ->> 'department' IN (${orgs.join(',')}) AND opportunity_data -> 'award' ->> 'amount' IS NOT NULL;`;
  console.log(q);
  let result = await pool.query(q);
  res.send(result.rows);
});
  

app.get('/setAsideByOppsType', cors(), async (req, res) => {
  
  let result = await pool.query(`select setaside, type, count (*) from
  (select opportunity_data ->> 'noticeId' as ID, 
  opportunity_data ->> 'typeOfSetAsideDescription' as setaside,
  opportunity_data ->> 'type' as type
  from opportunities) as table1
  group by setaside, type`);

  res.send(result.rows);
});

app.get('/totalOppsByOppsType', cors(), async (req, res) => {
  
  let result = await pool.query(`select oppstype, count(oppstype) from
  (select opportunity_data ->> 'type' as oppstype 
  from opportunities) as table1
  group by oppstype`);

  res.send(result.rows);
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))
