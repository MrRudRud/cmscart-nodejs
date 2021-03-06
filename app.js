// Plugins
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');

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

// Set global errors variable
app.locals.errors = null;

// Get Page Model 
var Page = require('./models/page');

// Get All pages to pass to header.ejs
Page.find({}).sort({sorting : 1}).exec(function (err, pages) {
    if (err) console.log(err)
    else {
        app.locals.pages = pages;
    }
})

// Express fileUpload middleware
app.use(fileUpload());

// Body Parser Middleware
//
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// parse application/json
app.use(bodyParser.json())

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}))

// Express Validator Middleware
app.use(expressValidator({
    customValidators: {
        isImage:function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch(extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Set routes
var pages = require('./routes/pages.js');
var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/admin/products', adminProducts);
app.use('/admin/categories', adminCategories);
app.use('/admin/pages', adminPages);
app.use('/', pages);

// Start the server
var port = 3000;
app.listen(port, function() {
    console.log('Server started on port : ' + port);
});