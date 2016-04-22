var express = require('express');
var app = express();
var mongojs = require('mongojs');
var multer = require('multer');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('express-session');
var db = mongojs('kursus',["ebook","video","code"]);
var bodyParser=require("body-parser");
app.use(bodyParser.json());
var requestTime = function (req, res, next) {
  req.requestTime = Date.now();
  next();
};
io.on('connection', function(socket){
  socket.on('add_book', function(msg){
		io.emit('notification',msg);
  });
});

app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use('/uploads',express.static(__dirname + '/uploads'));
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
app.get("/view_code",function(req,res){
	db.code.find(function(err,docs){
	  res.json(docs);
  });
});
app.post("/tambah_video",function(req,res){
	db.video.insert(req.body,function(err,docs){
		res.json(docs);
		
})
console.log(req.body);
});
app.post("/tambah_code",function(req,res){
	db.code.insert(req.body,function(err,docs){
		res.json(docs);
		
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