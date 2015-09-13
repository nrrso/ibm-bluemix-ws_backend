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
var Step 		= require('step');
var cors		= require('cors');
var restler		= require('restler');
var cradle		= require('cradle');
var excel		= require('node-xlsx');

var c = new cradle.Connection('https://ca1238d6-7808-480d-bd8e-aa64222c5a59-bluemix.cloudant.com', 443, {
  auth: { username: 'ca1238d6-7808-480d-bd8e-aa64222c5a59-bluemix', password: 'c5807e9a8b07749a3160beeb5b2e847f9d80f9d7e851e76517bac0464a6c1378' }
});

var db = c.database('reports');

	db.create();

	db.save('_design/reports', {
	      all: {
	          map: function (doc) {
					  emit(doc._id, doc);
					}
	      }
	  });

/*var mongoose	= require('mongoose');
mongoose.connect('mongodb://geni:7xrZ4@ds033153.mongolab.com:33153/hskae'); // connect to our database

var Report = require('./models/report.js');*/

// create a new express server
var app = express();

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


// on routes that end in /near
// ----------------------------------------------------
router.route('/geocode')

	// create a report (accessed at POST http://localhost:$port/api/reports)
	.get(function(req, res, next) {
		var geocodedLocation = {
			address: null,
			city: null,
			state: null,
			zip: null,
			country: null,
			coordinates: []
		}

	    function retry(millis) {
		    console.log('Queing another try');
		    setTimeout(fetchPlaces, millis);
		}

	    function fetchCoords() {
	    	var geocodeService = getEnv('user_provided', 'url') || 'https://pitneybowes.pbondemand.com/location/address/geocode.json';
	    	var appId = getEnv('user_provided', 'appId') || "3cf9cedd-5218-422d-abe6-84e58cf919ef";

	    	Step(
		    	/*function(){
		    		console.log('Fetching geocode Data...');
		    		restler.get(geocodeService, {
				    	query: {
				    		address: req.query.address,
				    		city: req.query.city,
				    		stateProvince: req.query.state,	
				    		postalCode: req.query.zip,
				    		country: req.query.country,
				    		fallbackToPostal: "Y",
				    		fallbackToStreet: "Y",
				    		fallbackToGeographic: "Y",
				    		closeMatchesOnly: "Y",
				    		appId: appId
				    	}
				    }).on('complete', this).on('error', this);
		    	},*/
		    	function(response) {
		    		console.log('Fetching of geocode complete.');
		    		var arrToSend = [
		    			{
							address: 'Schwanthalerstraße 34',
							city: 'München',
							state: 'Bayern',
							zip: '80336',
							country: 'DEU',
							coordinates: ['48.13252', '11.55431']
						},
						{
							address: 'Könneritzstraße 3',
							city: 'Dresden',
							state: 'Sachsen',
							zip: '01067',
							country: 'DEU',
							coordinates: ['51.0579555', '13.7271012']
						}
		    		];
		            ////sif (response) {
		            	
		                res.json(arrToSend);
		            /*} else {
		            	return res.json('Error: Something somewhere went wrong! Check your Input.');
		                retry(5000); // try again after 5 sec
		            }*/
		    	}
		    );
	    }
	    fetchCoords();
	});

// on routes that end in /near
// ----------------------------------------------------
router.route('/near')

	// create a report (accessed at POST http://localhost:$port/api/reports)
	.get(function(req, res, next) {
		var loc = req.query.location,
			rad = req.query.radius,
			word = req.query.search;

		var apiKey = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyDzwz2IaVTFxIU1JeonhspuzsqkXu0ehIg';
		var out = process.env.GOOGLE_PLACES_OUTPUT_FORMAT || 'json';

	    function retry(millis) {
		    console.log('Queing another try');
		    setTimeout(fetchPlaces, millis);
		}

	    function fetchPlaces() {
	    	Step(
		    	function(){
		    		console.log('Fetching Maps Data...');
		    		restler.get('https://maps.googleapis.com/maps/api/place/nearbysearch/'+out, {
				    	query: {
				    		location: loc,
				    		radius: rad,
				    		keyword: word,
				    		key: apiKey
				    	}
				    }).on('complete', this).on('error', this);
		    	},
		    	function(response) {
		    		console.log('Fetching Data complete.');
		            if (response.status !== 'OK') {
		                return res.json('Error: ' + response.status);
		                retry(5000); // try again after 5 sec
		            } else {
		                res.json(response.results);
		            }
		    	}
		    );
	    }
	    fetchPlaces();
	});

// on routes that end in /sendmail
// ----------------------------------------------------
router.route('/sendmail')

	// send a mail (accessed at GET http://localhost:$port/api/sendmail)
	.get(function(req, res, next) {
		var api_user = req.query.u,
			api_password = req.query.p;

		var sendgrid  = require('sendgrid')(api_user, api_password);

		sendgrid.send({
		  to:       req.query.to,
		  from:     req.query.from,
		  subject:  req.query.subject,
		  text:     req.query.text
		}, function(err, json) {
		  if (err) { return next(err); }
		  return res.json(json);
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
				return next(JSON.stringify(err, null, 4));
			} else {
				return res.json(profile.tree.children);
			}
		});

	});

// on routes that end in /reports
// ----------------------------------------------------
router.route('/reports')

    // create a report and save it to mongodb (accessed at POST http://localhost:$port/api/reports)
    .post(function(req, res, next) {
    	var _res = res;
    	var name = req.query.name;

    	personalityInsights.profile({ text: req.query.text }, function(err, profile) {
    		var insight;

			if (err) {
				return next(JSON.stringify(err, null, 4));
			} else {
				insight = JSON.stringify(profile.tree.children, null, 2);
			}

			db.save(name, {
			      report: insight,
			      type: 'report'
			  }, function (err, res) {
			      // Handle response
			      if (err)
	                _res.send(err);

	            _res.json({ message: 'Report created!' });
			});
		});
    });

// route for read file

router.route('/file')
	.get(function(){
		//read file in base dir
		var file = excel.parse(__dirname + '/test.xls');
		//read sheet based on array key
		var sheet0 = file[0];
		//read data of sheet
		var data = sheet0.data;
		//loop except of key 0 -> header information
		var addresses = new Array();
		for (var i = 1; i <= 5 ; i++) {
			var address = data[i];
			var currentAddress = {
				location: address[1],
				plz: address[0],
				street: address[2],
				name: address[3],
				lastChange: address[4],
				phone: address[7],
				mail: address[9],
				arbr: address[20],
				ebrr: address[21],
				famr: address[22],
				medizinr: address[23],
				mietr: address[24],
				strafr: address[26],
				verkr: address[27]
			};

			//save to return param
			addresses.push(currentAddress);
			
		};
		//return is array with objects
		return addresses;
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
