var express = require('express');
var app = express();
var mongojs = require('mongojs');
var multer = require('multer');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('express-session');
var db = mongojs('kursus',["ebook","video","code","users","upload","pesan_terkirim","inbox","sampah"]);
var bodyParser=require("body-parser");
var cookieParser = require('cookie-parser');
var passport = require("passport");
var FacebookStrategy = require('passport-facebook').Strategy;
var MongoStore = require('connect-mongo')(session);
var crypto = require('crypto');
var md5sum = crypto.createHash('md5');
var fs = require("fs");

var mime = require('mime');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
var requestTime = function (req, res, next) {
  req.requestTime = Date.now();
  next();
};
io.on('connection', function(socket,req){
  socket.on('add_book', function(msg){
		io.emit('notification',msg);
  });
   socket.on('view_registered', function(msg){
		io.emit('userregister',msg);
  });
    socket.on('view_notif', function(msg){
		io.emit('add_notif',msg);
  });
	socket.on("send_notif_pesan",function(msg){
		io.emit("terimapesan",msg);
	});
  });
  module.exports = {

    'facebookAuth' : {
        'clientID'      : '1065894243431041', // your App ID
        'clientSecret'  : 'b087378d74ed71ee4dbf361cdf568155', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '933128375249-lrotu58b8rg191buobamhfnqgmh0c9qa.apps.googleusercontent.com',
        'clientSecret'  : 'SPOJVPBViRN_KNUckr7cW3gL',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.use(cookieParser());
/*app.use(session({
    cookie: { maxAge: 1000*60*2 } ,
    secret: "session secret" ,
    store:new MongoStore({
            db: 'kursus',
            host: 'localhost:3000',
            port: 3000,
            username: '',
            password: '',
            collection: 'session',
            auto_reconnect:true
    })
}));*/
app.set('view engine', 'jade');
app.use('/public',express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
app.use('/uploads',express.static(__dirname + '/uploads'));
app.use('/users',express.static(__dirname + '/users'));
var md5 = require('MD5');
app.use('/bower_components',express.static(__dirname + '/bower_components'));
app.get("/view_all",function(req,res){
	db.ebook.find(function(err,docs){
	  res.json(docs);
  });
});
app.post("/hapus_code",function(req,res){
	 var data = req.body.id.hapuscode;

	 for(i=0;i < data.length;i++){
	 db.code.remove( {_id: mongojs.ObjectId(data[i])},1);
	 }
	res.json();
});
app.get("/view_video",function(req,res){

	db.video.find(function(err,docs){
	res.json(docs);
  });
});
app.post("/ubah_notif",function(req,res){
	db.upload.update({},{$set: {status:req.body.status}}, { multi: true },function(err,docs){
		res.json(docs);
	})
});
app.post("/hapus_ebook",function(req,res){
	var data = req.body.id.hapusebook;

	for(i=0; i<data.length;i++){
	 fs.unlinkSync(data[i].gambar);
	 db.ebook.remove( {_id: mongojs.ObjectId(data[i]._id)},1);
	}
	res.json();
});
app.post("/hapus_pesan_terkirim",function(req,res){
	var data = req.body.id.hapusterkirim;
	console.log(data);
	for(i=0; i<data.length;i++){
    //  db.pesan_terkirim.remove( {_id: mongojs.ObjectId(data[i]._id)},1);
  		//db.sampah.insert({isipesan:data[i].isipesan,dari:"saya",kepada:data[i].kepada,dari2:req.session.nama})
    db.pesan_terkirim.remove( {_id: mongojs.ObjectId(data[i]._id)},1);
		db.sampah.insert({attachment:req.body.id.hapusinbox[i].attachment,isipesan:data[i].isipesan,dari:"saya",kepada:data[i].kepada,dari2:req.session.nama,file:data[i].file,asal:"pesanterkirim"});
  }
	res.json();
});
app.get("/view_notif",function(req,res){

	db.upload.find({status:"new"},function(err,docs){
	res.json(docs);
  });
});
app.post("/hapus_sampah",function(req,res){
  var data = req.body.id.hapussampah;
  for(i=0;i<data.length;i++){
      if(data[i].file==null){

      	 db.sampah.remove( {_id: mongojs.ObjectId(data[i]._id)},1);
      }else{

              	 db.sampah.remove( {_id: mongojs.ObjectId(data[i]._id)},1);
                fs.unlinkSync(data[i].file);
      }

  }
  res.json();
})
app.post("/pulihkan_pesan",function(req,res){
var data=req.body.id.hapussampah;
console.log(data);
for(i=0;i<data.length;i++){
  if(data[i].file==""){
  db.pesan_terkirim.insert({tanggalkirim:req.body.id.hapussampah[i].tanggalkirim,from:data[i].dari2,kepada:data[i].kepada,isipesan:data[i].isipesan});
  db.sampah.remove( {_id: mongojs.ObjectId(data[i]._id)},1);
}else if(data[i].asal=="pesanterkirim"){
  db.pesan_terkirim.insert({tanggalkirim:req.body.id.hapussampah[i].tanggalkirim,from:data[i].dari2,kepada:data[i].kepada,isipesan:data[i].isipesan,file:data[i].file,asal:"pesanterkitim"});
  db.sampah.remove( {_id: mongojs.ObjectId(data[i]._id)},1);
}else if(data[i].file==""){
  db.inbox.insert({tanggalkirim:req.body.id.hapussampah[i].tanggalkirim,from:data[i].dari2,kepada:data[i].kepada,isipesan:data[i].isipesan,asal:"inbox"});
  db.sampah.remove( {_id: mongojs.ObjectId(data[i]._id)},1);
}else{

  db.inbox.insert({tanggalkirim:req.body.id.hapussampah[i].tanggalkirim,gambar:req.session.gambar,from:data[i].dari2,kepada:data[i].kepada,isipesan:data[i].isipesan,file:data[i].file,asal:"inbox"});
  db.sampah.remove( {_id: mongojs.ObjectId(data[i]._id)},1);
}
}
res.json();
})
app.get("/view_inbox",function(req,res){

	db.inbox.find({kepada:req.session.nama},function(err,docs){
	res.json(docs);
  });
});
app.get("/view_terkirim",function(req,res){
	db.pesan_terkirim.find({from:req.session.nama},function(err, docs){
	res.json(docs);
  });
});
app.get("/view_terkirim_sampah",function(req,res){
  db.sampah.find({dari2:req.session.nama},function(err, docs){
	res.json(docs);
  });
});
app.post("/hapus_inbox",function(req,res){
  var data=req.body.id.hapusinbox;
  for(i=0;i<data.length;i++){
    db.inbox.remove( {_id: mongojs.ObjectId(data[i]._id)},1);
    db.sampah.insert({attachment:req.body.id.hapusinbox[i].attachment,anggalkirim:req.body.id.hapusinbox[i].tanggalkirim,gambar:req.session.gambar,kepada:req.body.id.hapusinbox[i].kepada,file:req.body.id.hapusinbox[i].file,isipesan:req.body.id.hapusinbox[i].isipesan,subject:req.body.id.hapusinbox[i].subject,dari:req.body.id.hapusinbox[i].from,status:req.body.id.hapusinbox[i].status,asal:"inbox",dari2:req.session.nama},function(req,res){

    })
  }
  res.json();
})
app.post("/hapus_video",function(req,res){
	 var data = req.body.id.hapusvideo;

	 for(i=0;i < data.length;i++){
	 db.video.remove( {_id: mongojs.ObjectId(data[i])},1);
	 }
	res.json();
});

app.get('/download_ebook', function(req, res){
  var mimetype = mime.lookup(file);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', mimetype);

  var filestream = fs.createReadStream(file);
  filestream.pipe(res);
});
app.get("/view_code",function(req,res){
	db.code.find(function(err,docs){
	  res.json(docs);
  });
});
app.get("/view_user",function(req,res){
	db.users.find(function(err,docs){
	  res.json(docs);
  });
});
app.get("/view_upload",function(req,res){
	db.upload.find(function(err,docs){
	  res.json(docs);
  });
});

app.post("/tambah_video",function(req,res){
	db.video.insert(req.body,function(err,docs){
		res.json(docs);})
 db.upload.insert(req.body,function(err,docs){


})
console.log(req.body);
});
app.post("/tambah_code",function(req,res){
	db.code.insert(req.body,function(err,docs){
		res.json(docs);
 db.upload.insert(req.body,function(err,docs){


})
})
console.log(req.body);
});
var storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, './uploads/');
  },
  filename: function (request, file, callback) {
    console.log(file);
    callback(null, file.originalname)
  }
});
var upload = multer({storage: storage}).single('gambar');

