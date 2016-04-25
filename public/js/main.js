
var mainApp = angular.module("Mainapp", ['ngRoute','datatables','checklist-model','chart.js']);
 mainApp.config(function($routeProvider) {
    $routeProvider
        .when('/ebook', {
            templateUrl: "ebook.html",
			controller :'ebook'
		})
		.when('/video', {
            templateUrl: "video.html",
			controller :'video'
		})
		.when('/code', {
            templateUrl: "code.html",
			controller :'code'
		})
		.when("/statistik",{
			templateUrl:"statistik.html",
			controller:"statistik"
		})
		.when("/userregister",{
			templateUrl:"userregister.html",
			controller:"userregister"
		})
		.when("/pesan",{
			templateUrl:"mailbox.html",
			controller:"pesan"
		})
		.when("/tulis",{
			templateUrl:"compose.html",
			controller:"tulis"
		})
		.when("/terkirim",{
			templateUrl:"terkirim.html",
			controller:"terkirim"
		})
 });
mainApp.factory('socket', ['$rootScope', function($rootScope) {
  var socket = io.connect();

  return {
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  };
}]);
mainApp.directive('fileModel', ['$parse', function ($parse) {
            return {
               restrict: 'A',
               link: function(scope, element, attrs) {
                  var model = $parse(attrs.fileModel);
                  var modelSetter = model.assign;
                 
                  element.bind('change', function(){
                     scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                     });
                  });
               }
            };
         }]);
		mainApp.service('fileUpload', ['$http', function ($http,$scope) {
    this.uploadFileToUrl = function(gambar,nama,namapenulis,uploadUrl){
        var fd = new FormData();
        fd.append('gambar', gambar);
        fd.append('nama', nama);
        fd.append('namapenulis', namapenulis);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data){
			alert("sukses");
			$http.get("view_all").success(function(data){
		ebook = data;
			});
			
        })
        .error(function(){
				alert("data gagal di input");
        });
		
    }
	
}]);
mainApp.service('pesanKirim', ['$http', function ($http,$scope) {
    this.uploadFileToUrl = function(to,subject,isipesan,gambar,uploadUrl){
        var fd = new FormData();
        fd.append('to', to);
        fd.append('subject', subject);
        fd.append('isipesan', isipesan);
        fd.append('gambar', gambar);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data){
			alert("sukses");
			$http.get("view_all").success(function(data){
		ebook = data;
			});
			
        })
        .error(function(){
				alert("data gagal di input");
        });
		
    }
	
}]);
		mainApp.service('fileEdit', ['$http', function ($http,$scope) {
    this.uploadFileToUrl = function(gambar,nama,id,uploadUrl){
        var fd = new FormData();
        fd.append('gambar', gambar);
        fd.append('nama', nama);
        fd.append('id', id);
        fd.append('namapenulis', namapenulis);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data){
			alert("sukses");
			$http.get("view_all").success(function(data){
		ebook = data;
			});
			
        })
        .error(function(){
				alert("data gagal di input");
        });
		
    }
	
}]);
mainApp.controller("ebook",function(socket,fileEdit,fileUpload,DTOptionsBuilder,$scope,$http){
$scope.dtOptions = DTOptionsBuilder.newOptions()
       
		.withDisplayLength(5)
        .withOption('bLengthChange', false)
        .withOption('autoWidth', false)
        .withOption('scrollX', false);
		$scope.tambah=function(){
			var nama = $scope.judul;
			var gambar = $scope.filepdf;
			var ebook = $scope.ebook;
			var namapenulis = $scope.namatulis;
			uploadUrl = "tambah_ebook";
		fileUpload.uploadFileToUrl(gambar,nama,namapenulis,uploadUrl);
		$scope.getdata();
		
		$scope.upload();
		}
		$scope.getdata=function(){
			$http.get("view_all").success(function(data){
				$scope.ebook = data;
			});
		
		}
		
		$scope.upload=function(){
			$http.get("view_upload").success(function(data){
				socket.emit('add_book', data);
			});
		
		}
		$scope.upload();
		$scope.getdata();
		$scope.edit=function(item){
			$scope.id = item._id;
			$scope.judul = item.nama;
			$scope.namatulis = item.namapenulis;
		}
		$scope.view=function(item){
			$scope.judul = item.nama;
			$scope.path = item.gambar;
		
		}
		$scope.actionedit=function(){
			var nama = $scope.judul;
			var id = $scope.id;
			var gambar = $scope.filepdf;
			var namapenulis = $scope.namatulis;
			
			var uploadUrl = "edit_ebook";
		fileEdit.uploadFileToUrl(gambar,nama,id,namapenulis,uploadUrl);
		$scope.getdata();
		
		$scope.upload();
		}
		$scope.user = {
			hapusebook:[]
		}
		$scope.hapus=function(){
			var id = $scope.user;
			$http.post("hapus_ebook",{id:id}).success(function(){
				alert("data sukses dihapus");
				$scope.getdata();
			})
		}
});	
mainApp.filter("trustUrl", ['$sce', function ($sce) {
        return function (recordingUrl) {
            return $sce.trustAsResourceUrl(recordingUrl);
        };
    }]);
