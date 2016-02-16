module.exports = function(sequelize, DataTypes) {
	var seller = sequelize.define('inventory', {		
			userId : {
				type: DataTypes.BIGINT,
				field: 'user_id'
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
			tableName: 'inventory',
			instanceMethods : {
				retrieveAll : function(onSuccess, onError){
					seller.findAll({raw : true}).then(onSuccess).error(onError);
				},
				retrieveById : function(userId, onSuccess, onError){
					seller.find({where : {userId : userId}}, {raw : true}).then(onSuccess).error(onError);
				},
				add : function(onSuccess, onError){	
					var userId = this.userId;				
					var productId = this.productId;
					var unitPrice = this.unitPrice;
					var quantity = this.quantity;
					seller.build( {userId : userId, productId : productId, unitPrice : unitPrice, quantity : quantity}).save().then(onSuccess).error(onError);
				},
				updateById : function(userId, onSuccess, onError){
					var productId = this.productId;
					var unitPrice = this.unitPrice;
					var quantity = this.quantity;
					seller.update({productId : productId, unitPrice : unitPrice, quantity : quantity}, { where : { userId : userId }}).then(onSuccess).error(onError);
				},
				removeById: function(userId, onSuccess, onError) {
					seller.destroy({where: {userId: userId}}).then(onSuccess).error(onError);
				}
			}
		}
	);
	return seller;
}