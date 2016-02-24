var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');

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
			"data" : { "inventories" : inventory },
			"errors" : []
		  }
		if (inventory.length >= 1) {	
			result.description = "Returning the inventories";
			result.status = "200";
			res.status(200);
			res.json(result);			
		} else {		  
			result.description = "inventory not found",
			result.status = "404";
			res.status(200);
			res.json(result);			
		}
	  }, function(error) {
			result.status = "500";
			result.description = "Some error occurred";
			result.errors = error;
			res.status(500);
			res.json(result);					
	  });
});

//Get particular inventory based on id 
router.get('/:id', function(req, res){
	var inventory = Inventory.build();
	req.checkParams("id", "Id should be integer number only.").isInt();
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
			"description" : "",			
			"errors" : []
		  };		  
		if (inventory) {
			result.description = "Returning the inventory";
			result.status = "200";
			data[0] = inventory;
			result.data = data;
			res.status(200);
			res.json(result);			
		} else {
			result.description = "inventory not found";
			result.status = "404";
			result.data = data;
			res.status(200);
			res.json(result);			
		}
	  }, function(error) {
			result.status = "500";
			result.data = data;
			result.description = "Some error occurred";
			result.errors = error;
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
		var inventory = Inventory.build({ userId : userId, productId : productId, unitPrice : unitPrice, quantity : quantity });
		inventory.add(function(inventory){		
			res.status(200);
			res.json({ 
					"status" : "200",
					"description " : "inventory created.",
					"errors" : [],
					data : inventory
				});
		},
		function(err) {
			res.status(500);
			res.json({ 
					"status" : "500",
					"description " : "Some error occurred.",
					"errors" : err,
					data : {}
				});
		});
	}
});

//Delete the existing inventory
router.delete('/delete/:id', function(req, res){
	var inventory = Inventory.build();
	req.checkParams("id", "Id should be integer number only.").isInt();
	//console.log(err);
	var errors = req.validationErrors();
	if (errors) {
		res.status(200);
		res.json({
			"status" : "400",
			"description" : "Validation error",			
			"errors" : errors,
			"data" : {}
		  });
	}else{
		inventory.removeById(req.params.id, function(recordsDeleted) {
			var result = {					
					"description" : "",					
					"errors" : [],
					"data" : {
						"recordsDeleted" : recordsDeleted
					}	
				};
				
			if (recordsDeleted) {
				result.description = "inventory removed.";
				result.status = "200";
				res.status(200);
				res.json(result);
			} else {
				result.description = "inventory not found.";
				result.status = "404";
				res.status(200);
				res.json(result);
			}
		  }, function(error) {
			result.description = "Some error occurred.";
			result.status = "500";
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
	//console.log(err);
	var errors = req.validationErrors();
	if (errors) {
		res.status(200);
		res.json({
			"status" : "400",
			"description" : "Validation error",
			"errors" : errors,
			"data" : {}
		  });
	}else{		
		inventory.updateById(req.params.id, function(recordsUpdated) {
			var result = {						
						"description" : "",		
						"data" : {
							"recordsUpdated" : recordsUpdated[0]
						},
						"errors" : []
					}
			console.log(recordsUpdated[0]);
			if (recordsUpdated[0] >= 1) {
			  result.description = "inventory updated.";
			  result.status = "200";
			  res.status(200);
			  res.json(result);
			} else {
			  result.description = "inventory not found";
			  result.status = "404";
			  res.status(200);
			  res.json(result);
			}
		  }, function(error) {
			result.description = "Some error occurred.";
			result.status = "500";
			result.errors = error;
			res.status(500);
			res.json(result);
		  });
	}
});

module.exports = router;