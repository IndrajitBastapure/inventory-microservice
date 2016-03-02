var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var async = require('async');
var ServiceProvider = require('./services');
var request = require("request");
var services = new ServiceProvider();

//db config
var env = "dev";
var config = require('../database.json')[env];

//initialize database connection
var sequelize = new Sequelize(config.database, config.username,
config.password
);

//import inventoryDao model
var Inventory = sequelize.import("./inventoryDao");

//To catch the unhandled events
process.on("unhandledRejection", function(reason, promise){
    process.exit();
});

//Get all the inventories
router.get('/', function(req, res){

	var inventory = Inventory.build();
	
	inventory.retrieveAll(function(inventory) {
		var result = {
			"status" : "",
			"description" : "",
			"errors" : [],
			"data" : { "inventories" : inventory }
		  }
		if (inventory.length >= 1) {	
			result.status = "200";
			result.description = "Returning the inventories";			
			res.status(200);
			res.json(result);
		} else {
			result.status = "404";
			result.description = "inventory not found",			
			res.status(200);
			res.json(result);		
		}
	  }, function(error) {
			result.status = "500";
			result.description = "internal server error";			
			result.errors = error;
			res.status(500);
			res.json(result);				
	  });
});

//Get particular inventory based on id 
router.get('/:id', function(req, res){
	var inventory = Inventory.build();
	req.checkParams("id", "Id should be integer number only").isInt();
	var errors = req.validationErrors();
	if (errors) {
		res.status(200);
		res.json({
			"status" : "400",
			"description" : "Validation error",
			"errors" : errors,
			"data" : []
		  });
	}else{
		inventory.retrieveById(req.params.id, function(inventory) {
		var data = [];
		var result = {		
			"status" : "",
			"description" : "",			
			"errors" : [],
			"data" : ""			
		  };
		if (inventory) {
			result.status = "200";
			result.description = "Returning the inventory";			
			data[0] = inventory;
			result.data = data;
			res.status(200);
			res.json(result);
		} else {
			result.status = "404";
			result.description = "inventory not found";
			result.data = data;
			res.status(200);
			res.json(result);
		}
	  }, function(error) {
			result.status = "500";
			result.description = "internal server error";
			result.errors = error;
			result.data = data;
			res.status(500);
			res.json(result);
	  });
	}
});

//Create new inventory
router.post('/create', function(req, res){	
	var userId = req.body.userId; //bodyParser does the magic	
	var productId = req.body.productId;
	var unitPrice = req.body.unitPrice;
	var quantity = req.body.quantity;
	
	// VALIDATION
	req.checkBody('userId', 'invalid user Id').notEmpty().isInt();
	req.checkBody('productId', 'invalid product Id').notEmpty().isInt();	
	req.checkBody('unitPrice', 'invalid unit price').notEmpty().isDecimal();
	req.checkBody('quantity', 'invalid quantity').notEmpty().isInt();
	
	var result = {		
			"status" : "",
			"description" : "",			
			"errors" : [],
			"data" : []	
		  };

	var errors = req.validationErrors();
	if (errors) {
		res.status(200);
		result.status = "400";
		result.description = "Validation error";
		result.errors = errors;
		res.json(result);
	}else{
	
		async.parallel([
			function(callback){
				services.getService("USERS-SERVICE", function(err, result){
					var node = result[0];			
					var url = "http://"+node.Address+":"+node.ServicePort+"/user/"+userId;			
					request.get(url, function(error, response, body) {
						body = JSON.parse(body);
						callback(error, body);
					});				
				});
			},
			function(callback){
				services.getService("PRODUCTS-SERVICE", function(err, result){
					var node = result[0];			
					var url = "http://"+node.Address+":"+node.ServicePort+"/product/"+productId;			
					request.get(url, function(error, response, body) {
						body = JSON.parse(body);
						callback(error, body);
					});
				});
			}
		],
		// optional callback
		function(err, results){
			var userResult = results[0];
			var productResult = results[1];			
			if(userResult.status == 404 || userResult.data ==  null){
				res.status(200);
				result.description = "User does not exists. Please enter valid user id.";
				result.status = "404";
				res.json(result);
			}else if(productResult.status == 404 || productResult.data ==  null){
				res.status(200);
				result.description = "Product does not exists. Please enter valid Product id.";
				result.status = "404";
				res.json(result);
			}else{
				//Actual inventory creation logic
				var inventory = Inventory.build({ userId : userId, productId : productId, unitPrice : unitPrice, quantity : quantity });
				inventory.add(function(inventory){		
					res.status(200);
					result.description = "inventory created";
					result.status = "200";
					result.errors = [];
					result.data = inventory
					res.json(result);
				},
				function(err) {
					res.status(500);
					result.description = "internal server error";
					result.status = "500";
					result.errors = err;
					result.data = []
					res.json(result);
				});
			}
		});
	}
});

//Delete the existing inventory
router.delete('/delete/:id', function(req, res){
	var inventory = Inventory.build();
	req.checkParams("id", "Id should be integer number only").isInt();
	var errors = req.validationErrors();
	if (errors) {
		res.status(200);
		res.json({
			"status" : "400",
			"description" : "Validation error",			
			"errors" : errors,
			"data" : []
		  });
	}else{
		inventory.removeById(req.params.id, function(recordsDeleted) {
			var result = {		
					"status" : "",
					"description" : "",				
					"errors" : [],
					"data" : {
						"recordsDeleted" : recordsDeleted
					}
				};
				
			if (recordsDeleted) {
				result.status = "200";
				result.description = "inventory removed";				
				res.status(200);
				res.json(result);
			} else {
				result.status = "404";
				result.description = "inventory not found";				
				res.status(200);
				res.json(result);
			}
		  }, function(error) {
			result.status = "500";
			result.description = "internal server error";			
			result.errors = error;
			res.status(500);
			res.json(result);
		  });
	}
});

//Update the inventory
router.put('/update/:id', function(req, res){
	var inventory = Inventory.build();
	inventory.unitPrice = req.body.unitPrice;
	inventory.quantity = req.body.quantity;
	req.checkParams("id", "Id should be integer number only.").isInt();
	req.checkBody('unitPrice', 'unit price is invalid.').notEmpty().isDecimal();
	req.checkBody('quantity', 'quantity is invalid.').notEmpty().isInt();
	var errors = req.validationErrors();
	if (errors) {
		res.status(200);
		res.json({
			"status" : "400",
			"description" : "Validation error",
			"errors" : errors,
			"data" : []
		  });
	}else{
		inventory.updateById(req.params.id, function(recordsUpdated) {
			var result = {					
						"status" : "",
						"description" : "",						
						"data" : {
							"recordsUpdated" : recordsUpdated[0]
						},
						"errors" : []
					}
					
			if (recordsUpdated[0] >= 1) {
			  result.status = "200";
			  result.description = "inventory updated";			  
			  res.status(200);
			  res.json(result);
			} else {
			  result.status = "404";
			  result.description = "inventory not found";			  
			  res.status(200);
			  res.json(result);
			}
		  }, function(error) {
			result.status = "500";
			result.description = "internal server error";			
			result.errors = error;
			res.status(500);
			res.json(result);
		  });
	}
});

module.exports = router;