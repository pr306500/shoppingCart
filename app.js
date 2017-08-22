var express = require('express');
var app = express();
var path = require('path');
var config = require('./config/database.js');
var bodyParser = require('body-parser');//To post thr json request.
var router = express.Router();
var pageController = require('./routes/pages.js')
var adminController = require('./routes/admin_pages.js');
var session = require('express-session');
var expressValidator = require('express-validator');
var adminCategory = require('./routes/admin_categories.js');
app.locals.errors = null;
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

//Set public folder
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
  }
}));

/*Middleware used for hifhlighting the error message*/
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// routes
/*It's used for rendering the static files like images.*/
app.use(express.static(path.join(__dirname,'public')));

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


//Start the server 
app.use('/',router);
app.listen('3000',()=>{

console.log('server started on port',+3000);

});