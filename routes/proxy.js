const { createProxyMiddleware } = require('http-proxy-middleware')

const express = require('express')
const router = express.Router()

const url = require("url")
const request = require('request')

const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const mongodb = require('../tool/db_connection')

const collection_class = mongodb.collection_class

const appLogger = require('../tool/log').app
const errorLogger = require('../tool/log').error

const LTIsessionMiddleware = session({
  name: 'lti_v1p3_library',
  secret: 'iualcoelknasfnk',
  saveUninitialized: true,
  resave: true,
  secure: true,
  ephemeral: true,
  httpOnly: true,
  store: new MongoStore({ mongooseConnection: mongodb.connection })
})
router.session = LTIsessionMiddleware
router.use(LTIsessionMiddleware)



async function proxyAPI(s_class,s_id,s_sid,role,s_url,opt){

  return new Promise((resolve, reject) => {
    s_url = updateQueryStringParameter(s_url, 'ealps_sid', s_sid)
    s_url = updateQueryStringParameter(s_url, 'ealps_cid', s_class)

    if(role != -1){
      s_url = updateQueryStringParameter(s_url, 'ealps_role', "teacher")
    }
    else{
      s_url = updateQueryStringParameter(s_url, 'ealps_role', "student")
    }

    if(opt){
      if("pathRewriteStudent" in opt){
        s_url = updatePath(s_url, opt.pathRewriteStudent, s_sid)
      }
      if("pathRewriteClass" in opt){
        s_url = updatePath(s_url, opt.pathRewriteClass, s_class)
      }
    }

    request.get({
      uri: s_url
    }, 
    function(err, req, data){
      if(!err){
        const IpPort = JSON.parse(data)
        if("ip" in IpPort && "port" in IpPort){
          collection_class.find({ class: s_class, tool_id : s_id}, function(err, docs){
            docs[0].route_list[s_sid] = "http://" + IpPort.ip + ":" + IpPort.port
            collection_class.updateOne( { class : s_class , tool_id : s_id }, 
              { $set: { route_list: docs[0].route_list} },
                function(err) {
                  if(err){
                    errorLogger.error("[proxy db error] " + err)
                  }
                  resolve({ "url" : "http://" + IpPort.ip + ":" + IpPort.port, "option" : opt })
                }
            )
          })
        }
        else{
          resolve({ "err" : data })
        }
      }
      else{
        errorLogger.error("[proxy api error] " + err)
        throw err
      }
    })
  })
}



async function proxyDB(s_class,s_id,s_sid,role){
  return new Promise((resolve, reject) => {
    collection_class.find({ class: s_class, tool_id : s_id}, function(err, docs){
      let p_url = ""
      let d_url = ""
      let p_opt = {}
      if(err){
        errorLogger.error("[proxy db error] " + err)
        throw err
      }
      else{
        if(docs.length){
          
          if(docs[0].route_mode == "single"){
            const temp_url = url.parse(docs[0].route_url)    
            p_url = temp_url.protocol + "//" + temp_url.host
          }
          else if(docs[0].route_mode == "multi"){
            if(docs[0].route_list[s_sid]){
              const temp_url = url.parse(docs[0].route_list[s_sid])
              p_url = temp_url.protocol + "//" + temp_url.host
            }
          }
          else if(docs[0].route_mode == "role"){
            if(role != -1){
              const temp_url = url.parse(docs[0].route_list.teacher)
              p_url = temp_url.protocol + "//" + temp_url.host
            }
            else{
              const temp_url = url.parse(docs[0].route_list.student)
              p_url = temp_url.protocol + "//" + temp_url.host
            }
          }
          if(docs[0].option){
            if(docs[0].option.pathRewriteStudent){
              p_opt.pathRewriteStudent = docs[0].option.pathRewriteStudent
            }
            if(docs[0].option.pathRewriteClass){
              p_opt.pathRewriteClass = docs[0].option.pathRewriteClass
            }
            if(docs[0].option.reqheader){
              p_opt.reqheader = docs[0].option.reqheader
            }
            if(docs[0].option.resheader){
              p_opt.resheader = docs[0].option.resheader
            }
            if(!Object.keys(p_opt).length){
              p_opt = false
            }
          }
          else{
            p_opt = false
          }
          if(docs[0].route_mode == "dynamic"){  
            p_url = docs[0].route_url
            if(docs[0].route_list[s_sid] !== undefined){
              d_url = docs[0].route_list[s_sid]
            }
            resolve({ "url" : p_url, "durl" : d_url, "option" : p_opt, "dynamic" : true})
          }
        }
      }
      resolve({ "url" : p_url, "option" : p_opt })
    })
  })
}


