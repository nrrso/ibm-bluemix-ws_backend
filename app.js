/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express 	= ; //
var cfenv		= ; //
var bodyParser	= ;
var watson		= ;
var Step 		= ;
var cors		= ;
var restler		= ;
var cradle		= ;
var excel		= ;

var c = new cradle.Connection();

var db = ;

	// create db if not existing


// create a new express server
var app = ;

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use(cors());

// fetch credentials for a specific service
function getEnv(service, variable) {
	if (process.env["VCAP_SERVICES"] !== undefined) {
		var VCAP_SERVICES = process.env["VCAP_SERVICES"],
        services = JSON.parse(VCAP_SERVICES);

    	return services[service][0].credentials[variable]; // get Bluemix credentials
	}
    return undefined;
}

// add credentials for watson PI
var personalityInsights = watson.personality_insights(// env vars)

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES FOR OUR API
// =============================================================================
var router = ;              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    
    // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:$port/api)
router.get('/', function(req, res) {
    // welcome the user to the api uri

});



// Get Excel File and parse it
// read file in base dir


// more routes for our API will happen here
// 	
// on routes that end in /geocode
// ----------------------------------------------------
router.route('/geocode')

	// get coords (accessed at POST http://localhost:$port/api/geocode)

		// variables

		// retry function, uses setTimeout(fn, time)

		// fn 

	    	// geocode Service Environment Vars
 			
 			// step

	    		// fn 1

		    	// fn 2

		// call to fn

		// return processed array when everything finished


// on routes that end in /near
// ----------------------------------------------------
router.route('/near')

	// get places based on keyword (accessed at POST http://localhost:$port/api/near)

		// variables

		// retry function, uses setTimeout(fn, time)

		// fn 

	    	// maps  Environment Vars
 			
 			// step

	    		// fn 1

		    	// fn 2
		
		// call to fn

		// return processed array when everything finished


// on routes that end in /sendmail
// ----------------------------------------------------
router.route('/sendmail')

	// send a mail (accessed at GET http://localhost:$port/api/sendmail)

		// variable

		// initialize sendgrid Service

		// send mail with sendgrid


// on routes that end in /analyze
// ----------------------------------------------------
router.route('/analyze')

	// create a report (accessed at POST http://localhost:$port/api/reports)

		// variable

		// use pi service


// on routes that end in /reports
// ----------------------------------------------------
router.route('/reports')

    // create a report and save it to mongodb (accessed at POST http://localhost:$port/api/reports)
    // post

    	// variable

    	// use pi service

    		// save to db


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api

// get the app environment from Cloud Foundry
var appEnv = ;

// start server on the specified port and binding host
app.listen(appEnv.port, function() {

	// print a message when the server starts listening
  console.log("\x1b[1;33m", "server starting on " + appEnv.url, "\x1b[0m");
});
