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

// POST reaorder pages 
router.post('/reorder-pages', function (req, res) {
    // console.log(req.body);
    var ids = req.body['id[]']; // tidak bisa req.body.id[], karena id[] adalah string
    var count = 0;

    for(i = 0; i < ids.length; i++){
        var id = ids[i];
        count++;

        (function(count) { // Dari Synchronous ke Asynchronous
            Page.findById(id, function (err, page) { // Synchronous
                page.sorting = count;
                page.save((err) => {
                    if (err) return console.log(err);
                });
            });
        })(count);
    }
});

// GET edit page
router.get('/edit-page/:slug', function (req, res) { // slug adalah an arbitrary value
    // res.send('admin test')
    Page.findOne({ slug: req.params.slug }, function (err, page) { //req.params.slug -> get from URL
        if(err) return console.log(err);
        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
});

// POST Edit page
router.post('/add-edit', function (req, res) {
    // express validation
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    // take all value from input
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.body.id;

    var errors = req.validationErrors();

    if (errors) {
        console.log('errors');
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({slug: slug, _id:{'$ne':id}}, (err, page) => {
            if (page) {
                req.flash('danger', 'slug has found, please create the new one!');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                Page.findById(id, function(err, page) {
                    if(err) return console.log(err);
                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save((err) => {
                        if (err) return console.log(err);
                        req.flash('success', 'Document has been saved!');
                        res.redirect('/admin/pages/edit-page/' + page.slug);
                    });

                });
            }
        });

    }
});

// GET Delete page
router.get('/delete-page/:id', function (req, res) {
    Page.findByIdAndRemove(req.params.id, function (err) {
        if (err) return console.log(err);
        req.flash('success','Page Deleted');
        res.redirect('/admin/pages/');
    });
});


router.get('/test', function(req, res) {
    res.send('admin test')
})

// Exports
module.exports = router;