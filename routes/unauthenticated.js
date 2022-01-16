const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('error', { "error": 'LTI認証エラー'})
})

module.exports = router