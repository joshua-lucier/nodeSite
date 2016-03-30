var express = require('express');
var router = express.Router();
var settings = require('../settings');
var crypto = require('crypto'), algorithm = settings.algorithm, key = settings.key;
var pg = require('pg');
var input = 'utf8';
var output = 'hex';

function encrypt(text)
{
	var cipher = crypto.createCipher(algorithm,key);
	var crypted = cipher.update(text,input,output);
	crypted += cipher.final(output);
	return crypted;
}

function decrypt(text)
{
	var decipher = crypto.createDecipher(algorithm,key);
	var dec = decipher.update(text,output,input);
	dec += decipher.final(input);
	return dec;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

router.get('/profile', function(req, res, next){
	res.render('profile', { title: 'Josh\'s Profile'});
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

router.get('/blogentry',function(req,res,next){
	index = req.query.index;
	pg.connect(settings.conString, function(err, client, done){
		if(err)
		{
			return console.error('error fetching client from pool',err);
		}
		var query = client.query('select * from blogentry',function(err,result){
			done();
			if(err){
				console.error('Error getting blogs',err);
			}
		});
		query.on('end',function(result){
			var queryresult = result.rows[index];
			console.log(queryresult);
			res.render('blogentry',{title: queryresult.title, blogstamp: queryresult.blogstamp, title: queryresult.title, blogtext: JSON.stringify(queryresult.blogtext), index: index});
		});
	});

});

router.get('/blog',function(req,res,next){
	pg.connect(settings.conString, function(err, client, done){
		if(err)
		{
			return console.error('error fetching client from pool',err);
		}
		var query = client.query('select * from blogentry',function(err,result){
			done();
			if(err){
				console.error('Error getting blogs',err);
			}
		});
		query.on('end',function(result){
			var queryresult = result.rows;
			console.log(queryresult);
			res.render('blog',{title: 'Blog',result: queryresult});
		});
	});
});

router.post('/blogindex', function(req,res,next){
	user = req.body.username;
	pass = req.body.password;
	var queryresult = {};
	if(user!=settings.username || pass!=settings.password)
	{
		usernamet = decrypt(user);
		passwordt = decrypt(pass);
	}
	else
	{
		usernamet = user;
		passwordt = pass;
	}
	if(usernamet==settings.username && passwordt==settings.password)
	{
		username = encrypt(usernamet);
		password = encrypt(passwordt);
		pg.connect(settings.conString, function(err, client, done){
			if(err)
			{
				return console.error('error fetching client from pool',err);
			}
			var query = client.query('select * from blogentry',function(err,result){
				done();
				if(err){
					console.error('Error getting blogs',err);
				}
			});
			query.on('end',function(result){
				var queryresult = result.rows;
				console.log(queryresult);
				res.render('blogindex',{title: 'Blog', result: queryresult, username: username, password: password});
			});
		});
		pg.end();
		
	}
	else
	{
		res.send('Incorrect login...');
	}
});

router.post('/newblogentry',function(req,res,next){
	user = decrypt(req.body.username);
	pass = decrypt(req.body.password);
	if(user==settings.username && pass==settings.password)
	{
		username = encrypt(user);
		password = encrypt(pass);
		res.render('newblogentry',{username: username, password: password, title: 'New Blog Entry'})
	}
	else
	{
		console.log(user);
		console.log(pass);
		res.send('Incorrect login...');
	}
});

router.post('/blogentered',function(req,res,next){
	user = decrypt(req.body.username);
	pass = decrypt(req.body.password);
	if(user==settings.username && pass==settings.password)
	{
		pg.connect(settings.conString, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			var query = client.query('insert into blogentry (blogstamp,title,blogtext) values (now(),$1,$2)', [req.body.title,req.body.blogtext] , function(err, result) {
			    //call `done()` to release the client back to the pool
				done();
				if(err) {
					return console.error('Error creating blogentry', err);
				}
			});
			query.on('end',function(result){
				res.render('returnbutton',{title: 'Return', username: username, password: password});
			});
		});
	}
	else
	{
		console.log(user);
		console.log(pass);
		res.send('Authentication invalid');
	}
});

router.get('/dbinit',function(req,res,next){
	res.render('dbinit',{title: 'login'});
});

router.post('/dbinit',function(req,res,next){
	username = req.body.username;
	password = req.body.password;
	if(username==settings.username && password==settings.password)
	{
		pg.connect(settings.conString, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			client.query('CREATE TABLE blogentry (blogstamp TIMESTAMP NOT NULL, title VARCHAR(200) PRIMARY KEY, blogtext TEXT NOT NULL)', function(err, result) {
			    //call `done()` to release the client back to the pool
				done();
				if(err) {
					return console.error('Error creating blogentry', err);
				}
			});
			client.query('create table categories (CategoryID bigserial primary key, description text NOT NULL)',function(err,result){
				done();
				if(err)
				{
					return console.error('Error creating categories',err);
				}
			});
			client.query('create table categorysets (CategoryID bigserial references categories (CategoryID), title varchar(200) references blogentry (title), primary key (CategoryID,title))',function(err,result){
				done();
				if(err)
				{
					console.error('Error creating categorysets',err);
				}
			});
		});
	}
	res.send('tables initialized');
	
});

router.post('/editblogentry',function(req,res,next){
	user = decrypt(req.body.username);
	pass = decrypt(req.body.password);
	if(user==settings.username && pass==settings.password)
	{
		username = encrypt(user);
		password = encrypt(pass);
		pg.connect(settings.conString, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			var query = client.query('select * from blogentry where title = $1',[req.body.title],function(err,result){
				done();
				if(err){
					console.error('Error getting blog entry',err);
				}
			});
			query.on('end',function(result){
				queryresult = result.rows;
				res.render('editblogentry',{username: username, password: password, result: queryresult})
			});
		});
		pg.end();
	}
});

router.post('/blogedited',function(req,res,next){
	user = decrypt(req.body.username);
	pass = decrypt(req.body.password);
	if(user==settings.username && pass==settings.password)
	{
		pg.connect(settings.conString, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			var query = client.query('update blogentry set blogtext = $2 where title = $1', [req.body.title,req.body.blogtext] , function(err, result) {
			    //call `done()` to release the client back to the pool
				done();
				if(err) {
					return console.error('Error updating blogentry', err);
				}
			});
			var query2 = client.query('update blogentry set blogstamp = now() where title = $1', [req.body.title], function(err,result){
				done();
				if(err){
					return consol.error('Error updating blogentry', err);
				}
			});
			query2.on('end',function(result){
				res.render('returnbutton',{title: 'Return', username: username, password: password});
			});
		});
	}
});

module.exports = router;
