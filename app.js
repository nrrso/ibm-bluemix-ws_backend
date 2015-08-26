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
var assert		= require('assert');
var restler		= require('restler');
var mongoose	= require('mongoose');
mongoose.connect('mongodb://geni:7xrZ4@ds033153.mongolab.com:33153/hskae'); // connect to our database

var Report = require('./models/report.js');

// create a new express server
var app = express();

// fetch credentials for a specific service
function getEnv(service, variable) {
	if (process.env["VCAP_SERVICES"] !== undefined) {
		var VCAP_SERVICES = process.env["VCAP_SERVICES"],
        services = JSON.parse(VCAP_SERVICES);

    	return services[service][0].credentials[variable]; // get Bluemix credentials
	}
    return undefined;
}

var personalityInsights = watson.personality_insights({ // watson api
	username: getEnv('personality_insights', 'username') || '6ec2e212-8fe6-4fed-940d-8300ed299ede',
	password: getEnv('personality_insights', 'password') || 'bFBQgLV8gNY4',
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
// 
// on routes that end in /analyze
// ----------------------------------------------------
router.route('/near')

	// create a report (accessed at POST http://localhost:$port/api/reports)
	.get(function(req, res, next) {
		var loc = req.query.location,
			rad = req.query.radius,
			word = req.query.search;

		var apiKey = process.env.GOOGLE_PLACES_API_KEY;
		var out = process.env.GOOGLE_PLACES_OUTPUT_FORMAT;

	    restler.post('https://maps.googleapis.com/maps/api/place/nearbysearch/'+out, {
	    	query: {
	    		location: loc,
	    		radius: rad,
	    		keyword: word,
	    		key: apiKey
	    	}
	    }).on('complete', function(response) {
	    	return res.json(response.results);
	    }).on('error', function(error) {
	    	return res.json('GeoError: '+error);
	    });
	});

// on routes that end in /analyze
// ----------------------------------------------------
router.route('/analyze')

	// create a report (accessed at POST http://localhost:$port/api/reports)
	.get(function(req, res, next) {
		var text = { text: req.query.text };
		
		personalityInsights.profile(text, function(err, profile) {
			if (err) {
				return next(err);
			} else {
				return res.json(profile);
			}
		});

	});

// on routes that end in /reports
// ----------------------------------------------------
router.route('/reports')

    // create a report and save it to mongodb (accessed at POST http://localhost:$port/api/reports)
    .post(function(req, res, next) {
    	var name = req.query.name;

    	personalityInsights.profile({ text: req.query.text }, function(err, profile) {
    		var insight;

			if (err) {
				return next(err);
			} else {
				insight = JSON.stringify(profile.tree.children, null, 2);
			}

			var report = new Report();      // create a new instance of the Report model
	        report.name = name;	// set the bears name (comes from the request)
	        report.report = insight;

	        // save the report and check for errors
	        report.save(function(err) {
	            if (err)
	                res.send(err);

	            res.json({ message: 'Report created!' });
	        });
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
