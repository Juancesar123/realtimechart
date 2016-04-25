var express = require('express');
var app = express();
var mongojs = require('mongojs');
var multer = require('multer');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('express-session');
var db = mongojs('kursus',["ebook","video","code","users","upload","pesan_terkirim","inbox"]);
var bodyParser=require("body-parser");
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
var requestTime = function (req, res, next) {
  req.requestTime = Date.now();
  next();
};
io.on('connection', function(socket){
  socket.on('add_book', function(msg){
		io.emit('notification',msg);
  });
   socket.on('view_registered', function(msg){
		io.emit('userregister',msg);
  });
});
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
app.use('/bower_components',express.static(__dirname + '/bower_components'));
app.get("/view_all",function(req,res){
	db.ebook.find(function(err,docs){
	  res.json(docs);
  });
});

app.get("/view_video",function(req,res){
	
	db.video.find(function(err,docs){
	res.json(docs);	
  });
});
app.get("/view_inbox",function(req,res){
	
	db.inbox.find(function(err,docs){
	res.json(docs);	
  });
});
app.get("/view_terkirim",function(req,res){
	db.pesan_terkirim.find({email:req.session.nama},function(err, docs){
	res.json(docs);	
  });
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
	  db.ebook.insert({nama:request.body.nama,gambar:'uploads/'+ request.file.originalname,namapenulis:request.body.namapenulis},function(err,docs){
 
});
 db.upload.insert(request.body,function(err,docs){
		
		
})
  if(err) {
    console.log('Error Occured');
    return;
  }
  
  console.log(request.file);
  response.end('Your File Uploaded');
  console.log('Photo Uploaded');
  })
});
app.post('/kirim_pesan', function(request, response) {

  upload(request, response, function(err) {
	  db.pesan_terkirim.insert({kepada:request.body.to,file:'uploads/'+ request.file.originalname,isipesan:request.body.isipesan,subject:request.body.subject,email:request.session.nama},function(err,docs){
 
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
app.set('view engine', 'ejs');

app.post('/login', function(request, response) {
	var nama = request.body.nama;
   db.users.findOne({email:nama},function(err, results){
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
app.get('/foobar', function(req, res, next) {
  var sess = req.session
  if (sess.views) {
    sess.views++
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>views: ' + sess.views + '</p>')
    res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>')
    res.end()
  } else {
    sess.views = 1
    res.end('welcome to the session demo. refresh!')
  }
})	
   app.get('/home', function(req, res) {
    // Prepare the context
    
	res.render('home.ejs',{nama:req.session.nama,gambar:req.session.gambar});
		});
app.get('/logout', function(req, res) {
req.session.destroy(function(err) {
  // cannot access session here
})
res.redirect("index.html");
});

app.post('/insert_user', function(request, response) {

  upload(request, response, function(err) {
	  db.users.insert({nama:request.body.fullname,email:request.body.email,password:request.body.password,gambar:'uploads/'+ request.file.originalname},function(err,docs){
 
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