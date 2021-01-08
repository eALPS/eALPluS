const express = require("express");
const morgan = require("morgan");
const path = require('path');
const logger = require('./tool/log');
const favicon = require('serve-favicon');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(morgan('dev'));
//app.use(express.json());
app.use("/ealplus-public",express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/images/favicon.ico'));
//app.use(express.text());
//app.use(express.urlencoded({ extended: true }));

app.use( (req,res,next) => {
  res.locals.formData = null;
  next();
});


function sessionCheck(req, res, next) {
  if (req.session.decoded_launch) {
    if( !req.session.decoded_launch.student_id || !req.session.decoded_launch.class_id){
        if(req.session.decoded_launch.class_id = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/ext']){
            if(req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/ext'].user_username){
                req.session.decoded_launch.student_id = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/ext'].user_username
            }
            else{
                req.session.decoded_launch.student_id = req.session.decoded_launch.email.split('@')[0];
            }
        }
        else{
            req.session.decoded_launch.student_id = req.session.decoded_launch.email.split('@')[0];
        }
        req.session.decoded_launch.class_id = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid;
        logger.log(req.session.decoded_launch.class_id,req.session.decoded_launch.student_id,"eALPluS","login");
    }

    next();
  } else {
    console.log("ya");
    res.redirect('/unauthenticated');
  }
};

function dynamicRouteCheck(req, res, next){
    if(req.session.decoded_launch.launch_tool_url){
        next();
    }
    else{
        res.redirect('/connection/');
    }
}


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
app.use('/*', sessionCheck,dynamicRouteCheck,url_converter);

app.use((err, req, res, next) => {
  res.status(500).send('Internal Server Error\n' + err);
});


module.exports = app;