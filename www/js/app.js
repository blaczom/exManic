angular.module('exManic', ['ionic', 'exManic.services', 'exManic.controllers', 'exManic.test'])
.run(function($ionicPlatform, exLocalDb, exTestUtil, exTestDb, exTestLocalDb) {
    // exTestUtil, exTestDb, exTestLocalDb, exTestController
/*
angular.module('exManic', ['ionic', 'exManic.services', 'exManic.controllers'])
.run(function($ionicPlatform, exLocalDb, exTestUtil) {
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
    exLocalDb.initDb();
    // <script src="/js/exTest.js"></script>
    // exTest, exTest.test();
    console.log("测试exTestUtil", exTestUtil.checkResult());
    console.log("测试exTestDb", exTestDb.checkResult());
    console.log("测试exTestLocalDb", exTestLocalDb.checkResult());

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
  $urlRouterProvider.otherwise('/tab/taskList');

});

