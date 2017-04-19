var express = require('express');
var router = express.Router();

//加载生成MD5值依赖模块
var crypto = require('crypto');// 加密和解密模块
var User = require('../models/user');

var Post = require("../models/post.js");//加载用户发表微博模块
/* GET home page. */
router.get('/', function(req, res, next) {
  Post.get(null,function(err, posts){
    if(err){
      posts=[];
    }
    res.render('index',{title:'首页',posts:posts});
  });
});
router.get('/reg',checkNotLogin);
router.get('/reg',function(req,res){
  res.render('reg',{title:'用户注册'})
});
router.post('/reg',checkNotLogin);
router.post('/reg',function(req,res){
  if(req.body.username==""||req.body.userpwd==''||req.body.pwdrepeat==''){
    req.flash('error',"输入框不能为空");
    return res.redirect('/reg')
  }
  if(req.body.userpwd!=req.body.pwdrepeat){
    req.flash("error",'两次输入密码不一致');
    return res.redirect('/reg')
  }
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.userpwd).digest('base64');

  //用新注册用户信息对象实例化User对象，用于存储新注册用户和判断注册用户是否存在
  var newUser = new User({
    name: req.body.username,
    password: password
  });
  User.get(newUser.name,function(err,user){
    if (user){
      req.flash('error','用户名已存在');
      return res.redirect('/reg');
    }
    newUser.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/reg');
      }
      req.session.user =newUser;
      req.flash('success',req.session.user.name +'注册用户成功');
      res.redirect('/');
    });
  });
});
router.get('/login',checkNotLogin);
router.get('/login', function(req, res) {
  res.render('login', { title: '用户登录' });
});
router.post('/login', checkNotLogin);
router.post('/login',function(req,res){
  //生成口令的散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.userpwd).digest('base64');
  //判断用户名和密码是否存在和正确
  User.get(req.body.username,function(err,user){
    if(!user) {
      req.flash('error', '用户名不存在');
      return res.redirect('/login');
    }
    if(user.password != password) {
      req.flash('error', '用户密码错误');
      return res.redirect('/login');
    }
    // 保存用户信息
    req.session.user = user;
    req.flash("success","登录成功");
    res.redirect('/');
  })
});

// 用户注销操作
router.get('/logout',checkLogin);
router.get('/logout', function(req, res) {
  req.session.user = null;//清空session
  req.flash('success', '退出成功！');
  res.redirect('/');
});
router.post('/post',checkLogin);
router.post('/post',function(req,res){
  var currentUser= req.session.user;
  var post=new Post(currentUser.name,req.body.post,req.body.time);
  post.save(function(err){
    if(err){
      req.flash('error',err)
    }
    req.flash('success','发表成功');
    res.redirect('/u/'+currentUser.name);
  });
});
router.get('/u/:user',function(req,res){
  User.get(req.params.user,function(err,user){
    if(!user){
      req.flash('error','用户不存在');
      return res.redirect('/');
    }
    Post.get(user.name,function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('user',{
        title:user.name,
        posts:posts
      });
    });
  });
});
function checkNotLogin(req,res,next){
  if(req.session.user){
    req.flash('error',"已登陆");
    return res.redirect('/login');
  }
  next()
}
function checkLogin(req,res,next){
  if (!req.session.user){
    req.flash('error', '未登录');
    return res.redirect('/login');
  }
  //已登录转移到下一个同一路径请求的路由规则操作
  next();
}
module.exports = router;
