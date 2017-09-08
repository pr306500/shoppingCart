var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');
var bcrypt = require('bcryptjs');

module.exports = function (passport) {

  passport.use(new BasicStrategy(

    function (username, passport, cb) {

      User.findOne({ username: username }, (err, user) => {

        if (err) {
          console.log('err', err);
        }

        if (!user) {

          return cb(null, false, { 'message': 'No user found' })

        }
        bcrypt.compare(password,user.password,(err, isMatch)=>{
            if(err){
              console.log('err');
            }
            if(isMatch){
             return cb(null,user);             
            }else{
             return cb({'message':'No user found'})
            }
        })

      })


    }

  ));
 passport.serializeUser((user,cb)=>{
   
   cb(null,user.id);

 })

 passport.deserializeUser((id,cb)=>{
   User.findById(id,(err,user)=>{
     cb(err,user);
   })
 })
}


