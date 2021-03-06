// /* 测试脚本
angular.module('exManic', ['ionic', 'exManic.services', 'exManic.controllers', 'exManic.test'])
.run(function($ionicPlatform,exLocalDb,exTestUtil,exTestDb,exTestLocalDb,exTestAccess,$timeout) {
// */

/*  跳过测试脚本。
angular.module('exManic', ['ionic', 'exManic.services', 'exManic.controllers'])
.run(function($ionicPlatform, exLocalDb) {
*/
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    //exLocalDb.initDb();

     /* 这里是测试脚本，可以跳过。
    $timeout( function() {console.log("====测试exUtil  ", exTestUtil.checkResult()); },2000)
    .then( function() { console.log("====测试exStore   ", exTestDb.checkResult());})
    .then(function() { console.log("=====测试exLocalDb ", exTestLocalDb.checkResult()); })
    .then(function() { console.log("=====测试exAccess ", exTestAccess.checkResult()); });
    // */
  });


})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })
    // Each tab has its own nav history stack:
    .state('tab.taskList', {
      url: '/taskList',
      views: {
        'tab-taskList': {
          templateUrl: 'templates/tab-taskList.html',
          controller: 'taskListCtrl'
        }
      }
    })
    .state('tab.task-detail', {
      url: '/detail/:taskId',
      views: {
        'tab-detail': {
          templateUrl: 'templates/task-detail.html',
          controller: 'taskDetailCtrl'
        }
      }
    })
    .state('tab.regist', {
      url: '/reg',
      views: {
        'tab-regist': {
          templateUrl: 'templates/tab-regist.html',
          controller: 'registCtrl'
        }
      }
    })
    .state('tab.login', {
      url: '/login',
      views: {
        'tab-login': {
          templateUrl: 'templates/tab-login.html',
          controller: 'loginCtrl'
        }
      }
    })
    .state('tab.test', {
      url: '/test',
      views: {
        'tab-test': {
          templateUrl: 'templates/tab-test.html',
          controller: 'testCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/login');

})
;

