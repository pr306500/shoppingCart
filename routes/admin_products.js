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
            image: imageFile
        });

        product.save(function (err) {
            if (err)
                return console.log(err);

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
        });
    }

}

exports.editProduct = function(req,res){
  let categories;
  let errors;

  if(req.session.errors)
    errors = req.session.errors;
    req.session.errors = null;

  Category.find({})
          .then((category)=>{
              categories = category
          })
  Products.findOne({'_id':req.params.id})
          .then((product)=>{

            var galleryDir = 'public/product_images/'+product._id+'/gallery';
            var galleryImages = null;

            fs.readdir(galleryDir,(err,files)=>{
              
              if(err){
                console.log('line 145/admin_products.js')
              }else{
                 galleryImages = files;
                    res.render('admin/edit_product.ejs',{

                    'title':product.title,
                    'errors':errors,
                     'id':product._id,
                     'desc':product.desc,
                     'categories':categories,
                     'price':parseFloat(product.price).toFixed(2),
                     'image':product.image,
                     'galleryImages':galleryImages
                })
              }
            })
      })
      .catch((error)=>{
        res.redirect('/admin/products')
      })
}
exports.saveEditCategory = function (req, res) {

    Category.findOneAndUpdate({ '_id': req.params.slug }, req.body)
        .then((category) => Category.find({}))
        .then((category) => {

            res.render('admin/categories.ejs', {
                'categories': category
            });

        })
}

exports.deleteCategory = function (req, res) {

    Category.findByIdAndRemove(req.params.slug)
        .then(() => { Category.findOne({ _id: req.params.slug }) })
        .then((category) => {
            if (!category) {
                Category.find({})
                    .then((category) => {
                        res.render('admin/categories', {
                            categories: category
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
                console.log('@@@', category);
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