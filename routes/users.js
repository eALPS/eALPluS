var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  console.log(req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid);
  res.send(req.session.decoded_launch);
  //res.send(req.session.decoded_launch);
});

module.exports = router;
