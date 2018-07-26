// Plugins
var express = require('express');
var router = express.Router();

// Get Categories Model
var Category = require('../models/categories');

// GET Categories index
router.get('/', function(req, res) {
    Category.find((err, categories) => {
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });
});

// GET add categories
router.get('/add-categories', function(req, res) {
    var title = "";
    // render the view
    res.render('admin/add_categories', {
        title: title,
    });
});

// POST add categories
router.post('/add-categories', function(req, res) {
    // express validation
    req.checkBody('title', 'Title must have a value').notEmpty();

    // take all value from input
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();
    
    if (errors) {
        console.log('errors');
        res.render('admin/add_categories', {
            errors: errors,
            title: title,
        });
    }else {
        Category.findOne({slug: slug}, (err, category) => {
            if(category) {
                req.flash('danger', 'Category found, please create the new one!');
                res.render('admin/add_categories', {
                    errors: errors,
                    title: title,
                });
            } else {
                var categories = new Category({
                    title: title,
                    slug: slug
                });

                categories.save( (err) => {
                    if(err) return console.log(err);
                    req.flash('success', 'Category has been saved!');
                    res.redirect('/admin/categories');
                });
            }
        });

    }
});

// GET edit category
router.get('/edit-category/:id', function (req, res) {
    Category.findById(req.params.id, function (err, category) { 
        if(err) return console.log(err);
        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });
});

// POST Edit category
router.post('/edit-category/:id', function (req, res) {
    // express validation
    req.checkBody('title', 'Title must have a value').notEmpty();

    // take all value from input
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        console.log('errors');
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Category.findOne({slug: slug, _id:{'$ne':id}}, (err, category) => {
            if (category) {
                req.flash('danger', 'Category exists, please create the name');
                res.render('admin/edit_category', {
                    title: title,
                    slug: slug,
                    id: id
                });
            } else {
                Category.findById(id, function(err, category) {
                    if(err) return console.log(err);
                    category.title = title;
                    category.slug = slug;

                    category.save((err) => {
                        if (err) return console.log(err);
                        req.flash('success', 'Category has been edited!');
                        res.redirect('/admin/categories/edit-category/' + id);
                    });
                });
            }
        });
    }
});

// GET Delete Category
router.get('/delete-category/:id', function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (err) {
        if (err) return console.log(err);
        req.flash('success',' Category Deleted');
        res.redirect('/admin/categories/');
    });
});


router.get('/test', function(req, res) {
    res.send('admin test')
})

// Exports
module.exports = router;