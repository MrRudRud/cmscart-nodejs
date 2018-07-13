// plugins
var express = require('express');
var path = require('path');

// ini app
var app = express();

// View forder angine setup
app.set('views', path.join(__dirname, 'views'));
// Templating engine
app.set('view engine', 'ejs');

// Set Public folder for Static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.send('Working');
});

// Start the server
var port = 3000;
app.listen(port, function() {
    console.log('Server started on port : ' + port);
});