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
	
	describe("test cases for retrieving all records", function() {
		
		it("should return record not found", function(done) {
			request.get(base_url, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.data.inventories.length).toBe(0);
				expect(body.status).toBe('404');
				expect(body.description).toBe('inventory not found');
				done();
			});
		});
		
		xit("should return all the records present in db", function(done) {
			request.get(base_url, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.data.inventories.length).toBe(7);
				expect(body.status).toBe('200');
				expect(body.description).toBe('Returning the inventories');
				done();
			});
		});
	});
	
	xdescribe("test cases to get particular record", function() {
		
		it('Should return validation error', function testPath(done) {
			request.get(base_url+"k", function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});
	
		it('Should not return any record', function testPath(done) {
			request.get(base_url+"55", function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.data.length).toBe(0);
				expect(body.status).toBe('404');
				expect(body.description).toBe('inventory not found');
				done();
			});
		});
			
		it('Should return only matched record', function testPath(done) {
			request.get(base_url+"1", function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.data.length).toBe(1);
				expect(body.status).toBe('200');
				expect(body.description).toBe('Returning the inventory');
				done();
			});
		});
	});
	
	xdescribe("test cases to delete particular record", function() {
		
		it('Should return inventory not found', function testPath(done) {		
			request.del(base_url+"delete/77", function(error, response, body) {
				body = JSON.parse(response.body);		
				expect(body.data.recordsDeleted).toBe(0);
				expect(body.status).toBe('404');
				expect(body.description).toBe('inventory not found');
				done();
			});
		});
	
		it('Should return validation error', function testPath(done) {		
			request.del(base_url+"delete/7d", function(error, response, body) {
				body = JSON.parse(response.body);						
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should delete particular record only', function testPath(done) {		
			request.del(base_url+"delete/4", function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.data.recordsDeleted).toBe(1);
				expect(body.status).toBe('200');
				expect(body.description).toBe('inventory removed');
				done();
			});
		});
	});
	
	xdescribe("test cases to create record", function() {
		
		it('Should insert record', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "1",
				"productId" : "1",
				"unitPrice" : "50",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);	
				expect(body.status).toBe('200');
				expect(body.description).toBe('inventory created');
				console.log(base_url+"delete/"+body.data.id);
				//Delete the inserted record
				request.del(base_url+"delete/"+body.data.id, function(error, response, body) {					
					body = JSON.parse(response.body);						
					expect(body.data.recordsDeleted).toBe(1);					
					done();
				});			
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
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "2",
				"productId" : "2d",
				"unitPrice" : "87.5",
				"quantity" : "9"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);				
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "2",
				"productId" : "2",
				"unitPrice" : "87.5c",
				"quantity" : "9"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);				
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "2",
				"productId" : "2d",
				"unitPrice" : "87.5",
				"quantity" : "y"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);				
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "1",
				"productId" : "2",
				"unitPrice" : "50",
				"quantity" : "7.5"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				console.log(body.status);
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');				
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "",
				"productId" : "2",
				"unitPrice" : "50",
				"quantity" : "7.5"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				console.log(body.status);
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');				
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "1",
				"productId" : "",
				"unitPrice" : "50",
				"quantity" : "7.5"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				console.log(body.status);
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');				
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "1",
				"productId" : "2",
				"unitPrice" : "",
				"quantity" : "7.5"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				console.log(body.status);
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');				
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "1",
				"productId" : "2",
				"unitPrice" : "50",
				"quantity" : ""
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				console.log(body.status);
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');				
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
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {				
				"userId" : "2",
				"unitPrice" : "50",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);				
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {				
				"userId" : "2",
				"productId" : "2",				
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);				
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.post({url:base_url+'create', form: {				
				"userId" : "2",
				"productId" : "2",
				"unitPrice" : "50"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);				
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});		
		
		it('Should return user not present', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "2",
				"productId" : "2",
				"unitPrice" : "50",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);				
				expect(body.status).toBe('404');
				expect(body.description).toBe('User does not exists. Please enter valid user id.');				
				done();
			});
		});
		
		it('Should return product not present', function testPth(done) {
			request.post({url:base_url+'create', form: {
				"userId" : "1",
				"productId" : "2",
				"unitPrice" : "50",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);			
				expect(body.status).toBe('404');
				expect(body.description).toBe('Product does not exists. Please enter valid Product id.');				
				done();
			});
		});
	});
	
	xdescribe("test cases to update record", function() {
		
		it('Should throw validation error', function testPth(done) {
			request.put({url:base_url+'update/5d', form: {
				"unitPrice" : "50",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.put({url:base_url+'update/5', form: {
				"unitPrice" : "50a",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.put({url:base_url+'update/5', form: {
				"unitPrice" : "50",
				"quantity" : "7.2"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.put({url:base_url+'update/5d', form: {
				"unitPrice" : "",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should throw validation error', function testPth(done) {
			request.put({url:base_url+'update/5d', form: {
				"unitPrice" : "50",
				"quantity" : ""
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.status).toBe('400');
				expect(body.description).toBe('Validation error');
				done();
			});
		});
		
		it('Should return not found', function testPth(done) {
			request.put({url:base_url+'update/66', form: {
				"unitPrice" : "50",
				"quantity" : "7"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.data.recordsUpdated).toBe(0);
				expect(body.status).toBe('404');
				expect(body.description).toBe('inventory not found');
				done();
			});
		});
		
		it('Should update record', function testPth(done) {
			request.put({url:base_url+'update/1', form: {
				"unitPrice" : "85",
				"quantity" : "18"
			}}, function(error, response, body) {
				body = JSON.parse(response.body);
				expect(body.data.recordsUpdated).toBe(1);
				expect(body.status).toBe('200');
				expect(body.description).toBe('inventory updated');
				done();
			});
		});
	});
});
