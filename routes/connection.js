var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('../tool/db_connection');

var router = express.Router();
var proxyRouter = require('./proxy');

const url = require("url");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


const collection_class = mongodb.collection_class;


router.get('/', function(req, res, next) {
    if(req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid){
        res.redirect(req.baseUrl + "/" + req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid + "/");
    }
    else{
        res.redirect("/");
    }
});

router.get('/:class/', function(req, res, next) {
    if(req.params.class == req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid){
        collection_class.find({ class: req.params.class }, function(err, docs){
            if(err){
                res.render('error', {"error":"ツールの読み込みに失敗しました"});
            }
            else{
                var role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor');

                if(role_check != -1){
                    res.render('basic', {"LTI":req.session.decoded_launch,"tool_list":docs,"role":"Instructor"});
                }
                else{
                    res.render('basic', {"LTI":req.session.decoded_launch,"tool_list":docs,"role":false});
                }
            }
        });
    }
    else{
        res.redirect("/connection");
    }
});



router.get('/:class/Tool', function(req, res, next) {
    if(req.params.class == req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid){
        if(req.query.id){
            var s_id = req.query.id;
            collection_class.find({ class: req.params.class , tool_id : s_id}, function(err, docs){
                if(err){
                    res.render('error', {"error":"ツールの読み込みに失敗しました"});
                }
                else if(docs.length){
                    var p_url = "";
                    if(docs[0].route_mode == "single"){
                        try{
                            var t_url = url.parse(docs[0].route_url);
                            req.session.decoded_launch.launch_tool_url = "/connection/" + req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid + "/" + s_id;   
                            res.render('tool', {"tool_url": "/connection/" + req.params.class + "/" + s_id + t_url.pathname});
                        }
                        catch(e){
                            res.render('error', {"error":"ツールの読み込みに失敗しました"});
                        }     
                    }
                    else{
                        try{
                            if(docs[0].route_list[req.session.decoded_launch.student_id]){
                                var t_url = url.parse(docs[0].route_list[req.session.decoded_launch.student_id]);
                                req.session.decoded_launch.launch_tool_url = "/connection/" + req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid + "/" + s_id;   
                                res.render('tool', {"tool_url": "/connection/" + req.params.class + "/" + s_id + t_url.pathname});
                            }
                            else{
                                res.render('error', {"error":"ルーティングルールが存在しません"});
                            }
                        }
                        catch(e){
                            res.render('error', {"error":"ツールの読み込みに失敗しました"});
                        }  
                    }
                }
                else{
                    res.render('error', {"error":"ツールが存在しません"});
                }
            });
        }
        else{
            res.render('error', {"error":"ツールが存在しません"});
        }
    }
    else{
        res.redirect("/connection");
    }
});


router.get('/:class/AddTool', function(req, res, next) {
    if(req.params.class == req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid){
        var role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor');

        if(role_check != -1){
            res.render('addtool', {"LTI":req.session.decoded_launch});
        }
        else{
            res.render('error', {"error":"不正なアクセス"});
        }
 
    }
    else{
        res.redirect("/connection");
    }
});


router.post('/:class/AddTool', function(req, res, next){
    if(req.params.class == req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid){

        var role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor');

        if(role_check != -1){

            var temp_data = {};

            try{
                temp_data.class = req.params.class;
                temp_data.tool_id = req.body.tool_id;
                temp_data.tool_name = req.body.tool_name;
                temp_data.route_mode = req.body.route_mode;
                if(req.body.route_url){
                    temp_data.route_url = req.body.route_url;
                }
                else{
                    temp_data.route_list = req.body.route_list;
                }

                var save_class = new collection_class(temp_data);

                save_class.save(err => {
                    if (err){
                        console.log(err);
                    }
                    else{
                        res.send("Received POST Data!");
                    }
                });
            }
            catch(e){
                console.log(e);
            }

        }
        else{
            res.render('error', {"error":"不正なアクセス"});
        }
    }
});

router.get('/:class/EditTool', function(req, res, next){
    if(req.params.class == req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid){
        if(req.query.id){
            var s_id = req.query.id;
            var role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor');
            if(role_check != -1){

                collection_class.find({ class: req.params.class , tool_id : s_id}, function(err, docs){
                    if(err){
                        res.render('error', {"error":"ツールの読み込みに失敗しました"});
                    }
                    else if(docs.length){
                        try{
                            res.render('edittool', {"LTI":req.session.decoded_launch,"tool": docs[0]});
                        }
                        catch(e){
                            res.render('error', {"error":"ツールの読み込みに失敗しました"});
                        }     
                    }
                    else{
                        res.render('error', {"error":"ツールが存在しません"});
                    }
                });

            }
            else{
                res.render('error', {"error":"不正なアクセス"});
            }
        }
        else{
            res.render('error', {"error":"ツールが存在しません"});
        }
    }
});

router.post('/:class/EditTool', function(req, res, next){
    if(req.params.class == req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid){

        var role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor');

        if(role_check != -1){
            var temp_data = {};

            try{
                temp_data.class = req.params.class;
                temp_data.tool_id = req.body.tool_id;
                temp_data.tool_name = req.body.tool_name;
                temp_data.route_mode = req.body.route_mode;
                if(req.body.route_url){
                    temp_data.route_url = req.body.route_url;

                    collection_class.updateOne( { class : req.params.class , tool_id : req.body.tool_id }, 
                    { $set: { tool_name: temp_data.tool_name, route_mode: req.body.route_mode, route_url: temp_data.route_url} },
                    function(err) {
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.send("Received POST Data!");
                        }
                    });
                }
                else{
                    temp_data.route_list = req.body.route_list;

                    collection_class.updateOne( { class : req.params.class , tool_id : req.body.tool_id }, 
                    { $set: { tool_name: temp_data.tool_name, route_mode: req.body.route_mode, route_list: temp_data.route_list} },
                    function(err) {
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.send("Received POST Data!");
                        }
                    });
                }

            }
            catch(e){
                console.log(e);
            }
        }
        else{
            res.render('error', {"error":"不正なアクセス"});
        }

    }
});


router.post('/:class/DeleteTool', function(req, res, next){
    if(req.params.class == req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/lis'].course_section_sourcedid){

        var role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor');

        if(role_check != -1){
            var temp_data = {};

            try{
                collection_class.remove( { class : req.params.class , tool_id : req.body.tool_id }, function(err, result) {
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log('Success: ' + req.params.class + ':' + req.body.tool_id + '  deleted');
                        res.send("Received POST Data!");
                    }
                });   
            }
            catch(e){
                console.log(e);
            }
        }
        else{
            res.render('error', {"error":"不正なアクセス"});
        }

    }
});


router.use('/:class/:port/*', proxyRouter);


module.exports = router;