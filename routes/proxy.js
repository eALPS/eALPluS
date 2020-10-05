var express = require('express');
var router = express.Router();

const url = require("url");

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);


var mongodb = require('../tool/db_connection');
const collection_class = mongodb.collection_class;

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



async function proxyDB(s_class,s_id,s_sid){
  return new Promise((resolve, reject) => {
    collection_class.find({ class: s_class, tool_id : s_id}, function(err, docs){
      var p_url = "";
      if(err){
        throw err;
      }
      else{
        if(docs.length){
          if(docs[0].route_mode == "single"){
            var temp_url = url.parse(docs[0].route_url);
            
            p_url = temp_url.protocol + "//" + temp_url.host;

          }
          else{
            if(docs[0].route_list[s_sid]){
              var temp_url = url.parse(docs[0].route_list[s_sid]);
              p_url = temp_url.protocol + "//" + temp_url.host;
            }
          }
        }
      }
      resolve(p_url);
    });
  });
}


const { createProxyMiddleware } = require('http-proxy-middleware');

var options = {
  target: 'do-not-use',
  router:async function(req){
    try {
      var par = req.url.slice(1).split('/');
      if(req.headers.upgrade == "websocket"){
        return new Promise((resolve, reject) => {
            router.session(req , {},async() =>{
            //console.log(req.session.decoded_launch);
            var par = req.url.slice(1).split('/');
            var result_url = await proxyDB(req.session.decoded_launch.class_id ,par[2] ,req.session.decoded_launch.student_id);   
            if(!result_url.length){
              throw "no_data"
            }
            resolve(result_url);
          });
        });
      }
      else{
        var result_url = await proxyDB(req.session.decoded_launch.class_id,par[2],req.session.decoded_launch.student_id);   
        req.session.decoded_launch.launch_tool_url = "/connection/" + req.session.decoded_launch.class_id + "/" + par[2];   

        if(!result_url.length){
          throw "no_data"
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
  }

};

const Proxy = createProxyMiddleware(options);


module.exports = Proxy;