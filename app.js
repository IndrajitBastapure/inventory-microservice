var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var inventory = require('./routes/inventory');
var health = require('./routes/health');
var validate = require('express-jsonschema').validate;
var app = express();

app.use(logger('dev'));
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

// catch 404 and forward to error handler
app.use(function(err, req, res, next) {
	if(err.status == 404){
		res.json({
			"status" : "400",
			"message" : "Not found",
			"data" : {},
			"errors" : err
		});
	}
	next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {	
  app.use(function(err, req, res, next) {
	  if(err.status == 400){
			res.json({
				"status" : "400",
				"message" : "Invalid request",
				"data" : {},
				"errors" : err
			});
		}
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  /*res.render('error', {
    message: err.message,
    error: {}
  });*/
});

module.exports = app;
