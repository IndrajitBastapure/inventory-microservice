"use strict";

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var inventory = require('./routes/inventory');
var logger = require('./routes/logger');
var health = require('./routes/health');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator()); // this line must be immediately after express.bodyParser()!
app.use(cookieParser());
app.use('/inventory', inventory);
app.use('/', health);

//set the server environment
var env = app.get('env') == 'development' ? 'dev' : app.get('env');
var port = process.env.PORT || 8080;

// error handlers
app.use(function(err, req, res, next) {
	
	logger.info(err);
	
	//check bad request error
	if(err.status == 400){
			res.json({
				"status" : "400",
				"message" : "Bad request",
				"errors" : err,
				"data" : []				
			});
		}
	
	//check not found error
	if(err.status == 404){
		res.json({
			"status" : "404",
			"message" : "Not found",
			"errors" : err,
			"data" : []		
		});
	}
});

module.exports = app;
