//Require Standard Modules
const express = require("express");
//const morgan = require("morgan");
const path = require('path');
const logger = require('./tool/log');
const favicon = require('serve-favicon');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(morgan('dev'));
//app.use(express.json());
app.use("/ealplus-public",express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/images/favicon.ico'));
//app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use( (req,res,next) => {
  res.locals.formData = null;
  next();
});

function sessionCheck(req, res, next) {
  if (req.session.decoded_launch) {
    if( !req.session.decoded_launch.student_id || !req.session.decoded_launch.class_id){
      req.session.decoded_launch.student_id = req.session.decoded_launch.email.split('@')[0];
      req.session.decoded_launch.class_id = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid;
      logger.log(req.session.decoded_launch.class_id,req.session.decoded_launch.student_id,"eALPluS","login");
    }

    next();
  } else {
    res.redirect('/unauthenticated');
  }
};



var ltiRouter = require('./routes/lti');
var unauthenticatedRouter = require('./routes/unauthenticated');
var usersRouter = require('./routes/users');
var connectionRouter = require('./routes/connection');
var ealplusApiRouter = require('./routes/ealplus-api');

app.use("/lti",ltiRouter);
app.use("/unauthenticated",unauthenticatedRouter);

app.session = ltiRouter.session;
app.use(app.session);

app.use("/ealplus-api",sessionCheck,ealplusApiRouter);
app.use("/connection",sessionCheck,connectionRouter);
app.use('/user', usersRouter);


var url_converter = require('./routes/url_converter');
app.use('/*', sessionCheck,url_converter);

app.use((err, req, res, next) => {
  res.status(500).send('Internal Server Error\n' + err);
});


module.exports = app;
