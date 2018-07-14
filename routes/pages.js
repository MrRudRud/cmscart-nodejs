// Plugins
var express = require('express');
var router = express.Router();

// response callback in browser
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Home'
    });
});
router.get('/test', function (req, res) {
    res.send('test');
});

// Export
module.exports = router;