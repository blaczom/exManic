/**
 * Created by blaczom on 2014/11/9.
 *
 ========== usage:  增加引用到index文件。 ======
 <script src="/js/exTest.js"></script>
 exTest, exTest.test();
 在angular中增加模块引用:
 angular.module('exManic', ['ionic', 'exManic.services', 'exManic.controllers', 'exManic.test'])
 .run(function($ionicPlatform, exLocalDb, exTestUtil, ....) {
    console.log("测试exTestUtil", exTestUtil.checkResult());

 *
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
  console.log("------测试失败:---->" + aObj.name, aObj.obj);
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
    checkResult:function(){
      var l_rtn = true;
      var l_testObj = gTestObj("exDb.userNew", exDb.userNew());
      if (l_testObj.obj.hasOwnProperty('NICKNAME')) logOk(l_testObj); else l_rtn = logNo(l_testObj);
      l_testObj = gTestObj("exDb.taskNew", exDb.taskNew());
      if (l_testObj.obj.hasOwnProperty('UUID')) logOk(l_testObj); else l_rtn = logNo(l_testObj);

      l_testObj = gTestObj("exDb.verifyBool", exDb.verifyBool('true'));
      if (exDb.verifyBool(1) && exDb.verifyBool('1') && exDb.verifyBool('true')) logOk(l_testObj); else l_rtn = logNo(l_testObj);
      if (exDb.verifyBool(0) || exDb.verifyBool('0') || exDb.verifyBool('false'))  l_rtn = logNo(l_testObj); else logOk(l_testObj);

      exDb.setUserList('dh', 'dh', '1');
      exDb.setUserList('dh2', 'dh2', '1');
      exDb.setUserList('dh3', 'dh3', '0');
      l_testObj = gTestObj("exDb.getUserList", exDb.getUserList());
      if( (l_testObj.obj['dh2'].pass == 'dh2') && (l_testObj.obj['dh3'].rem == false)
        && (l_testObj.obj['dh'].rem)) logOk(l_testObj); else l_rtn = logNo(l_testObj);

      exDb.setUserList('dh2', 'dh2', '1');
      l_testObj = gTestObj("exDb.getUser()", exDb.getUser());
      if (l_testObj.obj.name == 'dh2' && l_testObj.obj.pass == 'dh2') logOk(l_testObj); else l_rtn = logNo(l_testObj);
      l_testObj = gTestObj("exDb.getUser('dh')", exDb.getUser('dh'));
      if (l_testObj.obj.name == 'dh' && l_testObj.obj.pass == 'dh') logOk(l_testObj); else l_rtn = logNo(l_testObj);

      exDb.clearUserList();
      l_testObj = gTestObj("exDb.clearUserList()", exDb.getUserList());
      if ( l_testObj.obj.hasOwnProperty('pass') ) l_rtn = logNo(l_testObj); else logOk(l_testObj);

      return l_rtn;
    }
  }
})
.factory('exTestLocalDb', function(exLocalDb){
  return {
    checkResult:function(){
      exLocalDb.runSqlPromise('insert into user(NICKNAME,PASS,REMPASS) values("dh", "dhpass", 1)')
      .then(
        function(aRow){
          exLocalDb.runSql("select * from user where name =?", 'dh', function(aErr, aRow){
            if (aErr) logNo( {name:"exTestLocalDb runSqlPromise ok but runSql err", obj: aErr } );
            else
              logOk({name:"exTestLocalDb runSqlPromise & runSql", obj: aRow})
          })
        },
        function(aErr){
          logNo( {name:"exTestLocalDb runSqlPromise2 ", obj: aErr } );
        }
      )
    }
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
