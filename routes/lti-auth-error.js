var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('error', { message: 'LTI認証に失敗しました', error:{status:"auth error",stack:"none"}});
});

module.exports = router;