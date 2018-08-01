// Plugins
var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

// Get Product Model
var Product = require('../models/product');
// Get Category Model
var Category = require('../models/categories');

// GET product index
router.get('/', function(req, res) {
    var count;
    Product.count(function(err, c) {
        count = c;
    });

    Product.find(function(err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});

// GET add product
router.get('/add-product', function(req, res) {
    var title = "";
    var desc = "";
    var price = "";

    Category.find(function(err, categories) {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    });
});

// POST add product
router.post('/add-product', function(req, res) {

    // image validation when image undefined 
    // jika image undefined maka request image name selain itu empty string
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    // express validation
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an Image').isImage(imageFile);

    // take all value from input
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();
    
    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    }else {
        Product.findOne({slug: slug}, (err, product) => {
            if(product) {
                req.flash('danger', 'Product title exists, please create the new one!');
                Category.find(function (err, categories) {
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save( (err) => {
                    if(err) return console.log(err);

                    mkdirp('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });

                    //if image files is not an empty string
                    if(imageFile != ""){
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });

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