app.post('/tambah_ebook', function(request, response) {

  upload(request, response, function(err) {
	  db.ebook.insert({nama:request.body.nama,gambar:'uploads/'+ request.file.originalname,namapenulis:request.body.namapenulis,tanggalkirim:request.body.tanggalkirim,status:request.body.status},function(err,docs){

});
 db.upload.insert(request.body,function(err,docs){


})
  if(err) {
    console.log('Error Occured');
    return;
  }

  console.log(request.file);
  response.json();
  response.end('Your File Uploaded');
  console.log('Photo Uploaded');
  })
});
app.post('/kirim_pesan', function(request, response) {
console.log(request.body);
  upload(request, response, function(err) {
	  db.pesan_terkirim.insert({attachment:"YES",anggalkirim:request.body.tanggalkirim,kepada:request.body.to,file:'uploads/'+ request.file.originalname,isipesan:request.body.isipesan,subject:request.body.subject,from:request.session.nama,status:request.status},function(err,docs){

});
	  db.inbox.insert({attachment:"YES",anggalkirim:request.body.tanggalkirim,gambar:request.session.gambar,kepada:request.body.to,file:'uploads/'+ request.file.originalname,isipesan:request.body.isipesan,subject:request.body.subject,from:request.session.nama,status:request.body.status},function(err,docs){

});
  if(err) {
    console.log('Error Occured');
    return;
  }

  console.log(request.file);
  response.end('Your File Uploaded');
  console.log('Photo Uploaded');
  })
});
app.post("/kirim_pesan_text",function(req,res){
	db.pesan_terkirim.insert({attachment:"NO"anggalkirim:req.body.tanggalkirim,statuspesan:"undelete",gambar:req.session.gambar,kepada:req.body.to,isipesan:req.body.isipesan,subject:req.body.subject,from:req.session.nama,status:req.body.status},function(err,docs){

	})
	db.inbox.insert({attachment:"NO"anggalkirim:req.body.tanggalkirim,statuspesan:"undelete",gambar:req.session.gambar,kepada:req.body.to,isipesan:req.body.isipesan,subject:req.body.subject,from:req.session.nama,status:req.body.status},function(err,docs){
		res.json();
	})
});
app.get("/get_notif",function(req,res){
	db.inbox.find({status:"new",kepada:req.session.nama},function(err,doc){
		res.json(doc);
	})
});
app.get("/get_pesan_li",function(req,res){
	db.inbox.find({kepada:req.session.nama},function(err,doc){
		res.json(doc);
	})
});
app.post("/ubah_notif_pesan",function(req,res){
	db.inbox.update({kepada:req.session.nama},{$set: {status:req.body.status}}, { multi: true },function(err,docs){
		res.json(docs);
	})
});
app.set('view engine', 'ejs');

