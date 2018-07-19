// Plugins
var express = require('express');
var router = express.Router();

// Get Page Model
var Page = require('../models/page');

// GET pages index
router.get('/', function(req, res) {
    res.send('admin pages baru')
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
        // console.log('save data');
        Page.findOne({slug: slug}, function(err, page) {
            if(page) {
                req.flash('danger', 'slug has been found, please change the slug');
                res.render('admin/add_page', {
                    errors: errors,
                    title: title,
                    slug, slug,
                    content: content
                })
            } else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 0
                });

                page.save( (err) => {
                    if(err) return console.log(err);
                    req.flash('data has been saved');
                    res.redirect('/admin/pages');
                })
            }
        });

    }
});

router.get('/test', function(req, res) {
    res.send('admin test')
})

// Exports
module.exports = router;