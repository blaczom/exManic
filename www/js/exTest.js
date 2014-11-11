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
.factory('exTestDb', function(exStore){
  return {
    checkResult:function(){
      var l_rtn = true;
      var l_testObj = gTestObj("exStore.verifyBool", exStore.verifyBool('true'));
      if (exStore.verifyBool(1) && exStore.verifyBool('1') && exStore.verifyBool('true')) logOk(l_testObj); else l_rtn = logNo(l_testObj);
      if (exStore.verifyBool(0) || exStore.verifyBool('0') || exStore.verifyBool('false'))  l_rtn = logNo(l_testObj); else logOk(l_testObj);

      exStore.setUserList('dh', 'dh', '1');
      exStore.setUserList('dh2', 'dh2', '1');
      exStore.setUserList('dh3', 'dh3', '0');
      l_testObj = gTestObj("exStore.getUserList", exStore.getUserList());
      if( (l_testObj.obj['dh2'].pass == 'dh2') && (l_testObj.obj['dh3'].rem == false)
        && (l_testObj.obj['dh'].rem)) logOk(l_testObj); else l_rtn = logNo(l_testObj);

      exStore.setUserList('dh2', 'dh2', '1');
      l_testObj = gTestObj("exStore.getUser()", exStore.getUser());
      if (l_testObj.obj.name == 'dh2' && l_testObj.obj.pass == 'dh2') logOk(l_testObj); else l_rtn = logNo(l_testObj);
      l_testObj = gTestObj("exStore.getUser('dh')", exStore.getUser('dh'));
      if (l_testObj.obj.name == 'dh' && l_testObj.obj.pass == 'dh') logOk(l_testObj); else l_rtn = logNo(l_testObj);

      exStore.clearUserList();
      l_testObj = gTestObj("exStore.clearUserList()", exStore.getUserList());
      if ( l_testObj.obj.hasOwnProperty('pass') ) l_rtn = logNo(l_testObj); else logOk(l_testObj);

      return l_rtn;
    }
  }
})
.factory('exTestLocalDb', function(exLocalDb){
  return {
    checkResult:function(){
      var l_rtn = true;
      var l_testObj = gTestObj("exLocalDb.userNew", exLocalDb.userNew());
      if (l_testObj.obj.hasOwnProperty('NICKNAME')) logOk(l_testObj); else l_rtn = logNo(l_testObj);
      l_testObj = gTestObj("exLocalDb.taskNew", exLocalDb.taskNew());
      if (l_testObj.obj.hasOwnProperty('UUID')) logOk(l_testObj); else l_rtn = logNo(l_testObj);

      exLocalDb.runSqlPromise('delete from user where NICKNAME = "inserttest"')
      .then(
        function(aRow){
          exLocalDb.runSqlPromise('insert into user(NICKNAME,PASS,REMPASS) values("inserttest", "pass", 1)')
          .then(
            function(aRow) {
              exLocalDb.runSql("select * from user where NICKNAME =?", 'inserttest',
                function (aErr, aRow) {
                  if (aErr) logNo({name: "exTestLocalDb runSql select ", obj: aErr });
                  else
                    logOk({name: "exTestLocalDb runSql delete->insert->select", obj: aRow})
                }
              );
            },
            function(aErr){
              logNo( {name:"exTestLocalDb runSqlPromise insert ", obj: aErr } );
            }
          )
        }
      ,
        function(aErr){
          logNo( {name:"exTestLocalDb runSqlPromise delete ", obj: aErr } );
        }
      );

      var l_user = exLocalDb.userNew();
      l_user.NICKNAME = 'objinserttest';
      l_user.PASS = 'pass';
      l_user.REM = true;

      var l_genUser = genSave(aUser, 'USER');
      console.log('生成insert的user语句', l_genUser);
      exLocalDb.appendix.setDirty(aUser);
      l_genUser = genSave(aUser, 'USER');
      console.log('生成update的user语句', l_genUser);

      exLocalDb.appendix.setNew(aUser);
      comSave(aUser, 'USER', function(aErr, aRow){
        if (aErr) logNo({name: "comSave user ", obj: aErr });
        else logOk( {name:"comSave user", obj: aRow } );
      });
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
