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

// GET edit product
router.get('/edit-product/:id', function (req, res) { 

    var errors; // an errors array | dont want to display errors code couse too much code

    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null; // else

    Category.find(function (err, categories) {

        Product.findById(req.params.id, function (err, p) { // find particular product
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null; // set null to begin

                fs.readdir(galleryDir, function (err, files) { // fs.readdir cek for files
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;
                        res.render('admin/edit_product', {
                            errors: errors,
                            title: p.title,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(), // as a slug
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });
            }
        });
    });
});

// POST Edit product
router.post('/edit-product/:id', function (req, res) {
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
    var image = req.body.image;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if(errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id:{'$ne':id}}, function (err, p) {
            if (err) console.log(err);
            if (p) {
                //if title exists
                req.flash('danger', 'Product title exists, choose another one!');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                //Update
                Product.findById(id, function (err, p) {
                    if(err) console.log(err)
                    p.title = title;
                    p.desc = desc;
                    p.slug = slug;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if(image != ""){
                        p.image = imageFile;
                    }

                    p.save( function(err) {
                        if(err) console.log(err);
                        if(imageFile != "") { // checks if there is a new image
                            if(pimage != "") {
                                //if file image exists then remove it
                                fs.remove('public/product_images/' + id + '/' + pimage, function(err){
                                    if(err) console.log(err);
                                });
                            }

                            //replace image with the new one
                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });
                        }

                        req.flash('success', 'Product added');
                        res.redirect('/admin/products/edit-product/' + id);
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