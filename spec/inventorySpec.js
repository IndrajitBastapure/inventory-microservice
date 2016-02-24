var request = require("request");
var app = require("../app");

var base_url = "http://localhost:3000/inventory/"

describe("inventory test cases", function() {
	var server;
	
	beforeEach(function () {
		server = app.listen(3000, function () {
		console.log('Server Started');
		});
	});
	
	afterEach(function () {
		console.log("Server Stopped");
		server.close();
	});
	
	xdescribe("test cases for retrieving all records", function() {
		
		it("should return status code 200", function(done) {
			request.get(base_url, function(error, response, body) {		
				expect(response.statusCode).toBe(200);
				done();
			});
		});
		
		it("should return all the records present in db", function(done) {
			request.get(base_url, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.data.inventories.length).toBe(2);
				done();
			});
		});
	});
	
	xdescribe("test cases to get particular record", function() {
		
		it('Should return validation error', function testPath(done) {
			request.get(base_url+"k", function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.status).toBe('400');
				done();
			});
		});
	
		it('Should not return any record', function testPath(done) {
			request.get(base_url+"5", function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.data.length).toBe(0);
				done();
			});
		});
			
		it('Should return only matched record', function testPath(done) {
			request.get(base_url+"2", function(error, response, body) {
				body = JSON.parse(response.body);		
				expect(body.data.length).toBe(1);
				done();
			});
		});
	});
	
	xdescribe("test cases to delete particular record", function() {
		
		it('Should return inventory not found', function testPath(done) {		
			request.del(base_url+"delete/7", function(error, response, body) {
				body = JSON.parse(response.body);		
				expect(body.data.recordsDeleted).toBe(0);
				done();
			});
		});
	
		it('Should return validation error', function testPath(done) {		
			request.del(base_url+"delete/7d", function(error, response, body) {
				body = JSON.parse(response.body);						
				expect(body.status).toBe('400');
				done();
			});
		});
		
		it('Should delete particular record only', function testPath(done) {		
			request.del(base_url+"delete/2", function(error, response, body) {
				body = JSON.parse(response.body);						
				expect(body.data.recordsDeleted).toBe(1);
				done();
			});
		});
	});
	
	xdescribe("test cases to create record", function() {
		
		it('Should insert record', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "2",
				"productId" : "2",
				"unitPrice" : "50",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);				
				expect(response.statusCode).toBe(200);
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "2d",
				"productId" : "2",
				"unitPrice" : "50",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);				
				expect(body.status).toBe('400');
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {				
				"productId" : "2",
				"unitPrice" : "50",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);				
				expect(body.status).toBe('400');
				done();
			});
		});
	});
	
	describe("test cases to update record", function() {
		
		xit('Should throw validation error', function testPth(done) {
			request.put({url:base_url+'update/5d', form: {
				"unitPrice" : "50",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.status).toBe('400');
				done();
			});
		});
		
		xit('Should throw validation error', function testPth(done) {
			request.put({url:base_url+'update/5', form: {
				"unitPrice" : "50a",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.status).toBe('400');
				done();
			});
		});
		
		xit('Should return not found', function testPth(done) {
			request.put({url:base_url+'update/6', form: {
				"unitPrice" : "50",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.data.recordsUpdated).toBe(0);
				done();
			});
		});
		
		xit('Should update record', function testPth(done) {
			request.put({url:base_url+'update/4', form: {
				"unitPrice" : "85",
				"quantity" : "18"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.data.recordsUpdated).toBe(1);
				done();
			});
		});
	});
});
