angular.module('starter.controllers', ['exFactory'])

  .controller('DashCtrl', function($scope) {
      $scope.items = [{title:'1', descripton:'1'}, {title:'2', descripton:'2'}]
  })



  .controller('FriendsCtrl', function($scope, Friends) {
    $scope.friends = Friends.all();
  })

  .controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
    $scope.friend = Friends.get($stateParams.friendId);
  })

  .controller('AccountCtrl', function($scope) {
  })

  .controller('AppCtrl', function(){return;} )

  .controller('TestCtrl', function(){return;} )

  .controller('LoginCtrl', ['$scope','$location','exDb','exAccess',function($scope,$location,exDb,exAccess) {

        var lp = $scope;
        lp.user = exDb.userNew();
        lp.user.NICKNAME =exDb.getUser();
        lp.user.REMPASS =   exDb.getRem();
        lp.runPlatform = exDb.getPlat();
        if (lp.user.REMPASS) lp.user.PASS = exDb.getWord();
        lp.rtnInfo = "";
        lp.userLogin = function () {
          exAccess.userLoginPromise(lp.user).then( function(data) {
            if (data.rtnCode > 0) {
              exDb.setUser(lp.user.NICKNAME);
              exDb.setRem(lp.user.REMPASS);
              exDb.setPlat(lp.runPlatform)
              if (lp.user.REMPASS) exDb.setWord(lp.user.PASS);
              $location.path('/taskList/main');
            }
            else{
              lp.rtnInfo = data.rtnInfo;
            }
          }, function (error) {  lp.rtnInfo = JSON.stringify(status); });
        };
      }])

  .controller('index', function($scope, $ionicModal) {
    $ionicModal.fromTemplateUrl('my-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.openMenu = function(){
      $scope.showMenu = false;
    };
    $scope.showMenu = true;
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });
  });


;
