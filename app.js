// Plugins
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');

// Connect to DB
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to mongoDB');
});

// Init app
var app = express();

// View forder angine setup
app.set('views', path.join(__dirname, 'views'));
// Templating engine
app.set('view engine', 'ejs');

// Set Public folder for Static files
app.use(express.static(path.join(__dirname, 'public')));

// to test response callback in browser
app.get('/', function(req, res) {
    res.send('Working');
});

// Start the server
var port = 3000;
app.listen(port, function() {
    console.log('Server started on port : ' + port);
});