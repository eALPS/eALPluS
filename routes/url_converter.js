var express = require('express');
var router = express.Router();

const url = require("url");

/* GET home page. */
router.get('/*', function(req, res, next) {
    if(req.session.decoded_launch.launch_tool_url){
        var t_url = req.session.decoded_launch.launch_tool_url;
        var n_url = url.parse(req.originalUrl);

        res.redirect(t_url + n_url.path);
    }

});

module.exports = router;