const express = require('express')

const mongodb = require('../tool/db_connection')
const learningLogger = require('../tool/log').learning
const errorLogger = require('../tool/log').error
const appLogger = require('../tool/log').app

const router = express.Router()
const proxyRouter = require('./proxy')

const url = require("url")

const collection_class = mongodb.collection_class


router.get('/', function(req, res, next) {
    res.redirect(req.baseUrl + "/" + req.session.decoded_launch.class_id + "/")
})


router.use('/:class/:tool/*',  proxyRouter)


router.get('/:class/', function(req, res, next) {

    if(req.params.class == req.session.decoded_launch.class_id){
        collection_class.find({ class: req.params.class }, function(err, docs){
            if(err){
                res.render('error', {"error":"ツールの読み込みに失敗しました"})
            }
            else{
                const role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor')

                if(role_check != -1){
                    res.render('basic', {"LTI":req.session.decoded_launch,"tool_list":docs,"role":"Instructor"})
                }
                else{
                    res.render('basic', {"LTI":req.session.decoded_launch,"tool_list":docs,"role":false})
                }
                learningLogger.info(req.session.decoded_launch.class_id + "-" + req.session.decoded_launch.student_id + " eALPluS/toollist viewed")
            }
        })
    }
    else{
        res.redirect("/connection")
    }
})

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

router.get('/:class/Tool', function(req, res, next) {
    if(req.params.class == req.session.decoded_launch.class_id){
        if(req.query.id){
            const s_id = req.query.id
            const role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor')
            collection_class.find({ class: req.params.class , tool_id : s_id}, function(err, docs){
                if(err){
                    res.render('error', {"error":"ツールの読み込みに失敗しました"})
                }
                else if(docs.length){
                    if(docs[0].route_mode == "single"){
                        try{
                            const t_url = url.parse(docs[0].route_url)
                            req.session.decoded_launch.launch_tool_url = "/connection/" + req.session.decoded_launch.class_id + "/" + s_id
                            const _hash = t_url.hash? t_url.hash : "" 
                            res.render('tool', {"tool_url": "/connection/" + req.params.class + "/" + s_id + t_url.path + _hash , "tool_name": docs[0].tool_name,"origin_host":t_url.host})
                        }
                        catch(e){
                            res.render('error', {"error":"ツールの読み込みに失敗しました"})
                        }     
                    }
                    else if(docs[0].route_mode == "multi"){
                        try{
                            if(docs[0].route_list[req.session.decoded_launch.student_id]){
                                const t_url = url.parse(docs[0].route_list[req.session.decoded_launch.student_id])
                                req.session.decoded_launch.launch_tool_url = "/connection/" + req.session.decoded_launch.class_id + "/" + s_id
                                const _hash = t_url.hash? t_url.hash : ""    
                                res.render('tool', {"tool_url": "/connection/" + req.params.class + "/" + s_id + t_url.path + _hash, "tool_name": docs[0].tool_name,"origin_host":t_url.host})
                            }
                            else{
                                res.render('error', {"error":"ルーティングルールが存在しません"})
                            }
                        }
                        catch(e){
                            res.render('error', {"error":"ツールの読み込みに失敗しました"})
                        }  
                    }
                    else if(docs[0].route_mode == "role"){
                        try{
                            if(docs[0].route_list){
                                if(role_check != -1){
                                    const t_url = url.parse(docs[0].route_list.teacher)
                                    req.session.decoded_launch.launch_tool_url = "/connection/" + req.session.decoded_launch.class_id + "/" + s_id
                                    const _hash = t_url.hash? t_url.hash : "" 
                                    res.render('tool', {"tool_url": "/connection/" + req.params.class + "/" + s_id + t_url.path + _hash, "tool_name": docs[0].tool_name,"origin_host":t_url.host}) 
                                }
                                else{
                                    const t_url = url.parse(docs[0].route_list.student)
                                    req.session.decoded_launch.launch_tool_url = "/connection/" + req.session.decoded_launch.class_id + "/" + s_id
                                    const _hash = t_url.hash? t_url.hash : "" 
                                    res.render('tool', {"tool_url": "/connection/" + req.params.class + "/" + s_id + t_url.path + _hash, "tool_name": docs[0].tool_name,"origin_host":t_url.host})
                                }    
                            }
                            else{
                                res.render('error', {"error":"ルーティングルールが存在しません"})
                            }
                        }
                        catch(e){
                            res.render('error', {"error":"ツールの読み込みに失敗しました"})
                        } 
                    }
                    else if(docs[0].route_mode == "dynamic"){
                        try{
                            try{
                                const t_url = url.parse(docs[0].route_url)
                                req.session.decoded_launch.launch_tool_url = "/connection/" + req.session.decoded_launch.class_id + "/" + s_id 
                                res.render('tool', {"tool_url": "/connection/" + req.params.class + "/" + s_id + "/?ipp_search=true", "tool_name": docs[0].tool_name,"origin_host":t_url.host})
                            }
                            catch(e){
                                res.render('error', {"error":"ツールの読み込みに失敗しました"})
                            }
                        }
                        catch(e){
                            res.render('error', {"error":"ツールの読み込みに失敗しました"})
                        } 
                    }
                }
                else{
                    res.render('error', {"error":"ツールが存在しません"})
                }
            })
        }
        else{
            res.render('error', {"error":"ツールが存在しません"})
        }
    }
    else{
        res.redirect("/connection")
    }
})


