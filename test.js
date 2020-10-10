const express = require('express');

const url = require("url");

const { createProxyMiddleware } = require('http-proxy-middleware');

const options = {
  target: 'https://160.252.131.148:10443',
  changeOrigin: true,
  ws: true,
  secure: false,
  xfwd: true,
  
  pathRewrite: function (path, req) {
    var par = req.url.slice(1).split('/');
    return path.replace('/' + par[0], '');
  },
  onProxyRes: function (proxyRes, req, res) {

    
    const proxyCookie = proxyRes.headers['set-cookie'];
    if (proxyCookie) {
        req.session['cookie'] = proxyCookie; 
        req.session['proxy-cookie']  = proxyCookie;
    }
  },
  onProxyReq: function(proxyReq, req, res){
    if (req.session['proxy-cookie']) {
        proxyReq.setHeader('cookie', req.session['proxy-cookie']);
    }
  }
};

const app = express();

const exampleProxy = createProxyMiddleware(options);




var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var mongodb = require('./tool/db_connection');

app.use(session({
    name: 'lti_v1p3_library',
    secret: 'iualcoelknasfnk',
    saveUninitialized: true,
    resave: true,
    secure: true,
    ephemeral: true,
    httpOnly: true,
    store: new MongoStore({ mongooseConnection: mongodb.connection })
}));

app.use('/proxy/', exampleProxy);

app.get('/*', function(req, res, next) { 
    var n_url = url.parse(req.originalUrl);
    res.redirect('/proxy' + n_url.path);
});


app.post('/*', function(req, res, next) {
    var n_url = url.parse(req.originalUrl);
    console.log(req.headers.upgrade);
    res.redirect(307,'/proxy' + n_url.path);
});

app.listen(3000);