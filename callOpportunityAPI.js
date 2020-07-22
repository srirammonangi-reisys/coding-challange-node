var querystring = require('querystring');
var https = require('https');
const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'gsa-coding-challenge.ccr1debqftur.us-east-1.rds.amazonaws.com',
    database: 'postgres',
    password: 'rei12345',
    port: 5432,
});

var host = 'api.sam.gov';
var api_key = '9PdfUrRuXuBUsMK0kgApHBn0tyFAlA2VjcV44rRT';
var totalOpps;

client.connect();

function performRequest(endpoint, method, data, success, callback) {
    var dataString = JSON.stringify(data);
    var headers = {};

    if (method == 'GET') {
        endpoint += '?' + querystring.stringify(data);
    }

    var options = {
        host: host,
        path: endpoint,
        method: method,
        headers: headers
    };

    var req = https.request(options, callback);

    req.write(dataString);
    req.end();
}

function getOpportunitiesData(offset) {
    performRequest('/prod/opportunities/v1/search', 'GET', {
        "limit": 1,
        "api_key": api_key,
        "postedFrom": "01/01/2020",
        "postedTo": "12/31/2020",
        "offset": offset
    }, function (data) {
        console.log('Fetched 5 records');
    });
}

function insertToDB(id, data) {
    client.query("INSERT INTO opportunities (opportunity_id, opportunity_data) VALUES ('" + id + "','" + JSON.stringify(data) + "')", (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
    });
}

getOpportunitiesData(0);

function processOppsData(res) {
    return new Promise((resolve, reject) => {
        res.setEncoding('utf-8');
        var responseString = '';
        res.on('data', function (data) {
            responseString += data;
        });
        res.on('end', function () {
            var responseObject = JSON.parse(responseString);
            totalOpps = responseObject.totalRecords;
            console.log(totalOpps);
            for (var i in responseObject.opportunitiesData) {
                var record = responseObject.opportunitiesData[i];
                var noticeId = record.noticeId;
                insertToDB(noticeId, record);
            }
            console.log("Insert Completed");
        });
    });
}

