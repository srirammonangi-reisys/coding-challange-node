const pg = require('pg');
const fs = require('fs');
const path = require('path');

const configFilename = 'connect.json';

const connectInfo = JSON.parse(fs.readFileSync(__dirname + path.sep + configFilename));
let pool = null;

if (!pool) {
    pool = new pg.Pool(connectInfo);
    pool.on('error', (err, client) => 
        console.error('db client error', client, err)
    );
}

const endPool = async () => {
    // todo: possibly speed up by checking query status here instead of await each query
    await pool.end().then(() => console.log('db pool ended'));
};

module.exports = {
    pool,
    endPool
};
