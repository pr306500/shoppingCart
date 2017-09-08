const Page = require('../models/pages.js');

exports.getHome = function (req, res) {
  Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
    res.render('admin/pages', {
      pages: pages
    })

  })

}

exports.getPage = function (req, res) {



}

exports.addPage = function (req, res) {
  var title = "";
  var slug = "";
  var content = "";

  res.render('admin/add_page', {
    title: title,
    slug: slug,
    content: content
  });

}


exports.editPage = function (req, res) {

  Page.findOne({ _id: req.params.slug })
    .then((page) => {

      res.render('admin/edit_page', {

        title: page.title,
        slug: page.slug,
        content: page.content,
        id: page._id

      });

    })

}

exports.saveEditPage = function (req, res) {

  Page.findOneAndUpdate({ slug: req.params.slug }, req.body)
    .then((page) => {
      Page.find({})
        .then((page) => {
          Page.find({}).sort({ 'sorting': 1 })
            .then((pages) => {
              app.locals.pages = pages;
            })
          res.render('admin/pages', {
            pages: page
          })

        })

    })

}

exports.deletePage = function (req, res) {
  Page.findByIdAndRemove(req.params._id)
    .then(() => Page.find({}))
    .then((page) => {
      Page.find({}).sort({ 'sorting': 1 })
        .then((pages) => {
          app.locals.pages = pages;
        })
      res.render('admin/pages', {
        pages: page

      })
    })
}

exports.postPage = function (req, res) {

  req.checkBody('title', 'Title cannot be empty').notEmpty();
  req.checkBody('content', 'Content cannot be empty').notEmpty();

  var title = req.body.title;
  var slug = (!req.body.slug) ? title.replace(/\s+/g, '-').toLowerCase() : req.body.slug.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;

  const errors = req.validationErrors();

  if (errors) {

    res.render('admin/add_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    });


  } else {

    Page.findOne({
      slug: slug
    })
      .then((page) => {

        if (page) {
          req.flash('danger', 'Page slug exists, choose another');
          res.render('admin/add_page', {
            title: title,
            slug: slug,
            content: content

          });

        } else {
          _page = new Page({

            title: title,
            slug: slug,
            content: content,
            sorting: 100


          });

          _page.save()
            .then(() => {

              if (!_page.isNew) {

                req.flash('success', 'Page added');
                res.redirect('/admin/pages');


              }
            })


        }
      })
  }
}