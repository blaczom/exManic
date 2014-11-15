angular.module('exManic.controllers', [])

  .controller('taskListCtrl', function($scope, Friends) {
    var lp = $scope;
    app.controller("ctrlTaskList",['$scope','$location','exStore','exAccess','exUtil',function($scope,$location,exStore,exAccess,exUtil){
      var lp = $scope;

      lp.ser = {    // 发送到server端。
        seek: { seekContentFlag: false, seekContent : "",   // 是否search任务内容。
                seekStateFlag : true,  seekState : ['计划','进行'],  // 是否search任务状态。
                seekUserFlag : true, seekUser : exStore.getUser().name     // 是否按照用户搜索
        }
      };
      lp.loc = {     // 本地变量
        taskSet:[],      //taskSet当前网页的数据集合。查询条件改变。要重头来。
        locate : { curOffset: 0,  // 当前查询的偏移页面量。  -- 查询条件改变。要重头来。
                    limit: 10      // 当前查询显示限制
        },
        curIndex : null,    //当前编辑的索引值
        rtnInfo : "",
        planState : exAccess.planState,
        editMode : "list"    // 是否在单记录编辑模式。
      };

      lp.taskEditMask = function(aShow){
        switch (aShow){
          case 'editsave':
            lp.loc.editMode = 'list';
            break;
          case 'editcancel':
            lp.loc.rtnInfo = "";
            lp.loc.editMode = 'list';
            break;
          case 'editdelete':
            lp.loc.editMode = 'list';
            break;
          case 'usercancel':
            lp.loc.rtnInfo = "";
            lp.loc.editMode = 'edit';
            break;
          case 'usersave':
            lp.loc.rtnInfo = "";
            lp.loc.editMode = 'edit';
            break;
          case 'listadd':
          case 'listedit':
            lp.loc.rtnInfo = "";
            lp.loc.editMode = 'edit';
            break;
          case 'userSelect':
            lp.loc.rtnInfo = "";
            lp.loc.editMode = 'user';
            break;
        }
      };
      lp.taskAdd = function(aIndex){   // 增加和编辑。
        lp.loc.curIndex = aIndex;
        lp.loc.task = exAccess.task.new();
        lp.loc.task.OWNER = exStore.getUser().name;
        lp.loc.task.STATE = '计划';
        lp.loc.task._exState = 'new';
        if(aIndex != null){
          lp.loc.task.UPTASK = lp.loc.taskSet[aIndex].UUID;
        }
        lp.taskEditMask("listadd");
      };
      lp.taskEdit = function(aIndex){
        lp.loc.curIndex = aIndex;
        lp.loc.task = lp.loc.taskSet[aIndex];
        console.log('taskEdit ', aIndex, lp.loc.task, lp.loc.taskSet);
        lp.loc.pristineTask = angular.copy(lp.loc.taskSet[aIndex]);
        lp.loc.task._exState = 'dirty';
        lp.loc.task.PRIVATE = (lp.loc.task.PRIVATE=="true" || lp.loc.task.PRIVATE==true)?true:false;
        lp.taskEditMask("listedit");
      };
      lp.taskSave = function(){
        if (lp.loc.task.STATE == exAccess.planState[2] && (lp.loc.task.FINISH||'').length==0) lp.loc.task.FINISH = exUtil.getDateTime(new Date());
        exAccess.taskSavePromise(lp.task)
          .then( function (data) {    // 得到新的消息
            lp.loc.rtnInfo = data.rtnInfo;
            switch (lp.loc.task._exState) {
              case 'dirty':
                lp.loc.task._exState = "clean";
                lp.loc.taskSet[lp.loc.curIndex] = lp.loc.task;
                break;
              case 'new':
                lp.loc.task._exState = "clean";
                lp.loc.taskSet.unshift(lp.loc.task);
                break;
            }
            lp.loc.taskEditMask("editsave");
          }, function (status) { lp.loc.rtnInfo = JSON.stringify(status); } );
      };
      lp.taskCancel = function(){
        lp.taskEditMask("editcancel");
        if (lp.loc.curIndex >= 0  && lp.loc.task._exState!="new") lp.loc.taskSet[lp.loc.curIndex] = lp.loc.pristineTask;
      };
      lp.taskDelete = function(){
        exAccess.taskDeletePromise(lp.loc.task)
          .then(function (data) {    // 得到新的消息
            lp.loc.rtnInfo = data.rtnInfo;
            if (data.rtnCode > 0){
              for (var i in lp.loc.taskSet){
                if (lp.loc.taskSet[i].UUID == lp.loc.task.UUID) {
                  if (lp.showDebug) console.log("get it delete " + lp.loc.task.UUID);
                  lp.loc.taskSet.splice(i,1);
                  lp.taskEditMask("editdelete");
                  break;
                }
              }
            }
          }, function (status) {
            lploc..rtnInfo = JSON.stringify(status); }
        );
      };
      lp.taskfilter = function(){
        //参数重置。
        lp.loc.taskSet = [];  // 当前网页的数据集合。     -- 查询条件改变。要重头来。
        lp.loc.locate.curOffset = 0;  // 当前查询的偏移页面量。  -- 查询条件改变。要重头来。
        lp.loc.locate.limit = 10;      // 当前查询显示限制。
        lp.loc.noData = false;
        if  (lp.ser.seek.seekUserFlag && ((lp.ser.seek.seekUser||'').length == 0)) lp.ser.seek.seekUserFlag = false;
        lp.taskGet();   // 应该把状态push进去，否则还是按照原来的逻辑进行get。
      };
      lp.taskGet = function(){
        exAccess.taskListGetPromise(lp.loc.locate, lp.ser.seek)
          .then(function (data) {    // 得到新的消息
            if (!exDb.checkRtn(data)) return ;
            lp.loc.rtnInfo = data.rtnInfo;
            var ltmp1 = data.exObj;
            if (ltmp1.length > 0){
              lp.loc.locate.curOffset = lp.loc.locate.curOffset + lp.loc.locate.limit;
              for (var i=0; i< ltmp1.length; i++)
                ltmp1._exState = "clean";
              lploc..taskSet = lp.loc.taskSet.concat(ltmp1); // 防止新增加的，再检索出来重复~~
              var hashKey  = {}, lRet = [];
              for (var i in lp.loc.taskSet) {
                var key = lp.loc.taskSet[i].UUID;
                if (hashKey[key] != 1) { hashKey[key] = 1; lRet.push(lp.loc.taskSet[i]);}
              }
              lp.loc.taskSet = lRet;
              if (ltmp1.length < lp.loc.locate.limit ) lp.loc.noData = true;
            }
          },function (status) {
            lp.loc.rtnInfo = JSON.stringify(status);
          });
      };
      lp.selectUser = function(){
        (lp.loc.allSelectUser = lp.loc.task.OUGHT.split(',')).pop();
        exAccess.getAllUserPromise().then( function (data) {
          var lrtn = data.exObj;
          lp.loc.allOtherUser =[];
          console.log(lrtn);
          for (var i in lrtn) {  if (lploc..task.OUGHT.indexOf(lrtn[i].NICKNAME + ",") < 0 ) lp.allOtherUser.push(lrtn[i].NICKNAME); };
          lp.loc.taskEditMask('userSelect');
        }, function (reason) { console.log(reason); lp.loc.allOtherUser = []  });

      };
      lp.selectUserMoveOut = function(aInOut, aArray){

        if (aInOut) {   // out
          for (var i in aArray){
            lp.loc.allSelectUser.splice( lp.loc.allSelectUser.indexOf(aArray[i]) ,  1);
            lp.loc.allOtherUser.push(aArray[i]);
          }
        }
        else{
          for (var i in aArray){
            lp.loc.allOtherUser.splice(lp.loc.allOtherUser.indexOf(aArray[i]), 1);
            lp.loc.allSelectUser.push(aArray[i]);
          }
        }
      };
      lp.selectUserOk = function(){
        /// 根据选中的用户进行。
        lp.loc.task.OUGHT = lp.loc.allSelectUser.join(",") + ",";
        lp.taskEditMask('usersave');
      };
      if (!(lp.loc.taskSet.length > 0))
        lp.taskfilter();  // 默认来一次。 //

    }]);
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
