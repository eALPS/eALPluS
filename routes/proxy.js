const { createProxyMiddleware } = require('http-proxy-middleware');

var express = require('express');
var router = express.Router();

const url = require("url");

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);



var mongodb = require('../tool/db_connection');
const collection_class = mongodb.collection_class;


var LTIsessionMiddleware = session({
  name: 'lti_v1p3_library',
  secret: 'iualcoelknasfnk',
  saveUninitialized: true,
  resave: true,
  secure: true,
  ephemeral: true,
  httpOnly: true,
  store: new MongoStore({ mongooseConnection: mongodb.connection })
});
router.session = LTIsessionMiddleware;
router.use(LTIsessionMiddleware);



async function proxyDB(s_class,s_id,s_sid,role){
  return new Promise((resolve, reject) => {
    collection_class.find({ class: s_class, tool_id : s_id}, function(err, docs){
      var p_url = "";
      var p_opt = {};
      if(err){
        throw err;
      }
      else{
        if(docs.length){
          if(docs[0].route_mode == "single"){
            var temp_url = url.parse(docs[0].route_url);
            
            p_url = temp_url.protocol + "//" + temp_url.host;

          }
          else if(docs[0].route_mode == "multi"){
            if(docs[0].route_list[s_sid]){
              var temp_url = url.parse(docs[0].route_list[s_sid]);
              p_url = temp_url.protocol + "//" + temp_url.host;
            }
          }
          else if(docs[0].route_mode == "role"){
            if(role != -1){
              var temp_url = url.parse(docs[0].route_list.teacher);
              p_url = temp_url.protocol + "//" + temp_url.host;
            }
            else{
              var temp_url = url.parse(docs[0].route_list.student);
              p_url = temp_url.protocol + "//" + temp_url.host;
            }
          }
          if(docs[0].option){
            if(docs[0].option.pathRewriteStudent){
              p_opt.pathRewriteStudent = docs[0].option.pathRewriteStudent;
            }
            if(docs[0].option.pathRewriteClass){
              p_opt.pathRewriteClass = docs[0].option.pathRewriteClass;
            }
            if(!Object.keys(p_opt).length){
              p_opt = false;
            }
          }
          else{
            p_opt = false;
          }
        }
      }
      resolve({ "url" : p_url, "option" : p_opt });
    });
  });
}


const updateQueryStringParameter = (path, key, value) => {
  const re_n = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  const re_a = new RegExp('([?&])' + key + '(&|$)', 'i');
  const separator = path.indexOf('?') !== -1 ? '&' : '?';
  if (path.match(re_n)) {
    return path.replace(re_n, '$1' + key + '=' + value + '$2');
  } 
  else if (path.match(re_a)){
    return path.replace(re_a, '$1' + key + '=' + value + '$2');
  }
  else {
    return path;
  }
};

const updatePath = (path, keys, value) => {
  var temp_url = path.split("?");
  var path_url = temp_url[0].split("/");
  for(key of keys){
    if(key.length){
      for(let i = 0; i < path_url.length; i++){
        if(path_url[i] == key){
          path_url[i] = value;
        }
      }
    }
  }
  
  temp_url[0] = path_url.join("/");
  return temp_url.join("?");
};


var options = {
  target: 'do-not-use',
  router:async function(req){
    try {
      var par = req.url.slice(1).split('/');
      if(req.headers.upgrade == "websocket"){
        return new Promise((resolve, reject) => {
            router.session(req , {},async() =>{
            var par = req.url.slice(1).split('/');
            if(par[0] !== "connection"){
              par = req.session.decoded_launch.launch_tool_url.slice(1).split('/');
            }
            var role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor');
            var db_result = await proxyDB(req.session.decoded_launch.class_id ,par[2] ,req.session.decoded_launch.student_id,role_check); 
            var result_url = db_result.url;
            if(!result_url.length){
              throw "no_data"
            }
            else{
              req.session.decoded_launch.options = db_result.option;
            }
            resolve(result_url);
          });
        });
      }
      else{
        var role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor');
        var db_result = await proxyDB(req.session.decoded_launch.class_id,par[2],req.session.decoded_launch.student_id,role_check);
        var result_url = db_result.url; 
        req.session.decoded_launch.launch_tool_url = "/connection/" + req.session.decoded_launch.class_id + "/" + par[2];   

        if(!result_url.length){
          throw "no_data"
        }
        else{
          req.session.decoded_launch.options = db_result.option;
        }
        return result_url;    
      }
    }
    catch (e) {
      console.log("proxy_error");
      throw e;
    }
  },
  pathRewrite: function (path, req) {
    var par = req.url.slice(1).split('/');
    return path.replace('/' + par[0] + '/' + par[1] + '/' + par[2], '');

  },
  ws: true,
  secure: false,
  changeOrigin: true,
  xfwd: true,
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['x-added'] = 'foobar';
    
    //const proxyCookie = proxyRes.headers['set-cookie'];
    //if (proxyCookie) {
      //req.session['cookie'] = proxyCookie; 
      //req.session['proxy-cookie']  = proxyCookie;
    //}
  },
  onProxyReq: function(proxyReq, req, res){

    proxyReq.path = updateQueryStringParameter(proxyReq.path, 'ealps_sid', req.session.decoded_launch.student_id);
    proxyReq.path = updateQueryStringParameter(proxyReq.path, 'ealps_cid', req.session.decoded_launch.class_id);
    
    if(req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator') != -1){
      proxyReq.path = updateQueryStringParameter(proxyReq.path, 'ealps_role', "admin");
    }
    else if(req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor') != -1){
      proxyReq.path = updateQueryStringParameter(proxyReq.path, 'ealps_role', "teacher");
    }
    else{
      proxyReq.path = updateQueryStringParameter(proxyReq.path, 'ealps_role', "student");
    }
    
    if(req.session.decoded_launch.options){
      if("pathRewriteStudent" in req.session.decoded_launch.options){
        proxyReq.path = updatePath(proxyReq.path, req.session.decoded_launch.options.pathRewriteStudent, req.session.decoded_launch.student_id);
      }
      if("pathRewriteClass" in req.session.decoded_launch.options){
        proxyReq.path = updatePath(proxyReq.path, req.session.decoded_launch.options.pathRewriteClass, req.session.decoded_launch.class_id);
      }
    }
    //proxyReq.setHeader('HOST', req.originalUrl);
  }
};

const Proxy = createProxyMiddleware(options);

module.exports = Proxy;



