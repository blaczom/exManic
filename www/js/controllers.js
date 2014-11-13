angular.module('exManic.controllers', [])

  .controller('taskListCtrl', function($scope, Friends) {
    var lp = $scope;
    lp.title = "任务列表";
    $scope.friends = Friends.all();
  })
  .controller('taskDetailCtrl', function($scope, $stateParams, Friends) {
    $scope.friend = Friends.get($stateParams.friendId);
  })
  .controller('registCtrl', function($scope,exAccess,exStore) {
    // userReg
    var lp = $scope;
    lp.user = exAccess.user.new();
    // lp.user.authCode = "";
    lp.rtnInfo = "";
    lp.userReg = function(){
      var l_cache = angular.copy(lp.user);
      exAccess.userRegPromise(lp.user).
        then(function (data) {
          lp.rtnInfo = data.rtnInfo;
          exStore.setUserList(l_cache.NICKNAME, l_cache.PASS, 0);
        } , function (status) {
          lp.rtnInfo = JSON.stringify(status);
        });
    };
  })
  .controller('loginCtrl',  function($scope,$location,exAccess,exStore,$rootScope) {
    var lp = $scope;
    lp.user = exAccess.user.new();
    var l_remUser = exStore.getUser();
    lp.user.NICKNAME = l_remUser.name;   // getUser: function(){  // return {name:, pass:, rempass:}
    lp.user.REMPASS =   l_remUser.rempass;
    if (l_remUser.rempass) lp.user.pass = l_remUser.pass;
    lp.rtnInfo = "";
    lp.userLogin = function () {
      exAccess.userLoginPromise(lp.user).then( function(data) {
        if (data.rtnCode > 0) {
          exStore.setUserList(lp.user.NICKNAME, lp.user.PASS, lp.user.REMPASS);
          $rootScope.$broadcast('event:login');
          $location.path('/tab/taskList');
        }
        else{
          lp.rtnInfo = data.rtnInfo;
        }
      }, function (error) {  lp.rtnInfo = JSON.stringify(status); });
    };
  })
  .controller('testCtrl', function($scope,exUtil,exAccess){
    var lp = $scope;
    lp.obj = { word:"", sql:""};
    lp.test1 = exUtil.createUUID();
    lp.postReq = function(){
      exAccess.extoolsPromise( lp.obj )
        .then(function (data) {
          lp.txtReturn = JSON.stringify(data);
        } , function (status) {
          lp.txtReturn = JSON.stringify(status);
        });
    };
  })
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
  })
  .controller("indexTitleRightCtrl", function($scope, exStore){
    var lp = $scope;
    lp.loginUser = "";
    $scope.$on('event:login', function(){
      lp.loginUser = exStore.getUser();
    });

  });
;
