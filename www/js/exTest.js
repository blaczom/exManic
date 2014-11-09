/**
 * Created by blaczom on 2014/11/9.
 */
var gTestObj = function(aName, aObj) {
  return {
    name : aName,
    obj : aObj  // 返回对象
  }
};

var logOk = function(aObj){
  console.log(aObj.name + "测试成功:->", aObj.obj);
};
var logNo = function(aObj){
  console.log(aObj.name + "测试失败:->", aObj.obj);
  return false;
};

angular.module('exManic.test', ['exManic.services', 'exManic.controllers'])
.factory('exTestUtil', function(exUtil){
  return {
    checkResult: function(){
      var l_rtn = true;
      var l_testObj = gTestObj("exUtil.createUUID", exUtil.createUUID());
      if (l_testObj.obj.length > 20) logOk(l_testObj); else l_rtn = logNo(l_testObj);

      l_testObj = gTestObj("exUtil.getDateTime", exUtil.getDateTime(new Date()));
      if (l_testObj.obj.length > 12) logOk(l_testObj); else l_rtn = logNo(l_testObj);

      l_testObj = gTestObj("exUtil.getDate", exUtil.getDate(new Date()));
      if (l_testObj.obj.length == 10) logOk(l_testObj); else l_rtn = logNo(l_testObj);

      return l_rtn;
    }
  }
})
.factory('exTestDb', function(exDb){
  return {
    none:""
  }
})
.factory('exTestLocalDb', function(exLocalDb){
  return {
    none:""
  }
})
.factory('exTestController', function(exLocalDb){
  return {
    none:"loginCtrl"
  }
});

/*
  app.js 关于路由的用curl来测试。

*/