router.get('/:class/AddTool', function(req, res, next) {
    if(req.params.class == req.session.decoded_launch.class_id){
        const role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor')

        if(role_check != -1){
            res.render('addtool', {"LTI":req.session.decoded_launch})
        }
        else{
            res.render('error', {"error":"不正なアクセス"})
        }
 
    }
    else{
        res.redirect("/connection")
    }
})


router.post('/:class/AddTool', function(req, res, next){
    if(req.params.class == req.session.decoded_launch.class_id){
        const role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor')

        if(role_check != -1){

            let temp_data = {}

            try{
                temp_data.class = req.params.class
                temp_data.tool_id = req.body.tool_id
                temp_data.tool_name = req.body.tool_name
                temp_data.route_mode = req.body.route_mode
                if(req.body.route_url){
                    temp_data.route_url = req.body.route_url
                }
                else{
                    temp_data.route_list = req.body.route_list
                }
                if(req.body.route_mode == "dynamic"){
                    temp_data.route_list = {"dynamic_list_dummy":"http://127.0.0.1"}
                }
                if(req.body.option){
                    temp_data.option = req.body.option
                }
                temp_data.option["collectionLog"] = {
                    "default":{
                        "launch":true,
                        "access":true,
                        "tab":true,
                        "terminate":true,
                        "key":false,
                        "click":false,
                        "scroll":false,
                        "copy":false,
                        "cut":false,
                        "paste":false
                    },
                    "custom":{}
                }


                const save_class = new collection_class(temp_data)

                save_class.save(err => {
                    if (err){
                        errorLogger.error("[add tool error] " + err)
                    }
                    else{
                        appLogger.info('[eALPluS]' + req.params.class + ' ' + req.body.tool_id + ' added')
                        res.send("Received POST Data!")
                    }
                })
            }
            catch(e){
                errorLogger.error("[add tool error] " + e)
            }
        }
        else{
            res.render('error', {"error":"不正なアクセス"})
        }
    }
})

router.post('/:class/ToolList', function(req, res, next){
    if(req.params.class == req.session.decoded_launch.class_id){
        const role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor')
        if(role_check != -1){
            collection_class.find({ class: req.params.class},['tool_id'], function(err, docs){
                if(err){
                    errorLogger.error("[tool db error] " + err)
                    res.send('db_error')
                }
                else if(docs.length){
                    res.json(docs)
                }
                else{
                    res.send('no_data')
                }
            })
        }
        else{
            res.send('role_error')
        }
    }
    else{
        res.send('class_code_error')
    }
})

