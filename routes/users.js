var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send(req.session);
  //res.send(req.session.decoded_launch);
});

module.exports = router;
