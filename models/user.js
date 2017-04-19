/**
 * Created by yezi on 2017/4/14.
 */
var mongodb=require('./db');

function User(user){
    this.name=user.name;
    this.password=user.password;
};

module.exports =User;

User.prototype.save=function(callback){
    var user={
        name:this.name,
        password:this.password
    };
    mongodb.open(function(err, db){
        if(err){
            mongodb.close();
            return callback(err);
        }
        db.collection('users', function(err, collection) {//定义集合名称users
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // ?为name属性添加索引
            collection.ensureIndex('name', {unique: true}, function (err) {
                callback(err);
            });

            //把user对象中的数据，即用户注册信息写入users集合中
            collection.insert(user, {safe: true}, function(err, user) {
                mongodb.close();
                callback(err, user);
            });
        });
        /*db.collection.ensureIndex('name',{unique:true},function(err){
            callback(err);
        });
        db.collection.insert(user,{safe:true},function(err, user){
            mongodb.close();
            callback(err, user);
        });*/
    });
};

User.get=function get(username, callback){
    mongodb.open(function(err,db){
        if(err){
            mongodb.close();
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({name:username},function(err,doc){
                mongodb.close();
                if(doc){
                    var user =new User(doc);
                    callback(err,user);
                }else {
                    callback(err,null);
                }
            })
        });
    });
};