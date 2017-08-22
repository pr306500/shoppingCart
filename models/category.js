var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var categorySchema =  new Schema({

   
    "title" : {

    	"type" : "String",
    	"required" : true
    },

    "slug" : {

    	"type" : String
    }


})

module.exports = mongoose.model('Category',categorySchema);