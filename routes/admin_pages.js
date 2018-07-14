// Plugins
var express = require('express');
var router = express.Router();

// response callback in browser
router.get('/', function(req, res) {
    res.send('admin pages baru')
});

router.get('/test', function(req, res) {
    res.send('admin test')
})

// Exports
module.exports = router;