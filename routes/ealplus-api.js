const express = require('express')
const bodyParser = require('body-parser')
const learningLogger = require('../tool/log').learning

var router = express.Router()

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

/* GET home page. */
router.post('/', function(req, res, next) {
  res.status(200).send('ealplus api!')
})

router.post('/tool_launch', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    const log_json = getSendJson(req, "launch")
    learningLogger.info(log_json["cid"] + "-" + log_json["sid"] + " " + log_json["obj"] + " " + (("verb_ex" in log_json)?log_json["verb_ex"]:log_json["verb"]))
    
    res.status(200).send()
  }
  else{
    res.status(201).send()
  }
})

router.post('/tool_active', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    const log_json = getSendJson(req, "active")
    learningLogger.info(log_json["cid"] + "-" + log_json["sid"] + " " + log_json["obj"] + " " + (("verb_ex" in log_json)?log_json["verb_ex"]:log_json["verb"]))

    req.session.decoded_launch["launch_tool_url"] = "/connection/" + req.body.class + "/" + req.body.tool_id
    res.status(200).send()
  }
  else{
    res.status(201).send()
  }
})

router.post('/tool_inactive', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    const log_json = getSendJson(req, "inactive")
    learningLogger.info(log_json["cid"] + "-" + log_json["sid"] + " " + log_json["obj"] + " " + (("verb_ex" in log_json)?log_json["verb_ex"]:log_json["verb"]))

    res.status(200).send()
  }
  else{
    res.status(201).send()
  }
})

router.post('/tool_terminate', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    const log_json = getSendJson(req, "terminate")
    learningLogger.info(log_json["cid"] + "-" + log_json["sid"] + " " + log_json["obj"] + " " + (("verb_ex" in log_json)?log_json["verb_ex"]:log_json["verb"]))

    res.status(200).send()
  }
  else{
    res.status(201).send()
  }
})

router.post('/tool_access', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    const log_json = getSendJson(req, "access")
    learningLogger.info(log_json["cid"] + "-" + log_json["sid"] + " " + log_json["obj"] + " " + (("verb_ex" in log_json)?log_json["verb_ex"]:log_json["verb"]))

    res.status(200).send()
  }
  else{
    res.status(201).send()
  }
})

router.post('/tool_press', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    const log_json = getSendJson(req, "pressed")
    learningLogger.info(log_json["cid"] + "-" + log_json["sid"] + " " + log_json["obj"] + " " + (("verb_ex" in log_json)?log_json["verb_ex"]:log_json["verb"]))

    res.status(200).send()
  }
  else{
    res.status(201).send()
  }
})

router.post('/tool_scroll', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    const log_json = getSendJson(req, "viewed")
    learningLogger.info(log_json["cid"] + "-" + log_json["sid"] + " " + log_json["obj"] + " " + (("verb_ex" in log_json)?log_json["verb_ex"]:log_json["verb"]))

    res.status(200).send()
  }
  else{
    res.status(201).send()
  }
})

router.post('/tool_select', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    const log_json = getSendJson(req, "selected")
    learningLogger.info(log_json["cid"] + "-" + log_json["sid"] + " " + log_json["obj"] + " " + (("verb_ex" in log_json)?log_json["verb_ex"]:log_json["verb"]))

    res.status(200).send()
  }
  else{
    res.status(201).send()
  }
})

router.post('/tool_insert', function(req, res, next) {
  if(req.body.class == req.session.decoded_launch.class_id){
    const log_json = getSendJson(req, "inserted")
    learningLogger.info(log_json["cid"] + "-" + log_json["sid"] + " " + log_json["obj"] + " " + (("verb_ex" in log_json)?log_json["verb_ex"]:log_json["verb"]))

    res.status(200).send()
  }
  else{
    res.status(201).send()
  }
})


function getSendJson(req,verb){
  const result = {
    "cid" : req.body.class,
    "sid" : req.session.decoded_launch.student_id,
    "tid" : req.body.tool_id,
    "verb": verb,
  }
  if(req.body.page){
    result["obj"] = req.body.tool_id + req.body.page
  }
  else{
    result["obj"] = req.body.tool_id
  }

  if(req.body.element){
    result["verb_ex"] = verb + "?target=" + req.body.element.target.value + "&value=" + req.body.value + (typeof req.body.type !== "undefined"? "&type=" + req.body.type: "") + (typeof req.body.position !== "undefined"? "&position=" + req.body.position: "") + "&expansion=" + JSON.stringify(req.body.element)
  }
  
  return result
}



module.exports = router
