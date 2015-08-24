/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express 	= require('express');		// call express
var cfenv		= require('cfenv');			// access to cf env vars
var bodyParser	= require('body-parser');
var watson		= require('watson-developer-cloud');
var jQuery 		= require('jQuery');
var mongoose	= require('mongoose');
mongoose.connect('mongodb://geni:7xrZ4@ds033153.mongolab.com:33153/hskae'); // connect to our database

var Report		= require('./models/report');
// create a new express server
var app = express();

var personalityInsights = watson.personality_insights({ // watson api
	username: '5f7e254b-36bc-462e-aaad-3632fe820a23',
	password: 'wWUvvHwHfZEI',
	version: 'v2'
})

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('༼ つ ◕_◕ ༽つ  Incoming');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:$port/api)
router.get('/', function(req, res) {
    res.json({ message: 'Success! welcome to our api!' });   
});

// more routes for our API will happen here

// on routes that end in /reports
// ----------------------------------------------------
router.route('/reports')

    // create a report (accessed at POST http://localhost:$port/api/reports)
    .post(function(req, res) {
        
        var report = new Report();      // create a new instance of the Report model
        report.name = req.query.name;	// set the bears name (comes from the request)
        report.report = jQuery.ajax({
							url: "/analyze",
							type: 'GET',
							contentType:'application/json',
							data: {
								text: req.query.text
							},
					  		success: function(data) {
							try {
									return JSON.stringify(data);
									console.log(JSON.stringify(data));
								} catch(err) {
									console.log(err);
								}},
							error: function(xhr, textStatus, thrownError) {
								reportError(textStatus);
								console.log("Error1: " + xhr);
								console.log("Error2.2: " + thrownError);
								console.log("Error3: " + textStatus);
							}
						});

        // save the report and check for errors
        report.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Report created!' });
        });   
    })

	// get all the reports (accessed at GET http://localhost:$port/api/reports)
    .get(function(req, res) {
        Report.find(function(err, reports) {
            if (err)
                res.send(err);

            res.json(reports);
        });
    });

// on routes that end in /analyze
// ----------------------------------------------------
router.route('/analyze')

	// create a report (accessed at POST http://localhost:$port/api/reports)
	.get(function(req, res, next) {
		var name = { name: req.query.name };
		var text = { text: req.query.text };

		personalityInsights.profile(text, function(err, profile) {
			if (err)
				return next(err);
			else
				return res.json(profile.tree.children);
		});
	});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, function() {

	// print a message when the server starts listening
  console.log("\x1b[1;33m", "server starting on " + appEnv.url, "\x1b[0m");
});
