"use strict";

var consul = require("consul")();

function ServiceProvider(){
	var self = this;
}

//To get all the nodes on which service is running
ServiceProvider.prototype.getService = function(serviceName, callback){
		consul.catalog.service.nodes(serviceName, function(err, result) {
			callback(err, result);
	});
};

module.exports = ServiceProvider;