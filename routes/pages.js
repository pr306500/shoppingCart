exports.getHome = function(req,res){

   res.render('index',{
      
      'title' : 'Home'

   })

}

exports.getPage = function(req,res){

	res.send('Pages test')
}