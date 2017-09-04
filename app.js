var express = require('express');
var app = express();
var path = require('path');
var config = require('./config/database.js');
var bodyParser = require('body-parser');//To post the json request.
var router = express.Router();
var pageController = require('./routes/pages.js')
var adminController = require('./routes/admin_pages.js');
var productController = require('./routes/admin_products.js')
var session = require('express-session');//server side session 
var expressValidator = require('express-validator');// validation middleware
var adminCategory = require('./routes/admin_categories.js');
var fileUpload = require('express-fileupload');// req.files.image
var Page = require('./models/pages');
var Category = require('./models/category.js');


/*
Middleware used below

express-session
express-validator
express-fileupload
body-parser

*/
app.locals.errors = null;

//Express fileUpload middleware

app.use(fileUpload());

var mongoose = require('mongoose');
    mongoose.connect(config.database);

    mongoose.connection
            .once('open',()=>{
           
            })
            .on('error',(err)=>{
              console.log('error in mongodb connection',err);
            })  

//View setup engine

app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs');


/*through this we could post the request in express*/
app.use(bodyParser.urlencoded({
  extended: true
}));

// express session
/*Middleware used for session management*/
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
  //cookie: { secure: true }
}))

// validator
/*Middleware used for express validation*/
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  },
  customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

/*Middleware used for hifhlighting the error message*/
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

Page.find({}).sort({'sorting' : 1})
    .then((pages)=>{
      app.locals.pages = pages; 
    })


  Category.find({})
          .then((categories)=>{
            app.locals.categories = categories;
          })      
/*It's used for rendering the static files like images, so it will automatically search in the public folder*/
app.use(express.static(path.join(__dirname,'public')));

app.get("*",(req,res,next)=>{

  res.locals.cart = req.session.cart;
  next();

})

router.route('/')
      .get(pageController.getHome)

router.route('/test')
      .get(pageController.getPage)      

router.route('/admin/pages')
      .get(adminController.getHome)

router.route('/admin/pages/test')
      .get(adminController.getPage)      

router.route('/admin/pages/add-page')
      .get(adminController.addPage)

router.route('/admin/pages/add-page')
      .post(adminController.postPage)

router.route('/admin/pages/edit-page/:slug')
      .get(adminController.editPage) 

router.route('/admin/pages/edit-page/:slug')
      .post(adminController.saveEditPage)                 

router.route('/admin/pages/delete-page/:_id')
      .get(adminController.deletePage)

router.route('/admin/categories')
      .get(adminCategory.getHome)


router.route('/admin/categories/add-category')
      .get(adminCategory.addCategory)

router.route('/admin/categories/add-category')
      .post(adminCategory.saveCategory)

router.route('/admin/categories/edit-category/:slug')
      .get(adminCategory.editCategory)

router.route('/admin/categories/edit-category/:slug')
      .post(adminCategory.saveEditCategory);      

router.route('/admin/categories/delete-category/:slug')
      .get(adminCategory.deleteCategory);  

router.route('/admin/products')
      .get(productController.getHome);

router.route('/admin/products/add-product')
      .get(productController.addProduct)

router.route('/admin/products/add-product')
      .post(productController.saveNewProduct) 

router.route('/admin/products/edit-product/:id')
      .get(productController.editProduct)            

router.route('/admin/products/edit-product/:id')
      .post(productController.saveEditProduct)

router.route('/admin/products/delete-product/:id')       
      .get(productController.deleteProduct);

router.route('/products')
      .get(pageController.getPage)

router.route('/products/:foods')
      .get(pageController.getBySlug)

/*GET product details*/

router.route('/products/:category/:product')
      .get(pageController.getDetails)


router.route('/cart/add/:slug')
      .get(pageController.addCart)

router.route('/cart/checkout')
      .get(pageController.checkout);

router.route('/cart/update/:slug')
      .get(pageController.clearCart)  

router.route('/cart/clear')
      .get(pageController.allClear)

//Start the server 
app.use('/',router);
app.listen('3001',()=>{

console.log('server started on port',+3001);

});