router.get('/:class/collectionLog', function(req, res, next){
    if(req.params.class == req.session.decoded_launch.class_id){
        const s_id = req.query.id
        collection_class.find({ class: req.params.class , tool_id : s_id}, function(err, docs){
            if(err){
                errorLogger.error("[tool db error] " + err)
                res.send('db_error')
            }
            else if(docs.length){
                let send_json
                if("collectionLog" in docs[0].option){
                    send_json = docs[0].option["collectionLog"]
                }
                else{
                    send_json = {
                        "default":{
                            "launch":true,
                            "access":true,
                            "tab":true,
                            "terminate":true,
                            "key":false,
                            "click":false,
                            "scroll":false,
                            "copy":false,
                            "cut":false,
                            "paste":false
                        },
                        "custom":{}
                    }
                }
                res.send(send_json)
            }
            else{
                res.send('no_data')
            }
        })
    }
    else{
        res.send('class_code_error')
    }
})

router.get('/:class/EditTool', function(req, res, next){
    if(req.params.class == req.session.decoded_launch.class_id){
        if(req.query.id){
            const s_id = req.query.id
            const role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor')
            if(role_check != -1){

                collection_class.find({ class: req.params.class , tool_id : s_id}, function(err, docs){
                    if(err){
                        res.render('error', {"error":"ツールの読み込みに失敗しました"})
                    }
                    else if(docs.length){
                        try{
                            res.render('edittool', {"LTI":req.session.decoded_launch,"tool": docs[0]})
                        }
                        catch(e){
                            res.render('error', {"error":"ツールの読み込みに失敗しました"})
                        }     
                    }
                    else{
                        res.render('error', {"error":"ツールが存在しません"})
                    }
                })
            }
            else{
                res.render('error', {"error":"不正なアクセス"})
            }
        }
        else{
            res.render('error', {"error":"ツールが存在しません"})
        }
    }
})

router.post('/:class/EditTool', function(req, res, next){
    if(req.params.class == req.session.decoded_launch.class_id){
        const role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor')

        if(role_check != -1){
            let temp_data = {}

            try{
                temp_data.class = req.params.class
                temp_data.tool_id = req.body.tool_id
                temp_data.tool_name = req.body.tool_name
                temp_data.route_mode = req.body.route_mode
                if(req.body.option){
                    temp_data.option = req.body.option
                }
                else{
                    temp_data.option = {}
                }

                if(req.body.route_url){
                    temp_data.route_url = req.body.route_url

                    collection_class.updateOne( { class : req.params.class , tool_id : req.body.tool_id }, 
                    { $set: { tool_name: temp_data.tool_name, route_mode: req.body.route_mode, route_url: temp_data.route_url, option: temp_data.option} },
                    function(err) {
                        if(err){
                            errorLogger.error("[edit tool error] " + err)
                        }
                        else{
                            appLogger.info('[eALPluS]' + req.params.class + ' ' + req.body.tool_id + ' edited')
                            res.send("Received POST Data!")
                        }
                    })
                }
                else{
                    temp_data.route_list = req.body.route_list

                    collection_class.updateOne( { class : req.params.class , tool_id : req.body.tool_id }, 
                    { $set: { tool_name: temp_data.tool_name, route_mode: req.body.route_mode, route_list: temp_data.route_list,option: temp_data.option} },
                    function(err) {
                        if(err){
                            errorLogger.error("[edit tool error] " + err)
                        }
                        else{
                            appLogger.info('[eALPluS]' + req.params.class + ' ' + req.body.tool_id + ' edited')
                            res.send("Received POST Data!")
                        }
                    })
                }
            }
            catch(e){
                errorLogger.error("[edit tool error] " + e)
            }
        }
        else{
            res.render('error', {"error":"不正なアクセス"})
        }

    }
})


router.post('/:class/DeleteTool', function(req, res, next){
    if(req.params.class == req.session.decoded_launch.class_id){
        const role_check = req.session.decoded_launch['https://purl.imsglobal.org/spec/lti/claim/roles'].indexOf('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor')

        if(role_check != -1){
            try{
                collection_class.deleteOne( { class : req.params.class , tool_id : req.body.tool_id }, function(err, result) {
                    if(err){
                        errorLogger.error("[delet tool error] " + err)
                    }
                    else{
                        appLogger.info('[eALPluS]' + req.params.class + ' ' + req.body.tool_id + ' deleted')
                        res.send("Received POST Data!")
                    }
                })   
            }
            catch(e){
                errorLogger.error("[delet tool error] " + e)
            }
        }
        else{
            res.render('error', {"error":"不正なアクセス"})
        }
    }
})


module.exports = router