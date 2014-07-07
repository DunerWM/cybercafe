
/*
 * GET home page.
 */

var mongodb = require('../node_modules/db');

var io = require("../app.js").io;
var socketContainer = {};
io.on('connection',function(socket) {
	var recognizeId = socket.handshake.headers.referer;
	socketContainer[recognizeId] = socket;
})

//首页
exports.index = function(req, res){
	mongodb.open(function(err,db) {
		db.collection('goods',function(err,collection) {
			if(err) {
				mongodb.close();
			}
			collection.find({item:'饮品'}).toArray(function(err,doc) {
				if(doc) {
					collection.find({item:'食品'}).toArray(function(err,sock) {
						if(sock) {
							collection.find({item:'用品'}).toArray(function(err,usage) {
								if(usage) {
									res.render('indexx', { title: '首页', doc: doc, sock: sock,usage: usage });
									mongodb.close();
								}
							})
					  					
						}
					});
				} else {
					mongodb.close();
				}
			});
		});
	});

};

//管理登录
exports.login = function(req, res){
	res.render('login',{title:'管理登录'});
};
//登录验证
exports.doLogin = function(req, res){
	var logdata = req.body;
	mongodb.open(function(err,db) {
		db.collection('admin',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.find().toArray(function(err,ver) {
				mongodb.close();
				if(logdata.adminID != ver[0].username || logdata.adminPSW != ver[0].psw){
					res.send({
						status:'用户名或密码错误'
					});
				}
				else{
					req.session.user = {
						'adminID':logdata.adminID
					};
					res.send({
						status:'ok'
					});
				}
			});
		});
	});

};
//登出
exports.logout = function(req, res){
};
//添加商品
exports.addgoods = function(req,res){
	mongodb.open(function(err,db){
		db.collection('main',function(err,collection) {
			if(err) {
				mongodb.close();
			}
			collection.find().toArray(function(err,item) {
				mongodb.close();
				if(item) {
			  		res.render('addgoods', {item: item});			
				}
			});

		});
	});
};

exports.admin = function(req,res){
	res.render('admin', {
		title: 'admin',
		user: req.session.user
	});
};
//添加商品数据操作
exports.doaddgoods = function(req, res) {
	var data = req.body;
	mongodb.open(function(err,db) {
		db.collection('goods',function(err,collection) {
			if(err) {
				mongodb.close();
			}
			collection.update(
			{
				item:data.item,
				merchant:data.merchant,
				name:data.name
			}, 
			{
				$set: {
					price:data.price
				},
				$inc: {count:parseInt(data.count)}
		 		},false,true);
		});
		db.collection('instore',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.update({item:data.item,merchant:data.merchant,name:data.name}, {$inc: {count: -parseInt(data.count)}},false,true);
			mongodb.close();
		})
	});
};
//获取商品分类
exports.putstorage = function(req,res){
	mongodb.open(function(err,db){
		db.collection('main',function(err,collection) {
			if(err) {
				mongodb.close();
			}
			collection.find().toArray(function(err,item) {
				mongodb.close();
				if(item) {
			  		res.render('putstorage', {item: item});			
				}
			});

		});
	});
};
//获取商品商家分类
exports.doputstorage = function(req,res) {
	var item = req.query.item;
	mongodb.open(function(err,db) {
		db.collection('classes',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.find({father:item}).toArray(function(err,childrens) {
				mongodb.close();
				res.send({
					status:childrens
				});
			});
		});
	});
};
//获取商品信息
exports.getgoods = function(req,res) {
	var merchant = req.query.merchant;
	var item = req.query.item;
	mongodb.open(function(err,db) {
		db.collection("instore",function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.find({item:item,merchant:merchant}).toArray(function(err,goods) {
				mongodb.close();
				res.send({
					status:goods
				});
			});
		});
	});
};

