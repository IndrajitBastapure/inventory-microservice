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
			"status" : "200",
			"description" : "",			
			"data" : { "inventories" : inventory },
			"errors" : []
		  }
		if (inventory) {	
			result.description = "Returning the inventories";
			res.json(result);
		} else {		  
			result.description = "inventory not found",
			res.json(result);
		}
	  }, function(error) {
			result.description = "inventory not found",
			result.errors = error;
			res.json(result);		
	  });
});

//Get particular inventory based on id 
router.get('/:id', function(req, res){
	var inventory = Inventory.build();
	req.checkParams("id", "Id should be integer number only.").isInt();	
	var errors = req.validationErrors();
	if (errors) {		
		res.json({
			"status" : "400",
			"description" : "Validation error",			
			"errors" : errors,
			"data" : {}
		  });
	}else{
		inventory.retrieveById(req.params.id, function(inventory) {
		var result = {
			"status" : "200",
			"description" : "",			
			"errors" : [],
			"data" : inventory
		  };
		if (inventory) {
			result.description = "Returning the inventory";			
			res.json(result);
		} else {
			result.description = "inventory not found",
			res.json(result);
		}
	  }, function(error) {
			result.description = "inventory not found",
			result.errors = error;
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
	req.checkBody('userId', 'user Id should be integer number only').notEmpty().isInt();
	req.checkBody('productId', 'product Id should be integer number only').notEmpty().isInt();
	req.checkBody('unitPrice', 'unit price should be integer number only').notEmpty().isInt();
	req.checkBody('quantity', 'quantity should be integer number only').notEmpty().isInt();
	
	var errors = req.validationErrors();
	if (errors) {		
		res.json({
			"status" : "400",
			"description" : "Validation error",			
			"errors" : errors,
			"data" : {}
		  });
	}else{		
		var inventory = Inventory.build({ userId : userId, productId : productId, unitPrice : unitPrice, quantity : quantity });
		inventory.add(function(inventory){		
			res.json({ 
					"status" : "200",
					"description " : "inventory created.",
					"errors" : [],
					data : inventory
				});
		},
		function(err) {
			res.json({ 
					"status" : "400",
					"description " : "failed to create inventory.",
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
		res.json({
			"status" : "400",
			"description" : "Validation error",			
			"errors" : errors,
			"data" : {}
		  });
	}else{
		inventory.removeById(req.params.id, function(recordsDeleted) {
			var result = {
					"status" : "200",
					"description" : "",					
					"errors" : [],
					"data" : {
						"recordsDeleted" : recordsDeleted
					}	
				};
			if (recordsDeleted) {
				result.description = "inventory removed.";
				res.json(result);
			} else {
				result.description = "inventory not found.";
				res.json(result);
			}
		  }, function(error) {
			result.description = "inventory not found.";
			result.errors = error;
			res.json(result);
		  });
	}
});

//Update the seller
router.put('/update/:id', function(req, res){	
	var inventory = Inventory.build();
	inventory.unitPrice = req.body.unitPrice;
	inventory.quantity = req.body.quantity;
	req.checkParams("id", "Id should be integer number only.").isInt();
	req.checkBody('unitPrice', 'unit price should be integer number only.').notEmpty().isInt();
	req.checkBody('quantity', 'quantity should be integer number only.').notEmpty().isInt();
	//console.log(err);
	var errors = req.validationErrors();
	if (errors) {		
		res.json({
			"status" : "400",
			"description" : "Validation error",		
			"errors" : errors,
			"data" : {}
		  });
	}else{		
		inventory.updateById(req.params.id, function(recordsUpdated) {
			var result = {
						"status" : "200",
						"description" : "",			
						"data" : {
							"recordsUpdated" : recordsUpdated
						},
						"errors" : []
					}		
			if (inventory >= 1) {				
			  result.description = "inventory updated.";
			  res.json(result);
			} else {
			  result.description = "inventory not found";
			  res.json(result);
			}
		  }, function(error) {
			result.description = "inventory not found";
			result.errors = error;
			res.json(result);
		  });
	}
});

module.exports = router;