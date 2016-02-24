var express = require('express');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var inventory = require('./routes/inventory');
var logger = require('./routes/logger');
var validate = require('express-jsonschema').validate;
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator()); // this line must be immediately after express.bodyParser()!
app.use(cookieParser());
app.use('/inventory', inventory);

//set the server environment
var env = app.get('env') == 'development' ? 'dev' : app.get('env');
console.log(app.get('env'));
var port = process.env.PORT || 8080;

// error handlers
app.use(function(err, req, res, next) {
	
	logger.info(res);
	
	if(err.status == 400){
			res.json({
				"status" : "400",
				"message" : "Bad request",
				"data" : {},
				"errors" : err
			});
		}
	if(err.status == 404){
		res.json({
			"status" : "400",
			"message" : "Not found",
			"data" : {},
			"errors" : err
		});		
	}	
});

module.exports = app;