exports.getinfor = function(req,res) {
	var data = req.query;
	mongodb.open(function(err,db) {
		db.collection('instore',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.find({item:data.item,merchant:data.merchant,name:data.name}).toArray(function(err,infor) {
				mongodb.close();
				res.send({
					status:infor
				})
			});
		});
	});
}
//已有商品入库数据操作
exports.instore = function(req,res) {
	var data = req.body;
	mongodb.open(function(err,db) {
		db.collection('instore',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.update(
			{
				item:data.item,
				merchant:data.merchant,
				name:data.name
			}, 
			{
				$set: {
					price:data.price,
					sellprice:data.sellprice,
					supplyer:data.supplyer,
					supplyPhone:data.supplyPhone
				},
				$inc: {count:parseFloat(data.count)}
		 		},false,true);
			res.send({
				status:'ok'
			})
		});
		db.collection('record',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.insert({
				item:data.item,
				merchant:data.merchant,
				name:data.name,
				count:parseInt(data.count),
				price:data.price,
				sellprice:data.sellprice,
				supplyer:data.supplyer,
				supplyPhone:data.supplyPhone,
				manager:req.session.user.adminID,
				time:new Date()
			},function() {
				mongodb.close();
			})
		})
	});
}
//添加商户
exports.addonlyMerchant = function(req,res) {
	var item = req.body.item;
	var merchant = req.body.merchant;
	mongodb.open(function(err,db) {
		db.collection('classes',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.insert({
				father:item,
				child:merchant
			});
			collection.find({father:item}).toArray(function(err,merchants) {
				mongodb.close();
				res.send({
					status:merchants
				});
			});
		});
	});
}
//添加新商品表单提交
exports.addnewgoods = function(req,res) {
	var data = req.body;
	mongodb.open(function(err,db) {
		db.collection('instore',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.insert({
				item:data.item,
				merchant:data.merchant,
				name:data.name,
				count:parseInt(data.count),
				price:data.price,
				sellprice:data.sellprice,
				supplyer:data.supplyer,
				supplyPhone:data.supplyPhone,
				img: req.files.img.path,
				manager:req.session.user.adminID,
				time:new Date()
			},function() {
				res.send({
					status:'ok'
				})
			});
		});
		db.collection('goods',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.insert({
				item:data.item,
				merchant:data.merchant,
				name:data.name,
				count:0,
				price:data.price,
				sellprice:data.sellprice,
				supplyer:data.supplyer,
				supplyPhone:data.supplyPhone,
				img: req.files.img.path,
			})
		})
		db.collection('record',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.insert({
				item:data.item,
				merchant:data.merchant,
				name:data.name,
				count:parseInt(data.count),
				price:data.price,
				sellprice:data.sellprice,
				supplyer:data.supplyer,
				supplyPhone:data.supplyPhone,
				manager:req.session.user.adminID,
				time:new Date()
			},function() {
				mongodb.close();
			})
		})
	});
}
//商品列表
exports.goodsList = function(req,res) {
	mongodb.open(function(err,db) {
		db.collection('goods',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.find().toArray(function(err,goods) {
				mongodb.close();
				if(goods){
					res.render('goodsList',{data:goods});
				}
				
			})
		})
	})
}
//获取库存数量
exports.checkCount = function(req,res) {
	var data = req.query;
	mongodb.open(function(err,db) {
		db.collection('instore',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.find({merchant:data.merchant,name:data.name}).toArray(function(err,count) {
				mongodb.close();
				res.send({
					status:count
				})
			});
		})
	});
}
//客户端发送消息
exports.sendMessage = function(req,res) {
	var data = req.body;
	var key = "http://localhost:3000/admin";
	console.log(socketContainer);
	var targetSocket = socketContainer[key];
	targetSocket.emit("listenFun",{data:data.message});
}
//首页加号判断商品数 
exports.paddingcount = function(req,res) {
	var data = req.query;
	mongodb.open(function(err,db) {
		db.collection('goods',function(err,collection) {
			if(err){
				mongodb.close();
			}
			collection.find({merchant:data.merchant,name:data.name}).toArray(function(err,count) {
				mongodb.close();
				if(count[0].count > data.countValue){
					res.send({
						status:'ok'
					})
				}
				else{
					res.send({
						status:'no'
					})
				}
			})
		})
	})
}
//控制台
exports.console = function(req,res) {
	res.render('console', { title: '控制台'});
}