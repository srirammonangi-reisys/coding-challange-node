const querystring = require('querystring');
const https = require('https');
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

// Starting point
(async function main() {
    const opportunitiesPerPage = 1000; // max allowed 1k, so we need to make multiple calls

    let pageOne = await callOpportunitiesAPI(1, opportunitiesPerPage);
    let totalOpps = pageOne.totalRecords;
    let totalPages = Math.ceil(totalOpps / opportunitiesPerPage);
    let insertedCount = 0;

    await client.connect();

    for (let n = 1; n <= totalPages; ++n) {
        let pageN = await callOpportunitiesAPI(n, opportunitiesPerPage);

        for (let record of pageN.opportunitiesData) {
            await insertToDB(record.noticeId, record);
            insertedCount++;
            if (insertedCount % opportunitiesPerPage === 0) { console.log('inserted', insertedCount); }
        }
    }

    await client.end();
    console.log('Done inserting to DB');
})();

async function insertToDB(id, data) {
    let sql = `INSERT INTO opportunities (opportunity_id, opportunity_data) VALUES ('${id}','${JSON.stringify(data).replace(/\'/g, '')}')`;
    await client.query(sql)
        .catch(e => console.error('DB error', e, data));
}

function callOpportunitiesAPI(page, pageSize) {
    let offset = (page - 1) * pageSize;
    if (page > 1) {
        offset += 1;
    }

    return performRequest('/prod/opportunities/v1/search', 'GET', {
        "limit": pageSize,
        "api_key": api_key,
        "postedFrom": "01/01/2020",
        "postedTo": "12/31/2020",
        "offset": offset
    }, function (data) {
        console.log('Fetched opportunities', data);
    });
}

function performRequest(endpoint, method, data, success, callback) {
    let dataString = JSON.stringify(data);
    let headers = {};

    if (method == 'GET') {
        endpoint += '?' + querystring.stringify(data);
    }

    let options = {
        host: host,
        path: endpoint,
        method: method,
        headers: headers
    };

    return new Promise((resolve, reject) => {
        let req = https.request(options, (res) => {
            let responseString = '';
            res.setEncoding('utf-8');

            res.on('data', function (data) {
                responseString += data;
            });

            res.on('end', function () {
                let responseJson = JSON.parse(responseString);
                resolve(responseJson);
            });
        });

        req.write(dataString);
        req.end();
    });
}
