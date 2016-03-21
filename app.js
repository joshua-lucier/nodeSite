var express = require('express');
var app = express();
var settings = require('./settings');
var pg = require('pg');

pg.connect(settings.conString, function(err, client, done)
{
	if(err)
	{
		return console.error('error fetching client from pool',err);
	}
});

app.get('/',function(req,res){
	res.send('Hello World!');
});

app.listen(settings.port, function(){
	console.log('Example app listening on 3000');

});

