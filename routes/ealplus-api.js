var express = require('express');
var bodyParser = require('body-parser');
const logger = require('../tool/log');

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/* GET home page. */
router.post('/', function(req, res, next) {
  res.status(200).send('ealplus api!');
});

router.post('/tool_start', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    logger.log(req.body.class,req.session.decoded_launch.student_id,req.body.tool_id,"launch");
    res.status(200).send();
  }
  else{
    res.status(201).send();
  }
});

router.post('/tool_active', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    req.session.decoded_launch["launch_tool_url"] = "/connection/" + req.body.class + "/" + req.body.tool_id;
    logger.log(req.body.class,req.session.decoded_launch.student_id,req.body.tool_id,"active");
    res.status(200).send();
  }
  else{
    res.status(201).send();
  }
});

router.post('/tool_inactive', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    logger.log(req.body.class,req.session.decoded_launch.student_id,req.body.tool_id,"inactive");
    res.status(200).send();
  }
  else{
    res.status(201).send();
  }
});

router.post('/tool_terminate', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    logger.log(req.body.class,req.session.decoded_launch.student_id,req.body.tool_id,"terminate");
    res.status(200).send();
  }
  else{
    res.status(201).send();
  }
});

router.post('/tool_view_page', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    logger.log(req.body.class,req.session.decoded_launch.student_id,req.body.tool_id,"terminate");
    res.status(200).send();
  }
  else{
    res.status(201).send();
  }
});

module.exports = router;
