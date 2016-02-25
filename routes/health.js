var express = require('express');
var router = express.Router();

router.get('/health', function(req, res){
	res.json({
		status: "up"
	});
});

module.exports = router;