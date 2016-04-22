
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
mainApp.controller("ebook",function(fileEdit,fileUpload,DTOptionsBuilder,$scope,$http){
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
		}
		$scope.getdata=function(){
			$http.get("view_all").success(function(data){
				$scope.ebook = data;
			});
		
		}
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
mainApp.controller("video",function($sce,DTColumnBuilder,DTOptionsBuilder,$scope,$http){
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
				})
			
		
		}
		$scope.getdata=function(){
			$http.get("view_video").success(function(data){
				$scope.video = data;
				socket.emit('add_book', data)
			});
		
		}
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
				socket.emit("add_book",data);
				
			});
		}
			$scope.getdata();
			$scope.tambah= function(){
				var judul = $scope.judul;
				var bahasa = $scope.bahasa;
				var isi = $scope.isi;
				 
				$http.post("tambah_code",{judul:judul,bahasa:bahasa,isi:isi}).success(function(data){
					alert("source sukses disimpan");

					
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
  $scope.series = ['Upload','download'];
  $scope.data=[];
  $scope.nama = [];
 /* $scope.data = [
    [65, 59, 80, 81, 56, 55, 40,90,80,40,70],
    [28, 48, 40, 19, 86, 27, 90,80,50,60,90,30]
  ];*/
  $scope.getdata=function(){
			$http.get("view_code").success(function(data){
				$scope.sourcecode = data;
				//socket.emit("add_book",data);
				
			});
		}
		$scope.getdata();
		
		$scope.getdata1=function(){
			$http.get("view_video").success(function(msg){
				$scope.video = msg;
				socket.emit('add_book',msg)
			});
		
		}
		$scope.getdata1();
  socket.on('notification', function(msg) {
    $scope.$apply(function () {
      $scope.data = [[msg.length],[8]];
 })
  });
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  
})