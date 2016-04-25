
var mainApp = angular.module("cadangan", ['ngRoute','datatables','checklist-model','chart.js']);
 mainApp.config(function($routeProvider) {
    $routeProvider
        .when('/inbox', {
            templateUrl: "inbox.html",
			controller :'inbox'
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
mainApp.controller("inbox",function(socket,DTColumnBuilder,DTOptionsBuilder,$scope,$http){
})