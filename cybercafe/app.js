
/**
 * Module dependencies.
 */

var express = require('express');


var path = require('path');
var fs = require('fs');

 
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
exports.io = io;

var routes = require('./routes');
var user = require('./routes/user');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.logger('dev'));


app.use(express.bodyParser({uploadDir:'./public/upload'})); 


app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser('wangmeng'));
app.use(express.session({
	secret: settings.cookieSecret,
	store: new MongoStore({
		db: settings.db
	})
}));
app.use(app.router);

//app.use(express.bodyParser());
//development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', routes.doLogin);
app.get('/logout', routes.logout);
app.get('/addgoods',routes.addgoods);
app.post('/addgoods',routes.doaddgoods);
app.get('/admin',routes.admin);
app.get('/putstorage',routes.putstorage);
app.get('/doputstorage',routes.doputstorage);
app.get('/getgoods',routes.getgoods);
app.post('/instore',routes.instore);
app.post('/addonlyMerchant',routes.addonlyMerchant);
app.post('/addnewgoods',routes.addnewgoods);
app.get('/goodsList',routes.goodsList);
app.get('/checkCount',routes.checkCount);
app.get('/getinfor',routes.getinfor);
app.get('/paddingcount',routes.paddingcount);
app.post('/sendMessage',routes.sendMessage);
app.get('/console',routes.console);




http.listen(3000, function(){
  console.log('listening on *:3000');
});
