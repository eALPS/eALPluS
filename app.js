const express = require("express");
const cors = require('cors');
const morgan = require("morgan");
const path = require('path');
const learningLogger = require('./tool/log').learning
const appLogger = require('./tool/log').app
const errorLogger = require('./tool/log').app
const favicon = require('serve-favicon');

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use("/ealplus-public",express.static(path.join(__dirname, 'public')))
app.use(favicon(__dirname + '/public/images/favicon.ico'))

app.use(cors())
app.use( (req,res,next) => {
  res.locals.formData = null
  next()
})

function sessionCheck(req, res, next) { 
  if (req.session.decoded_launch) {
    if( !req.session.decoded_launch.student_id || !req.session.decoded_launch.class_id){
      if(req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/ext']){
          if(req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/ext'].user_username){
            req.session.decoded_launch.student_id = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/ext'].user_username
          }
          else{
            req.session.decoded_launch.student_id = req.session.decoded_launch.email.split('@')[0]
          }
      }
      else{
        req.session.decoded_launch.student_id = req.session.decoded_launch.email.split('@')[0]
      }
      if(req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid){
        req.session.decoded_launch.class_id = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid
      }
      learningLogger.info(req.session.decoded_launch.class_id + "-" + req.session.decoded_launch.student_id + " eALPluS login")
    }
    if( req.session.decoded_launch.student_id && req.session.decoded_launch.class_id){
      next()
    }
    else{
      res.render('error', {"error":"学籍番号・授業コードが読み取れませんでした"})
    }
  }
  else {
    res.redirect('/unauthenticated')
  }
}

function dynamicRouteCheck(req, res, next){
  if(req.session.decoded_launch.launch_tool_url){
    next()
  }
  else{
    res.redirect('/connection/')
  }
}


const ltiRouter = require('./routes/lti')
const unauthenticatedRouter = require('./routes/unauthenticated')
const connectionRouter = require('./routes/connection')
const ealplusApiRouter = require('./routes/ealplus-api')

app.use("/lti",ltiRouter)

app.use("/unauthenticated",unauthenticatedRouter)

app.session = ltiRouter.session
app.use(app.session)

app.use("/ealplus-api",sessionCheck,ealplusApiRouter)
app.use("/connection",sessionCheck,connectionRouter)

const url_converter = require('./routes/url_converter')
app.use('/*', sessionCheck,dynamicRouteCheck,url_converter)

app.use((err, req, res, next) => {
  res.status(500).send('Internal Server Error\n' + err)
})


module.exports = app