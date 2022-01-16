const express = require('express')
const router = express.Router()

const url = require("url")


router.get('/*', function(req, res, next) {
    if(req.session.decoded_launch.launch_tool_url){
        const t_url = req.session.decoded_launch.launch_tool_url
        const n_url = url.parse(req.originalUrl)
        res.redirect(t_url + n_url.path)
    }
})


router.post('/*', function(req, res, next) {
    if(req.session.decoded_launch.launch_tool_url){
        const t_url = req.session.decoded_launch.launch_tool_url
        const n_url = url.parse(req.originalUrl)

        res.redirect(307,t_url + n_url.path)
    }
})

router.all('/*', function(req, res, next) {
    if(req.session.decoded_launch.launch_tool_url){
        const t_url = req.session.decoded_launch.launch_tool_url;
        const n_url = url.parse(req.originalUrl)
        res.redirect(t_url + n_url.path)
    }
})

module.exports = router