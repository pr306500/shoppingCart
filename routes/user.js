/*
Get Register
*/
exports.register = function (req, res) {
    console.log('Entry point##');
    res.render('register', {
        'title': 'Register'
    })


}

exports.postRegister = function (req, res) {
    console.log('@@@');
    var User = require('../models/user.js');
    var bcrypt = require('bcryptjs');
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Password do not match').equals(password);

    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors,
            title: 'Register'
        });
    } else {

        User.findOne({ username: username }, (err, user) => {
            if (err) {
                console.log(err);
            }
            else if (user) {
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('/users/register');
            }
            else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 1
                });
                user.save()
                    .then(() => {
                        console.log('!!!!', !user.isNew);
                        if (!user.isNew) {
                            bcrypt.genSalt(10, (err, salt) => {
                                console.log('salt is here', salt);
                                bcrypt.hash(user.password, salt, (err, hash) => {
                                    if (err) {
                                        console.log('err', err)
                                    } else {
                                        user.password = hash;
                                        user.save()
                                            .then(() => {

                                                req.flash('success', 'You are now logged in!');
                                                res.redirect('/users/login');

                                            })

                                    }
                                })
                            })
                        }
                    })
            }
        })


    }


}

exports.getLogin = function(req,res){
console.log('At line 87')
  if(res.locals.user) res.redirect('/')
   
   res.render('login',{
       'title':'Log in'
   })

}

exports.afterLogin = function(req,res,next){
 var passport = require('passport');
 var LocalStrategy = require('passport-local').Strategy;
  passport.authenticate('local',{
      successRedirect:'/',
      failureRedirect:'/users/login',
      failureFlash:true
  })(req,res,next)

}