const updateQueryStringParameter = (path, key, value) => {
  const re_n = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
  const re_a = new RegExp('([?&])' + key + '(&|$)', 'i')
  const separator = path.indexOf('?') !== -1 ? '&' : '?'
  if (path.match(re_n)) {
    return path.replace(re_n, '$1' + key + '=' + value + '$2')
  } 
  else if (path.match(re_a)){
    return path.replace(re_a, '$1' + key + '=' + value + '$2')
  }
  else {
    return path
  }
}

const updatePath = (path, keys, value) => {
  let temp_url = path.split("?")
  let path_url = temp_url[0].split("/")
  for(key of keys){
    if(key.length){
      for(let i = 0; i < path_url.length; i++){
        if(path_url[i] == key){
          path_url[i] = value
        }
      }
    }
  }
  
  temp_url[0] = path_url.join("/")
  return temp_url.join("?")
}

function updateHeader(target,req,res,hedaers){
  const regex_remote_addr = /\$remote_addr/i
  const regex_host = /\$host/i

  for(const _hedaer in hedaers){
    hedaers[_hedaer] = hedaers[_hedaer].replace(regex_remote_addr, req.connection.remoteAddress)
    hedaers[_hedaer] = hedaers[_hedaer].replace(regex_host, req.headers['host'])

    target.setHeader(_hedaer,hedaers[_hedaer])
  }
  return target
}


