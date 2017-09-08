var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');

passport.use(new BasicStrategy(

   function(username, passport, cb){
     
     User.findOne({username:username},(err,user)=>{

      if(err){
      	console.log('err',err);
      }

      if(!user){

        return cb(null,false,{'message':'No user found'})

      }

     })


   }

));
