const express = require('express')
const app = express()
const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'gsa-coding-challenge.ccr1debqftur.us-east-1.rds.amazonaws.com',
    database: 'postgres',
    password: 'rei12345',
    port: 5432,
});

const host = 'api.sam.gov';
const api_key = '9PdfUrRuXuBUsMK0kgApHBn0tyFAlA2VjcV44rRT';

const port = 3000

app.get('/', async (req, res) => {
  await client.connect();

  await client.query('select * from opportunities limit 1000').then(data => {
    res.send(data);
  });

  await client.end();
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))
