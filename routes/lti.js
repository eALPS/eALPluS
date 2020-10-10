var express = require('express');
var router = express.Router();
router.use(express.urlencoded({ extended: true }));

const path = require('path');
const logger = require('../tool/log');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);


const mongodb = require('../tool/db_connection');


const Database = require('../node_modules/lti-node-library/Provider/mongoDB/Database');
const { platformSchema, registerPlatform } = require('../node_modules/lti-node-library/Provider/register_platform');
const { create_oidc_response, create_unique_string } = require("../node_modules/lti-node-library/Provider/oidc");
const { launchTool } = require("../node_modules/lti-node-library/Provider/launch_validation");
const { tokenMaker } = require("../node_modules/lti-node-library/Provider/token_generator");
const { prep_send_score, send_score } = require("../node_modules/lti-node-library/Provider/student_score");
const { grade_project } = require("../tool/grading_tool");



var sessionMiddleware = session({
  name: 'lti_v1p3_library',
  secret: 'iualcoelknasfnk',
  saveUninitialized: true,
  resave: true,
  secure: true,
  ephemeral: true,
  httpOnly: true,
  store: new MongoStore({ mongooseConnection: mongodb.connection })
});
router.session = sessionMiddleware;
router.use(sessionMiddleware);

const lti_config = require('../config/lti_config.json');

registerPlatform(
  lti_config.send_domain,
  lti_config.lms_name,
  lti_config.secret_key,
  lti_config.send_domain + '/mod/lti/auth.php',
  lti_config.send_domain + '/mod/lti/token.php',
  lti_config.receive_domain + '/lti/submit',
  { method: 'JWK_SET', key: lti_config.send_domain + '/mod/lti/certs.php' }
);


router.get('/key/:name', async (req, res) => {
  let publicKey = await Database.GetKey(
    'platforms',
    platformSchema,
    { consumerName: req.params.name }
  );
  res.json({key: publicKey});
});

router.get('/oidc', (req, res) => {
  create_oidc_response(req, res);
});

router.post('/oidc', (req, res) => {
  create_oidc_response(req, res);
});

router.post("/oauth2/token", (req, res) => {
  tokenMaker(req, res);
});

router.post('/auth_code', (req, res) => {
  if (!req.body.error) {
    send_score(req, req.session.grade, 1);
  } else {
    res.status(401).send('Access denied: ' + req.params.error);
  }
});

router.post("/submit", (req, res) => {
  launchTool(req, res, '/connection/');
});


router.post("/grading", (req, res) => {
  grade_project(req)
  .then(grading => {
    if (!grading.error) {
      req.session.grade = grading.grade;
    }
    res.render("submit", {
      payload: req.session.payload, 
      formData: grading
    });
  });
});

router.post("/return", (req, res) => {
  res.redirect(req.session.decoded_launch["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url);
  req.session.destroy();
});

router.get("/return", (req, res) => {
  res.redirect(req.session.decoded_launch["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url);
});

router.get("/logout", (req, res) => {
  logger.log(req.session.decoded_launch.class_id,req.session.decoded_launch.student_id,"eALPluS","logout");
  res.redirect(req.session.decoded_launch["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url);
  req.session.destroy();
});



module.exports = router;