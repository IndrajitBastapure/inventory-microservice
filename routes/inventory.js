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
config.password, {
	host: process.env.MYSQL_PORT_3306_TCP_ADDR
}
);

//import inventoryDao model
var Inventory = sequelize.import("./inventoryDao");

//To catch the unhandled events
process.on("unhandledRejection", function(reason, promise){
    process.exit();
});

//Get all the inventories
router.get('/', function(req, res){

	//create the instance of inventory to get all the inventories available.
	var inventory = Inventory.build();
	
	//get all inventories
	inventory.retrieveAll(function(inventory) {
	//prepare the response format
		var result = {
			"status" : "",
			"description" : "",
			"errors" : [],
			"data" : { "inventories" : inventory }
		  }
		  
		//return the response based on inventory availability
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
	//create inventory object to get inventory details
	var inventory = Inventory.build();
	
	//check whether id is integer or not
	req.checkParams("id", "Id should be integer number only").isInt();
	
	//get all validation errors
	var errors = req.validationErrors();
	var data = [];
	//prepare the response format
	var result = {		
		"status" : "",
		"description" : "",			
		"errors" : [],
		"data" : data			
	};
		  
	//send all possible validation errors
	if (errors) {
		res.status(200);
		result.status = "400";
		result.description = "Validation error";
		result.errors = errors;
		result.data = data;
		res.json(result);
	}else{
		//retrieve the particular inventory based on id
		inventory.retrieveById(req.params.id, function(inventory) {
		//check inventory is available or not
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
	//get all the post method data
	var userId = req.body.userId; //bodyParser does the magic	
	var productId = req.body.productId;
	var unitPrice = req.body.unitPrice;
	var quantity = req.body.quantity;
	
	// perform all required validations to each request param using express-validator
	req.checkBody('userId', 'invalid user Id').notEmpty().isInt();
	req.checkBody('productId', 'invalid product Id').notEmpty().isInt();	
	req.checkBody('unitPrice', 'invalid unit price').notEmpty().isDecimal();
	req.checkBody('quantity', 'invalid quantity').notEmpty().isInt();
	
	//prepare sample response format
	var result = {		
			"status" : "",
			"description" : "",			
			"errors" : [],
			"data" : []	
		};
	//get all possible validation errors
	var errors = req.validationErrors();
	//send response with all validation errors
	if (errors) {
		res.status(200);
		result.status = "400";
		result.description = "Validation error";
		result.errors = errors;
		res.json(result);
	}else{
	//used async node module to check user and product present or not
		async.parallel([
			function(callback){
				//get all the nodes on which user service is running
				services.getService("USERS-SERVICE", function(err, result){
				//check whether user service is running or not
					if(result.length == 0){
						//send the error as user service is currently down.
						callback(new Error());
					}else{
						//get the first node on which user service is running.
						var node = result[0];
						//prepare the url to get user based on user_id
						var url = "http://"+node.Address+":"+node.ServicePort+"/user/"+userId;			
						//check user with the specified id is present or not
						request.get(url, function(error, response, body) {						
							callback(error, body);
						});
					}
				});
			},
			function(callback){
				//get all the nodes on which products service is running
				services.getService("PRODUCTS-SERVICE", function(err, result){
				//check products user service is running or not
					if(result.length == 0){
					//send the error as products service is currently down.
						callback(new Error());
					}else{
					//get the first node on which products service is running.
						var node = result[0];
						//prepare the url to get product based on product_id
						var url = "http://"+node.Address+":"+node.ServicePort+"/product/"+productId;			
						//check user with the specified id is present or not
						request.get(url, function(error, response, body) {							
							callback(error, body);
						});
					}
				});
			}
		],
		// optional callback
		function(err, results){
		//if something went wrong
			if(err){
					res.status(500);
					result.description = "Internal server error";
					result.status = "500";
					res.json(result);
			}else{
				//get user and product details 
				var userResult = JSON.parse(results[0]);
				var productResult = JSON.parse(results[1]);
				//check whether user is available or not
				if(userResult.status == 404 || userResult.data ==  null){
					res.status(200);
					result.description = "User does not exists. Please enter valid user id.";
					result.status = "404";
					res.json(result);
					//check whether product is available or not
				}else if(productResult.status == 404 || productResult.data ==  null){
					res.status(200);
					result.description = "Product does not exists. Please enter valid Product id.";
					result.status = "404";
					res.json(result);
				}else{
					//as user and product with their specified ids are available we need to insert the inventory
					//create the inventory object with the data got from post method
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
			}
		});
	}
});

//Delete the existing inventory
router.delete('/delete/:id', function(req, res){
	//create the inventory object to delete inventory
	var inventory = Inventory.build();
	//check whether requested id is integer number or not using express-validator
	req.checkParams("id", "Id should be integer number only").isInt();
	//get all validation errors
	var errors = req.validationErrors();
	//prepare the sample response
	var result = {		
					"status" : "",
					"description" : "",				
					"errors" : [],
					"data" : {
						"recordsDeleted" : ""
					}
				};
	//send all validation errors
	if (errors) {
		res.status(200);
		result.status = "400";
		result.description = "Validation error";
		result.errors = errors;
		result.data = [];
		res.json(result);
	}else{
		//remove the inventory based on inventory_id
		inventory.removeById(req.params.id, function(recordsDeleted) {
		//check whether inventory with the specified inventory_id is present or not
			if (recordsDeleted) {
				result.status = "200";
				result.description = "inventory removed";
				result.data.recordsDeleted = recordsDeleted;
				res.status(200);
				res.json(result);
			} else {
				result.status = "404";
				result.description = "inventory not found";
				result.data.recordsDeleted = recordsDeleted;
				res.status(200);
				res.json(result);
			}
		  }, function(error) {
			result.status = "500";
			result.description = "internal server error";	
			result.errors = error;
			result.data = [];
			res.status(500);
			res.json(result);
		  });
	}
});

//Update the inventory
router.put('/update/:id', function(req, res){
	//create the inventory object to update inventory
	var inventory = Inventory.build();
	//get all request data
	inventory.unitPrice = req.body.unitPrice;
	inventory.quantity = req.body.quantity;

	//check where the request data in required format or not using express-validator
	req.checkParams("id", "Id should be integer number only.").isInt();
	req.checkBody('unitPrice', 'unit price is invalid.').notEmpty().isDecimal();
	req.checkBody('quantity', 'quantity is invalid.').notEmpty().isInt();
	//get all validation errors
	var errors = req.validationErrors();
	//prepare the sample response format
	var result = {					
					"status" : "",
					"description" : "",						
					"errors" : [],
					"data" : {
						"recordsUpdated" : ""
					}	
				}
	//send all validation errors
	if (errors) {
		res.status(200);
		result.status = "400";
		result.description = "Validation error";
		result.errors = errors;
		result.data = [];
		res.json(result);
	}else{
		//update the inventory based on inventory_id
		inventory.updateById(req.params.id, function(recordsUpdated) {
			//check whether the inventory with the inventory_id is present or not
			if (recordsUpdated[0] >= 1) {
			  result.status = "200";
			  result.description = "inventory updated";
			  result.data.recordsUpdated = recordsUpdated[0];
			  res.status(200);
			  res.json(result);
			} else {
			  result.status = "404";
			  result.description = "inventory not found";
			  result.data.recordsUpdated = recordsUpdated[0];
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