app.post('/login', function(request, response) {
	var nama = request.body.nama;
	var password = md5(request.body.password);
   db.users.findOne({email:nama,password:password},function(err, results){
	if( results != null){
		if(results.lenght){
		response.redirect("index.html");
	}else{
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        request.session.nama = results.nama;
        request.session.gambar = results.gambar;
		response.redirect("/home");

	}
	}else{
		response.redirect("index.html");
	}
});

});

   app.get('/home', function(req, res) {
    // Prepare the context
    if(req.session.nama == undefined){
		res.redirect("index.html");
	}else{
	res.render('home.ejs',{nama:req.session.nama,gambar:req.session.gambar});
	}
		});
app.get('/logout', function(req, res) {
req.session.destroy(function(err) {
  // cannot access session here
})
res.redirect("index.html");
});

app.post('/insert_user', function(request, response) {

  upload(request, response, function(err) {
	  var password = md5(request.body.password);
console.log(password);
	  db.users.insert({nama:request.body.fullname,email:request.body.email,password:password,gambar:'uploads/'+ request.file.originalname},function(err,docs){

});
  if(err) {
    console.log('Error Occured');
    return;
  }

  console.log(request.file);
  response.end('Your File Uploaded');
  console.log('Photo Uploaded');
  })
});
app.post('/edit_ebook', function(request, response) {

  upload(request, response, function(err) {
	 var id = request.body.id;
db.ebook.findAndModify({query:{_id:mongojs.ObjectId(id)},
update:{$set:{nama:request.body.nama,gambar:'uploads/'+ request.file.originalname}},new:true},function(err,doc){

});
  if(err) {
    console.log('Error Occured');
    return;
  }
   response.json();
  console.log(request.file);
  response.end('Your File Uploaded');
  console.log('Photo Uploaded');
  })
});
app.post("/hapus_ebook",function(req,res){
var id = req.body;
for(i=0;i>id.length;i++){
	console.log(id[i]);
}
	//db.ebook.remove({_id:mongojs.ObjectId(id)},function(err,doc){

	//})
})

/*
app.delete("/hapusmahasiswa:id",function(req,res){
	var id = req.params.id;
	console.log(id);
	db.allmahasiswa.remove({_id:mongojs.ObjectId(id)},function(err,doc){
		res.json(doc);
	})
})*/
app.post("/edit_video",function(req,res){
	var id = req.body.id;
db.video.findAndModify({query:{_id:mongojs.ObjectId(id)},
update:{$set:{nama:req.body.judul,pembuat:req.body.pembuat,url:req.body.url}},new:true},function(err,doc){
res.json(doc);
});
});
app.post("/edit_code",function(req,res){
	var id = req.body.id;
db.code.findAndModify({query:{_id:mongojs.ObjectId(id)},
update:{$set:{judul:req.body.judul,bahasa:req.body.bahasa,isi:req.body.isi}},new:true},function(err,doc){
res.json(doc);
});
});
http.listen(3000);
