var Products = require('../models/product.js');
var Category = require('../models/category.js');
var fs = require('fs-extra');

exports.getHome = function(req,res){

   res.render('index',{
      
      'title' : 'Home'

   })

}

exports.getPage = function(req,res){
Products.find({})
        .then((products)=>{
             
             res.render('all_products',{
                 
                 title : 'All products',
                 products : products


             })

        })
	
	
}

exports.getBySlug = function(req,res){

Products.find({'category': req.params.foods})
        .then((products)=>{
             res.render('all_products',{
                 
                 title : req.params.foods.toUpperCase(),
                 products : products


             })

        })
	
	
}

exports.getDetails = function(req,res){

 var galleryImage = null;

    Products.findOne({slug : req.params.product})
           .then((product)=>{
            console.log(product,req.params.product);
              var galleryDir = 'public/product_images/'+product._id+'/gallery';
                  fs.readdir(galleryDir,(err, files)=>{
                      
                      if(err){

                        console.log(err);

                      }else{

                        galleryImage = files;
                        res.render('product',{
                            'title':product.title,
                            'p':product
                   })

                }

           })

      })

}

exports.addCart = function(req,res){

 var slug = req.params.slug;

    Products.findOne({slug: slug}, function (err, p) {
        if (err)
            console.log(err);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;
            
            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
        }

        res.redirect('/products');
    });


}


exports.clearCart = function(req,res){
  
  var action = req.query.action;
  req.session.cart.forEach((val,index)=>{
    
    if(action == 'clear' && req.params.slug === req.session.cart[index].title){
           
           req.session.cart.splice(index,1)
           if(req.session.cart.length === 0){
              delete req.session.cart;
           }
        
           res.redirect('/cart/checkout');

    }
    else if(action == 'add' && req.params.slug === req.session.cart[index].title){
           console.log('inside add')
           req.session.cart[index].qty ++;

           res.redirect('/cart/checkout');

    }
    else if(action == 'remove' && req.params.slug === req.session.cart[index].title){
           
           if(req.session.cart[index].qty <= 1){
                delete req.session.cart;
           }
           else{
            req.session.cart[index].qty --
           }
           res.redirect('/cart/checkout');

    }

  })


}

exports.allClear = function(req,res){

 delete req.session.cart;

 res.redirect('/cart/checkout');

}

exports.checkout = function(req,res){

  res.render('checkout',{
    'title':'Checkout',
    'cart':req.session.cart
  })


}

