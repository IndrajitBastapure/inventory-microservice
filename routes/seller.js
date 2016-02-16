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

var Seller = sequelize.import("./sellerDao");

//Get all the seller
router.get('/', function(req, res){
	console.log("inside getAll method");
	var seller = Seller.build();
	
	seller.retrieveAll(function(seller) {
		if (seller) {				
		  res.json(seller);
		} else {
		  res.send(401, "seller not found");
		}
	  }, function(error) {
		res.send("seller not found");
	  });
});

//Get particular seller
router.get('/:user_id', function(req, res){
	console.log("inside retrieveById method");
	var seller = Seller.build();
	
	seller.retrieveById(req.params.user_id, function(seller) {
		if (seller) {				
		  res.json(seller);
		} else {
		  res.send(401, "seller not found");
		}
	  }, function(error) {
		res.send("seller not found");
	  });
});

//Create new seller
router.post('/create', function(req, res){
	console.log("inside create method");
	var userId = req.body.userId; //bodyParser does the magic	
	var productId = req.body.productId;
	var unitPrice = req.body.unitPrice;
	var quantity = req.body.quantity;
	
	var seller = Seller.build({ userId : userId, productId : productId, unitPrice : unitPrice, quantity : quantity });

	seller.add(function(success){
		res.json({ message: 'seller created!' });
	},
	function(err) {
		res.send(err);
	});
});

//Delete the existing seller
router.delete('/delete/:user_id', function(req, res){
	var seller = Seller.build();
	seller.removeById(req.params.user_id, function(seller) {
		if (seller) {				
		  res.json({ message: 'seller removed!' });
		} else {
		  res.send(401, "seller not found");
		}
	  }, function(error) {
		res.send("seller not found");
	  });
});

//Update the seller
router.put('/update/:user_id', function(req, res){
	var seller = Seller.build();	
	seller.productId = req.body.productId;
	seller.unitPrice = req.body.unitPrice;
	seller.quantity = req.body.quantity;
	seller.updateById(req.params.user_id, function(seller) {
		if (seller) {				
		  res.json({ message: 'seller updated!' });
		} else {
		  res.send(401, "seller not found");
		}
	  }, function(error) {
		res.send("seller not found");
	  });
});

module.exports = router;