mainApp.controller("video",function(socket,$sce,DTColumnBuilder,DTOptionsBuilder,$scope,$http){
$scope.dtOptions = DTOptionsBuilder.newOptions()
       
		.withDisplayLength(5)
        .withOption('bLengthChange', false)
        .withOption('autoWidth', false)
        .withOption('scrollX', false);
		$scope.tambah=function(){
			var nama = $scope.judul;
			var url = $scope.url;
			var pembuat  = $scope.nama;
			$http.post("tambah_video",{nama:nama,url:url,pembuat:pembuat}).success(function(){
				alert("video sudah di tambahkan");
				$scope.getdata();
				$scope.upload();
				})
			
		
		}
		$scope.getdata=function(){
			$http.get("view_video").success(function(data){
				$scope.video = data;
			});
		
		}
		$scope.upload=function(){
			$http.get("view_upload").success(function(data){
				socket.emit('add_book', data);
			});
		
		}
		$scope.upload();
		$scope.getdata();
		$scope.view=function(item){
			$scope.judul = item.nama;
			$scope.url = $sce.trustAsResourceUrl(item.url);
			$scope.nama = item.pembuat;
		}
		$scope.edit = function(item){
			$scope.judul = item.nama;
			$scope.id = item._id;
			$scope.nama = item.pembuat;
			$scope.urlku = item.url;
		}
		$scope.actionedit=function(){
		
               var judul= $scope.judul;
                var pembuat= $scope.nama;
                var url= $scope.urlku;
               var id= $scope.id;
         
			$http.post("edit_video",{judul:judul,pembuat:pembuat,url:url,id:id}).success(function(){
				alert("data sukses di edit");
				$scope.getdata();
			
		$scope.upload();
			})
			
		}
		
});	

