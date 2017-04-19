var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var settings = require('./setting');

var session = require('express-session');//sessionʹ��
var MongoStore = require('connect-mongo')(session);//mongodbʹ��
//���� flash ģ����ʵ��ҳ��֪ͨ
var flash = require('connect-flash');
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', index);
//app.use('/users', users);

// ��Ҫ�������ݿ�
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,  //cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    url: 'mongodb://127.0.0.1/'+settings.db
  })}));

app.use(flash());//����ʹ�� flash ����

// Ϊ��ʵ���û���ͬ��¼״̬����ʾ��ͬ��ҳ��ɹ����ߴ�����ʾ��Ϣ
app.use(function(req,res,next){
  //res.locals.xxxʵ��xxx����ȫ�ֻ���������ҳ��ֱ�ӷ��ʱ���������
  //����session���ݣ��û���Ϣ
  res.locals.user = req.session.user;
  //��ȡҪ��ʾ������Ϣ
  var error = req.flash('error');//��ȡflash�д洢��error��Ϣ

  res.locals.error = error.length ? error : null;

  //��ȡҪ��ʾ�ɹ���Ϣ
  var success = req.flash('success');

  res.locals.success = success.length ? success : null;
  next();//����Ȩת�ƣ�����ִ����һ��app��use()
});
//����ƥ��·��
app.use('/', index); //ָ����routesĿ¼�µ�index.js�ļ�
// error handler

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
module.exports = app;
