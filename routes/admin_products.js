var Products = require('../models/product.js');
var Category = require('../models/category.js');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImage = require('resize-img');

exports.getHome = function (req, res) {

    var count;

    Products.count((err, cunt) => {

        count = cunt;

    })

    Products.find({})
        .then((products) => {

            res.render('admin/products', {
                products: products,
                count: count
            })
        })


}

exports.addProduct = function (req, res) {

    var title = '';
    var desc = '';
    var price = '';

    Category.find((err, categories) => {

        res.render('admin/add_product.ejs', {

            title: title,
            desc: desc,
            categories: categories,
            price: price

        })

    })



}


exports.saveNewProduct = function (req, res) {
    /*req.body, req.params, req.files.image*/
    var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '';

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You have to upload the image').isImage(imageFile);

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
    } else {

        var price2 = parseFloat(price).toFixed(2);

        var product = new Products({
            title: title,
            slug: slug,
            desc: desc,
            price: price2,
            category: category,
            image: imageFile // image name
        });

        /* After the product info gets stored to mongo, we store image to the directory with the specific id 
            that got stored in mongo.*/

        product.save()
            .then(() => {
                if (!product.isNew) {

                    mkdirp('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });/*it will make the directory path followed by the product ID.*/

                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });/*it will make the directory path followed by the gallery folder.*/

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });/*it will make the directory path followed by the thumbs folder.*/

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile; //imageFile - image file name.
                        /*In this we are moving the image to the path*/
                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');


                }
            }).catch((err) => {
                console.log(err);
            })

    }

}

exports.editProduct = function (req, res) {
    let categories;
    let errors;

    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Category.find({})
        .then((category) => {
            categories = category
        })
    Products.findOne({ '_id': req.params.id })
        .then((product) => {
            if (categories.length > 0) {

                res.render('admin/edit_product.ejs', {

                    'title': product.title,
                    'errors': errors,
                    'id': product._id,
                    'desc': product.desc,
                    'categories': categories,
                    'price': parseFloat(product.price).toFixed(2),
                    'image': product.image

                })
            } else {

                res.send('Internal issue occured, fresh it.')
            }



        })
        .catch((error) => {
            res.redirect('/admin/products')
        })
}

exports.saveEditProduct = function (req, res) {
    var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '';

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You have to upload the image').isImage(imageFile);
    var body = {};
    body.title = req.body.title;
    body.slug = body.title.replace(/\s+/g, '-').toLowerCase();
    body.desc = req.body.desc;
    body.price = req.body.price;
    body.category = req.body.category;
    body.image = (imageFile||req.body.pimage);// image name
    var id = req.params.id;

    var errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        //Findone product where slug is as per the given value but id should not be the same.
        Products.findOne({ slug: body.slug, _id: { '$ne': id } }, (err, product) => {
            if (err) {
                console.log(err)
            }
            if (product) {
                req.flash('danger', 'Product title exists, choose another');
                res.redirect('/admin/products/edit-product' + id);
            } else {

                Products.findByIdAndUpdate(id, body)
                    .then((product) => {
                        Products.findOne({ _id: product._id })
                            .then((product) => {
                                if (req.files.hasOwnProperty('mv')) {
                                    fs.remove('product_images' + product._id + '/' + req.body.pimage, (err) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        var path = "public/product_images" + id + '/' + imageFile;
                                        req.files.image.mv(path, (err) => {
                                            if (err) {

                                                return console.log(err);
                                            } else {
                                                res.redirect('/admin/products/edit-product/' + id);
                                            }

                                        })
                                    })
                                } else {

                                    res.redirect('/admin/products');
                                }
                            })
                    })
            }
        })
    }
}

exports.deleteProduct = function (req, res) {

    Products.findByIdAndRemove(req.params.id)
        .then(() => { Products.findOne({ _id: req.params.id }) })
        .then((products) => {
            if (!products) {
                Products.find({})
                    .then((products) => {
                        res.render('admin/products', {
                            products: products,
                            count: products.length
                        })
                    })
            }
        })

}

exports.saveCategory = function (req, res) {

    req.checkBody('title', 'Title must have a value.').notEmpty();
    var slug = req.body.title.replace(/\s+/g, '-').toLowerCase();

    var cat = new Category({

        'title': req.body.title

    })

    const errors = req.validationErrors();

    if (errors) {

        res.render('admin/add_category', {
            errors: errors,
            title: req.body.title
        });


    } else {

        Category.findOne({
            slug: slug
        })
            .then((category) => {

                if (category) {
                    req.flash('danger', 'Category exists, choose another');
                    res.render('admin/add_category', {
                        title: title,
                        slug: slug,
                        content: content

                    });

                } else {
                    _category = new Category({

                        title: req.body.title,
                        slug: slug

                    });

                    _category.save()
                        .then(() => {

                            if (!_category.isNew) {

                                req.flash('success', 'Category added');
                                res.redirect('/admin/categories');


                            }
                        })


                }
            })
    }

}