mainApp.controller("code",function(socket,DTColumnBuilder,DTOptionsBuilder,$scope,$http){
$scope.dtOptions = DTOptionsBuilder.newOptions()
       
		.withDisplayLength(5)
        .withOption('bLengthChange', false)
        .withOption('autoWidth', false)
        .withOption('scrollX', false);
		$scope.getdata=function(){
			$http.get("view_code").success(function(data){
				$scope.sourcecode = data;
			});
		}
		$scope.upload=function(){
			$http.get("view_upload").success(function(data){
				socket.emit("add_book",data);
				
			});
		}
			$scope.getdata();
			$scope.upload();
			$scope.tambah= function(){
				var judul = $scope.judul;
				var bahasa = $scope.bahasa;
				var isi = $scope.isi;
				 
				$http.post("tambah_code",{judul:judul,bahasa:bahasa,isi:isi}).success(function(data){
					alert("source sukses disimpan");

					$scope.upload();
					$scope.getdata();
				})
			}
			$scope.edit=function(item){
			$scope.judul = item.judul;
		     $scope.bahasa=item.bahasa;
			 $scope.isi = item.isi;
			 $scope.id = item._id;
			}
			$scope.actionedit=function(){
				var judul = $scope.judul;
				var bahasa = $scope.bahasa;
				var isi = $scope.isi;
				var id = $scope.id;
				$http.post("edit_code",{judul:judul,bahasa:bahasa,isi:isi,id:id}).success(function(){
					alert("source sukses diubah");
					$scope.getdata();
				$scope.upload();
				})
			}
			$scope.view=function(item){
				$scope.judul = item.judul;
		     $scope.bahasa=item.bahasa;
			 $scope.isi = item.isi;
			}
});
mainApp.controller("statistik",function(socket,DTColumnBuilder,DTOptionsBuilder,$scope,$http){
 $scope.labels = ["January", "February", "March", "April", "May", "June", "July","Agustus","september","oktober","november","desember"];
  $scope.series = ['Upload'];
  $scope.data=[];
 /* $scope.data = [
    [65, 59, 80, 81, 56, 55, 40,90,80,40,70],
    [28, 48, 40, 19, 86, 27, 90,80,50,60,90,30]
  ];*/
		$scope.getdata1=function(){
			$http.get("view_upload").success(function(msg){
				$scope.video = msg;
				socket.emit('add_book',msg)
			});
		}
		$scope.getdata1();
  socket.on('notification', function(msg) {
    $scope.$apply(function () {
      $scope.data = [[10,20,11,msg.length]];
 })
  });
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  
})
mainApp.controller("userregister",function(socket,DTColumnBuilder,DTOptionsBuilder,$scope,$http){
 $scope.labels = ["January", "February", "March", "April", "May", "June", "July","Agustus","september","oktober","november","desember"];
  $scope.series = ['user yang telah mendaftar'];
  $scope.data=[[3,4,5,6]];
  $scope.getdata1=function(){
			$http.get("view_user").success(function(msg){
				$scope.video = msg;
				socket.emit('view_registered',msg)
			});
		}
		$scope.getdata1();
socket.on('userregister', function(msg) {
    $scope.$apply(function () {
      $scope.data = [[10,20,11,msg.length]];
 })
  });
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
		})
mainApp.controller("pesan",function(socket,DTColumnBuilder,DTOptionsBuilder,$scope,$http){
$scope.dtOptions = DTOptionsBuilder.newOptions()
       
		.withDisplayLength(5)
        .withOption('bLengthChange', false)
        .withOption('autoWidth', false)
        .withOption('scrollX', false);
		$scope.getdata=function(){
			$http.get("view_inbox").success(function(data){
				$scope.inbox = data;
			})
		}
		$scope.getdata();

})
mainApp.controller("tulis",function(pesanKirim,socket,DTColumnBuilder,DTOptionsBuilder,$scope,$http){
$scope.kirim=function(){
	var to  = $scope.to;
	var subject = $scope.subject;
	var isipesan = $scope.pesan;
	var gambar = $scope.attachment;
	var uploadUrl = "kirim_pesan";
	pesanKirim.uploadFileToUrl(to,subject,isipesan,gambar,uploadUrl);
	
}
})
mainApp.controller("terkirim",function(socket,DTColumnBuilder,DTOptionsBuilder,$scope,$http){
$scope.jumlah="2";
$scope.dtOptions = DTOptionsBuilder.newOptions()
       
		.withDisplayLength(5)
        .withOption('bLengthChange', false)
        .withOption('autoWidth', false)
        .withOption('scrollX', false);
$scope.getdata=function(){
	$http.get("view_terkirim").success(function(data){
		$scope.terkirim = data;
	})
	
}
$scope.getdata();
})
