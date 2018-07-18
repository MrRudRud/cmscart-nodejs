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
        Page.findOne({slug: slug}, (err, page) => {
            // err dan page | page adalah argument untuk err
            // Kondisi jika slug pada page di MongoDB tidak unik
            // Page didapat dari import models/page.js yg berisi ketentuan schema collection page pada mongoDB
            if (page) {
                req.flash('danger', 'Page slug exists, choose another'); // flash adalah express messages
                res.render('admin/add_page', {
                    errors: errors,
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                // kondisi jika slug unik maka add page Baru
                var page = new Page({
                    //pass an object
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 0
                });

                // Simpan
                page.save(function(err) {
                    // jika error maka return ke console sbg error
                    if (err) return console.log(err);
                    // jika berhasil imput ke database selain itu return success flash
                    req.flash('success', 'Page added!');
                    // kemudian respose dan redirect
                    res.redirect('/admin/pages');
                });
            }

        });
    }
});

router.get('/test', function(req, res) {
    res.send('admin test')
})

// Exports
module.exports = router;