const options = {
  target: 'do-not-use',
  router:async function(req){
    try {
      if(req.headers.upgrade == "websocket"){
        return new Promise((resolve, reject) => {
            router.session(req , {},async() =>{
            let par = req.url.slice(1).split('/')
            if(par[0] !== "connection"){
              par = req.session.decoded_launch.launch_tool_url.slice(1).split('/').concat(par)
              req.url = "/" + par.join("/")
            }
            const role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor')
            let db_result = await proxyDB(req.session.decoded_launch.class_id ,par[2] ,req.session.decoded_launch.student_id,role_check)
            if("dynamic" in db_result){
              if(!db_result.durl.length){
                db_result = await proxyAPI(req.session.decoded_launch.class_id ,par[2] ,req.session.decoded_launch.student_id,role_check,db_result.url,db_result.option)
              }
              else{
                db_result.url = db_result.durl
              }
              if("err" in db_result){
                errorLogger.error("[proxy init error] " + db_result.err)
                throw db_result.err
              }
            }
            const result_url = db_result.url
            if(!result_url.length){
              errorLogger.error("[proxy init error] no_data")
              throw "no_data"
            }
            else{
              req.session.decoded_launch.options = db_result.option
            }
            resolve(result_url)
          })
        })
      }
      else{
        const par = req.url.slice(1).split('/')
        const role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor')
        let db_result = await proxyDB(req.session.decoded_launch.class_id,par[2],req.session.decoded_launch.student_id,role_check)
        if("dynamic" in db_result){
          if( "ipp_search" in req.query){
            db_result = await proxyAPI(req.session.decoded_launch.class_id ,par[2] ,req.session.decoded_launch.student_id,role_check,db_result.url,db_result.option)
          }
          else if(!db_result.durl.length){
            db_result = await proxyAPI(req.session.decoded_launch.class_id ,par[2] ,req.session.decoded_launch.student_id,role_check,db_result.url,db_result.option)
          }
          else{
            db_result.url = db_result.durl
          }
          if("err" in db_result){
            errorLogger.error("[proxy init error] " + db_result.err)
            throw db_result.err
          }
        }
        const result_url = db_result.url
        req.session.decoded_launch.launch_tool_url = "/connection/" + req.session.decoded_launch.class_id + "/" + par[2]

        if(!result_url.length){
          errorLogger.error("[proxy init error] no_data")
          throw "no_data"
        }
        else{
          req.session.decoded_launch.origin = result_url
          req.session.decoded_launch.options = db_result.option
        }
        return result_url
      }
    }
    catch (e) {
      errorLogger.error("[proxy init error] " + e)
      throw e
    }
  },
  pathRewrite: function (path, req) {
    let par = req.url.slice(1).split('/')
    
    if(par[0] !== "connection"){
      par = req.session.decoded_launch.launch_tool_url.slice(1).split('/')
    }
    return path.replace('/' + par[0] + '/' + par[1] + '/' + par[2], '')
  },
  ws: true,
  secure: false,
  changeOrigin: true,
  xfwd: true,
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = "https://" + req.headers.host
    proxyRes.headers['Access-Control-Allow-Methods'] = "POST, GET, OPTIONS"
    proxyRes.headers['Access-Control-Allow-Credentials'] = true
    proxyRes.headers['X-Frame-Options'] = "ALLOW"
    proxyRes.headers['Content-Security-Policy'] = "frame-ancestors 'self'"
    
    if(proxyRes.statusCode >= 300 && proxyRes.statusCode < 400){     
      if(proxyRes.headers.location){
        proxyRes.headers.location = proxyRes.headers.location.replace(req.session.decoded_launch.origin,"https://" + req.headers.host + req.session.decoded_launch.launch_tool_url)
      }
    }
    if(req.session.decoded_launch.options){
      if("resheader" in req.session.decoded_launch.options){
        proxyRes = updateHeader(res,req,proxyRes,req.session.decoded_launch.options.resheader)
      }
    }
  },
  onProxyReq: function(proxyReq, req, res){
    proxyReq.path = updateQueryStringParameter(proxyReq.path, 'ealps_sid', req.session.decoded_launch.student_id)
    proxyReq.path = updateQueryStringParameter(proxyReq.path, 'ealps_cid', req.session.decoded_launch.class_id)

    if(req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator') != -1){
      proxyReq.path = updateQueryStringParameter(proxyReq.path, 'ealps_role', "admin")
    }
    else if(req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor') != -1){
      proxyReq.path = updateQueryStringParameter(proxyReq.path, 'ealps_role', "teacher")
    }
    else{
      proxyReq.path = updateQueryStringParameter(proxyReq.path, 'ealps_role', "student")
    }

    proxyReq.setHeader('X-Forwarded-host',proxyReq.host)

    if(req.session.decoded_launch.options){
      if("pathRewriteStudent" in req.session.decoded_launch.options){
        proxyReq.path = updatePath(proxyReq.path, req.session.decoded_launch.options.pathRewriteStudent, req.session.decoded_launch.student_id)
      }
      if("pathRewriteClass" in req.session.decoded_launch.options){
        proxyReq.path = updatePath(proxyReq.path, req.session.decoded_launch.options.pathRewriteClass, req.session.decoded_launch.class_id)
      }    
      if("reqheader" in req.session.decoded_launch.options){
        proxyReq = updateHeader(proxyReq,req,res,req.session.decoded_launch.options.reqheader)
      }
    }

    //proxyReq.setHeader('Origin',proxyReq.protocol + "//" + proxyReq.host)
    //proxyReq.setHeader('x-origin',proxyReq.protocol + "//" + proxyReq.host)
  },
  onProxyReqWs: function(proxyReq, req, res){
    if(req.session.decoded_launch.options){
      if("reqheader" in req.session.decoded_launch.options){
        proxyReq = updateHeader(proxyReq,req,res,req.session.decoded_launch.options.reqheader)
      }
    }
  },
  onProxyResWs: function(proxyRes, req, res){
    if(req.session.decoded_launch.options){
      if("reqheader" in req.session.decoded_launch.options){
        proxyRes = updateHeader(proxyRes,req,res,req.session.decoded_launch.options.reqheader)
      }
    }
  },
  onError:function(err, req, res, target){
    errorLogger.error("[proxy try error] " + err)
  },
  logProvider: function (provider) {
    provider.log = function (message) {
      appLogger.log(message)
    }
    provider.debug = function (message) {
      appLogger.debug(message)
    }
    provider.info = function (message) {
      appLogger.info(message)
    }
    provider.warn = function (message) {
      errorLogger.warn(message)
    }
    provider.error = function (message) {
      errorLogger.error(message)
    }
    return provider
  }
}

const Proxy = createProxyMiddleware(options)

module.exports = Proxy



