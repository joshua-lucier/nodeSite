var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

router.get('/profile', function(req, res, next){
	res.render('profile', { title: 'Josh\'s Profile'});
});

router.get('/blog', function(req, res, next){
	res.render('blog', { title: 'Blog'});
});

router.get('/resume', function(req, res, next){
	res.render('resume', { title: 'Resume'});
});

router.get('/contact', function(req, res, next){
	res.render('contact', { title: 'Contact'});
});

router.get('/login', function(req, res, next){
	res.render('login', { title: 'Login'});
});

module.exports = router;
