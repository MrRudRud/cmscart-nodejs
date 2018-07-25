// Plugins
var express = require('express');
var router = express.Router();

// Get Page Model
var Page = require('../models/page');

// GET pages index
router.get('/', function(req, res) {
    // page.find({}) => find everything on collection MongoDB
    // sort({sorting: 1}) => sorting secara Ascending
    // exec to execute callback
    Page.find({}).sort({sorting: 1}).exec( function(err, pages) {
        res.render('admin/pages', {
            pages: pages
        });
        // res.send(pages);
    });
});

// GET add page
router.get('/add-page', function(req, res) {
    var title = "";
    var slug = "";
    var content = "";

    // render the view
    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});

// POST add page
router.post('/add-page', function(req, res) {
    // express validation
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    // take all value from input
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

    var errors = req.validationErrors();
    
    if (errors) {
        console.log('errors');
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    }else {
        Page.findOne({slug: slug}, (err, page) => {
            if(page) {
                req.flash('danger', 'slug has been found, please create the new one!');
                res.render('admin/add_page', {
                    errors: errors,
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });

                page.save( (err) => {
                    if(err) return console.log(err);
                    req.flash('success', 'Document has been saved!');
                    res.redirect('/admin/pages');
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