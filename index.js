var http = require('http');
var request = require('request');
var fs = require('fs');
var csv = require('csv');
var url = require('url');

// Creating initial variables
var json_request_body = undefined;
var csv_request_body = undefined;
var html_content = undefined;


// --- Remaining To Complete ---
//      1: Move functions to separate file within the folder and link files (.export)
//      2: Still to add a log file in order to keep track of the number of times the data has been accessed


// Function to create a HTML page layout for JSON 
// Data on the Localhost webpage -- Working
function creatHtmlStringFromJson(retrievedData) {

    // Creating the HTML structure for the table layout on the web page
        // var html_string = '<html>\n<header>\n<title>Open Data Colletions - JSON and CSV</title>\n</header>\n<body>\n<table>';
    
    var index_html_body_start = html_content.indexOf('<body>');
    var index_html_body_end = html_content.indexOf('</body>');

    var html_content_before_body = html_content.slice(0, index_html_body_start + 6);
    var html_content_after_body = html_content.slice(index_html_body_end);

    var html_string = '<table>\n';
    html_string += '<tr>\n';
    for (var attribute in retrievedData[0]) {
        if (typeof retrievedData[0][attribute] !== 'object') {
            html_string += '<td>' + attribute + '</td>\n';
        }
    }
    html_string += '</tr>\n';

    retrievedData.forEach(function(object) {
        html_string += '<tr>\n';
        for (var attribute in object) {
            if (typeof object[attribute] !== 'object') {
                html_string += '<td>' + object[attribute] + '</td>\n';
            }
        }
        html_string += '</tr>\n';
    });

    html_string += '</table>';
    return html_content_before_body + html_string + html_content_after_body;
}


// Function to create a HTML page layout for CSV 
// Data on the Localhost webpage -- Working
function creatHtmlStringFromCsv(retrievedData) {

    // Creating the HTML structure for the table layout on the web page
        // var html_string = '<html>\n<header>\n<title>Open Data Colletions - JSON and CSV</title>\n</header>\n<body>\n<table>';

    var index_html_body_start = html_content.indexOf('<body>');
    var index_html_body_end = html_content.indexOf('</body>');

    var html_content_before_body = html_content.slice(0, index_html_body_start + 6);
    var html_content_after_body = html_content.slice(index_html_body_end);

    var html_string = '<table>\n';
    html_string += '<tr>\n';
    retrievedData[0].forEach(function (attribute) {
        html_string += '<td>' + attribute + '</td>\n';
    });
    html_string += '</tr>\n';

    var data = retrievedData.slice(1);
    data.forEach(function(row) {
        html_string += '<tr>\n';
        row.forEach(function (cell) {
            html_string += '<td>' + cell + '</td>\n';
        });
        html_string += '</tr>\n';
    });

    html_string += '</table>';
    return html_content_before_body + html_string + html_content_after_body;
}

// This section of the code is the API calls to the open
// data sets -- Request interval set to two seconds.

// This http request calls JSON data from the url -- JSON parsing of data is syncronous
setInterval(function() {
    request('https://www.bnefoodtrucks.com.au/api/1/trucks', function(error, request_response, body) {
        json_request_body = body;
    });
    console.log("Sending request for JSON data");
}, 2000);


// This http request calls the CSV data from the url -- CSV parsing of data is asynchronous
setInterval(function() {
    request('https://www.spatial-data.brisbane.qld.gov.au/datasets/ef21534102644c1ab9b3f39aad2592cd_0.csv?outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D', function(error, request_response, body) {
        csv.parse(body, function(err, data) {
            csv_request_body = data;
        });
    });
    console.log("Sending request for CSV data");
}, 2000);


// The below code is responsible for creating the localhost server

// Creating the Localhost Server on port 8080 -- Working
http.createServer(function (req, res) {
    if (json_request_body && csv_request_body && html_content){
        res.writeHead(200, {'Content-Type': 'text/html'});

        var request_url = url.parse(req.url);

        // Swtich statement allows the viewing of both data sets(JSON and CSV though changing the url)
        switch (request_url.path) {
            case '/json':
                res.end(creatHtmlStringFromJson(JSON.parse(json_request_body)));
                break;
            case '/csv':
                res.end(creatHtmlStringFromCsv(csv_request_body));
        }
        
    } else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('No data retrieved yet');
    }
}).listen(8080);

fs.readFile('./index.html', function (err, html) {
    if(err) {
        throw err;
    }
    html_content = html;
});




// Other possible data sets url -- 
// http://gis.epa.ie/geoserver/EPA/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EPA:WATER_RIVNETROUTES&maxFeatures=50&outputFormat=application%2Fjson&srsName=EPSG:4326
// https://www.bnefoodtrucks.com.au/api/1/trucks
// https://prodapi.metweb.ie/agriculture/report
// https://www.spatial-data.brisbane.qld.gov.au/datasets/ef21534102644c1ab9b3f39aad2592cd_0.csv?outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D

