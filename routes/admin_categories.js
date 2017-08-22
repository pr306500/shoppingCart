var Category = require('../models/category.js');

exports.getHome = function(req,res){

 Category.find({})
         .then((categories)=>{
         	res.render('admin/categories',{
         		categories : categories
         	})
         })


}

exports.addCategory = function(req,res){

 res.render('admin/add_category.ejs',{

 	title : ''
 })


}

exports.saveCategory = function(req,res){
   
   req.checkBody('title','Title must have a value.').notEmpty();
   var slug = req.body.title.replace(/\s+/g,'-').toLowerCase();

   var cat = new Category({

     'title': req.body.title

   })

const errors = req.validationErrors();

if (errors) {

  res.render('admin/add_category', {
   errors: errors,
   title: req.body.title
  });


 }else{

  Category.findOne({
    slug: slug
   })
   .then((category) => {
   	console.log('@@@',category);
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