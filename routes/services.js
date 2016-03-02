var consul = require("consul")();

function ServiceProvider(){
	var self = this;
//return self;
}

ServiceProvider.prototype.getService = function(serviceName, callback){
		consul.catalog.service.nodes(serviceName, function(err, result) {
			callback(err, result);
	});
}

module.exports = ServiceProvider;