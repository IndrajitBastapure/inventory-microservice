module.exports = function(sequelize, DataTypes) {
	var inventory = sequelize.define('inventory', {		
			userId : {							
				type: DataTypes.BIGINT,
				field: 'user_id',
			},
			productId : {
				type : DataTypes.BIGINT,
				field : 'product_id'
			},
			unitPrice : {
				type : DataTypes.DECIMAL(10, 2),
				field : 'unit_price'
			},
			quantity : {
				type : DataTypes.BIGINT,
				field : 'quantity'
			},
		},{
			
			// don't add the timestamp attributes (updatedAt, createdAt)
			timestamps: false,
			
			// disable the modification of table names; By default, sequelize will automatically
			// transform all passed model names (first parameter of define) into plural.
			// if you don't want that, set the following
			freezeTableName: true,
			
			instanceMethods : {
				retrieveAll : function(onSuccess, onError){
					inventory.findAll({raw : true}).then(onSuccess).error(onError).catch(function(error)
					{onError(error);});
				},
				retrieveById : function(id, onSuccess, onError){
					inventory.find({where : {id : id}}, {raw : true}).then(onSuccess).error(onError).catch(function(error)
					{onError(error);});
				},
				add : function(onSuccess, onError){	
					var userId = this.userId;				
					var productId = this.productId;
					var unitPrice = this.unitPrice;
					var quantity = this.quantity;
					inventory.build( {userId : userId, productId : productId, unitPrice : unitPrice, quantity : quantity}).save().then(onSuccess).error(onError).catch(function(error)
					{onError(error);});
				},
				updateById : function(id, onSuccess, onError){					
					var unitPrice = this.unitPrice;
					var quantity = this.quantity;
					inventory.update({unitPrice : unitPrice, quantity : quantity}, { where : { id : id }}).then(onSuccess).error(onError).catch(function(error)
					{onError(error);});
				},
				removeById: function(id, onSuccess, onError) {
					inventory.destroy({where: {id : id}}).then(onSuccess).error(onError).catch(function(error)
					{onError(error);});
				}
			}
		}
	);
	return inventory;
}

//This will create the table 
/*
User.sync().then(function () {
  // Table created
  return User.create({
    firstName: 'John',
    lastName: 'Hancock'
  });
});
*/

// Sync all models that aren't already in the database
//sequelize.sync();