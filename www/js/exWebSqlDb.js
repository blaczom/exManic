/**
 * Created by blaczom@gmail on 2014/10/26.
 * inlude this file under services.js
 */
var rtnErr = function(aMsg, aErr) {
  return { "rtnInfo": JSON.stringify(aMsg), rtnCode: -1, "alertType": 0, error: JSON.stringify(aErr), exObj:{} }
};
var rtnMsg = function(aMsg) {
  return { "rtnInfo": aMsg, rtnCode: 1, "alertType": 0, error: [], exObj:{} }
};
var appendix = {
  setDirty : function(aParm) { aParm._exState = 'dirty' },
  setNew : function(aParm) { aParm._exState = 'new' },
  setClean : function(aParm) { aParm._exState = 'clean' }
}

angular.module('exManic.services').
factory('exLocalDb',['$q','$window','exStore','exUtil',function($q,$window,exStore,exUtil){
  var gdb =  $window.openDatabase("exManicClient", '1.0', 'exManic Client Database', 2000000);
  var initDb = function() {
    exStore.log("--- checking databse file ---");
    var l_run = [];
    l_run.push("CREATE TABLE if not exists USER(NICKNAME NVARCHAR2(32) NOT NULL PRIMARY KEY, " +
      " PASS CHAR(32) NOT NULL, REMPASS BOOLEAN)");
    l_run.push("CREATE TABLE if not exists TASK(UUID CHAR(32) NOT NULL PRIMARY KEY, UPTASK CHAR(32), " +
      " PLANSTART DATETIME, PLANFINISH DATETIME, FINISH DATETIME, STATE NCHAR(2), OWNER NVARCHAR2(32), " +
      " CONTENT NVARCHAR2(6000), MEMPOINT NVARCHAR2(20), MEMEN BOOLEAN, MEMTIMER DATETIME, MEDIAFILE NVARCHAR2(6000))");
    l_run.push("CREATE INDEX if not exists [idx_task_owner] ON [TASK] ([OWNER] ASC);");
    l_run.push("CREATE INDEX if not exists [idx_task_state] ON [TASK] ([STATE] ASC);");
    l_run.push("CREATE INDEX if not exists [idx_task_planfinish] ON [TASK] ([PLANFINISH] DESC);");
    gdb.transaction(
      function (tx) {
        for (var i in l_run) {
          exStore.log(l_run[i]);
          tx.executeSql(l_run[i], [],
            function(tx,success){},
            function(tx,err){ exStore.log(err.message) } );
        }
      },
      function (tx, err) {
        exStore.log('fail!!! create database failed!');
        exStore.log(err);
      },
      function () {
        exStore.log(' -- check dabase successful over -- ');
      }
    );
  };
  var trans2Json = function (aData){      // 将websql的返回数据集 {} ，转化为data数组的json记录。
    var la_item = [];
    for (var i = 0; i < aData.rows.length; i ++ )
      la_item.push(aData.rows.item(i));
    return angular.copy(la_item);
  };
  var runSqlPromise = function (aSql, aParam)  {
    if (aParam) { if (toString.apply(aParam) !== "[object Array]") aParam = [aParam]; }
    else
      aParam = [];
    exStore.log("-- runSqlPromise with param: --" + aSql, aParam);
    var deferred = $q.defer();
    gdb.transaction( function(tx) {
        tx.executeSql(aSql, aParam,
            function(tx, aData) { deferred.resolve(trans2Json(aData)) },
            function(tx, error) { deferred.reject(error.message) }
        )
    });
    return deferred.promise;
  };
  var runSql = function(aSql, aParam, aCallback) {
    if (toString.apply(aParam) !== "[object Array]") aParam= [aParam];
    exStore.log("-- runsql run here with param: --" + aSql, aParam);
    gdb.transaction(
        function(tx) {
            tx.executeSql(aSql, aParam
              ,function(tx, aData){exStore.log("client run sql ok:", aSql, aData); aCallback(null, trans2Json(aData) ) },
               function(tx, aErr){ exStore.log("client run sql err:", aErr.message); aCallback(aErr.message, null) }
            );
        }
    );
  };
  var genSave = function (aObj, aTable) {    //  列名必须大写。第一字母小写的不生成。 返回sql和 执行参数。
    if (!aObj._exState) {
      exStore.log("genSave get a wrong db object." + aObj);
      return [null, null];
    }
    var l_cols = [], l_vals = [], l_quest4vals=[],  l_pristine = [];
    for (var i in aObj) {    // 列名， i， 值 aObj[i]. 全部转化为string。
      var l_first = i[0];
      if (l_first != '_' && l_first!='$' && l_first == l_first.toUpperCase() ) { // 第一个字母_并且是大写。
        var lsTmp = (aObj[i]==null) ? "" : aObj[i];
        switch (typeof(lsTmp)) {
          case "string": case "boolean":case "object":
          l_cols.push(i);
          l_vals.push("'" + lsTmp + "'");
          l_quest4vals.push("?");
          l_pristine.push(lsTmp);
          break;
          case "number":
            l_cols.push(i);
            l_vals.push(lsTmp);
            l_quest4vals.push('?');
            l_pristine.push(lsTmp);
            break;
          case "function":
            break;
          default:
            exStore.log("-- genSave don't now what it is-" + i + ":" + aObj[i] + ":" + typeof(lsTmp));
            process.exit(-100);
            l_cols.push(i);
            l_vals.push(aObj[i].toString());
            l_quest4vals.push('?');
            l_pristine.push(lsTmp);
            break;
        }
      }
    }
    var l_sql="";
    switch (aObj._exState) {
      case "new": // db.run("INSERT INTO foo() VALUES (?)", [1,2,3], function() {
        ls_sql = "insert into " + aTable + '(' + l_cols.join(',') + ") values ( " + l_quest4vals.join(',') + ')';
        break;
      case "dirty": // update table set col1=val, col2="", where uuid = "";
        var lt = [];
        for (i = 0 ; i < l_cols.length; i ++) lt.push(l_cols[i] + "=" + l_quest4vals[i] );
        if ('USER,'.indexOf(aTable.toUpperCase()) >= 0 )
          ls_sql = "update " + aTable + ' set ' + lt.join(',') + " where NICKNAME = '" + aObj['NICKNAME'] +"'";
        else
          ls_sql = "update " + aTable + ' set ' + lt.join(',') + " where uuid = '" + aObj['UUID'] +"'";
        break;
      default : // do nothing.
        ls_sql = "";
    }
    return [ls_sql, l_pristine];   // 返回一个数组。前面是语句，后面是参数。f
  };
  var comSave = function(aTarget, aTable, aCallback) {
      l_gen = genSave(aTarget, aTable);  // 返回一个数组，sql和后续参数。
    exStore.log("com save run here with param: ", l_gen);
      gdb.transaction(
        function(tx) {
          tx.executeSql(l_gen[0], l_gen[1],
            function(tx, aData){ aCallback(null, trans2Json(aData)) },
            function(tx, aErr){ exStore.log(aErr.message); aCallback(aErr.message, null) }
          );
        }
      );
    };
  var objUser = function(){
    this.NICKNAME = '';
    this.PASS = '';
    this.REMPASS = '';
    this._exState = "new";  // new , clean, dirty.

    objUser.prototype.new = function(){ return new objUser(); };
    objUser.prototype.save = function (aUser, aCallback){  comSave(aUser, 'USER', aCallback); };
    objUser.prototype.delete = function(aUUID, aCallback){
      runSql("delete from USER where UUID = '?'", aUUID, function (err, row) {
        if (err) {  console.log("delete user Error: " + err.message);   }
        aCallback(err, row);
      });
    };
    objUser.prototype.getByNickName = function (aNick, aCallback) {
      runSql("select * from user where NICKNAME= ?" , aNick, aCallback);
    }
  };
  var objTask = function(){
    this.UUID = exUtil.createUUID();
    this.UPTASK = '';
    this.PLANSTART = exUtil.getDateTime(new Date());
    this.PLANFINISH = exUtil.getDateTime(new Date( new Date() - 0 + 1*86400000));
    this.FINISH = '';
    this.OWNER = '';
    this.CONTENT = '';
    this.MEMPOINT = '';
    this.MEMEN = '';
    this.MEMTIMER = '';
    this.MEDIAFILE = '';
    this.STATE = '';
    this._exState='new';

    objTask.prototype.new = function(){ return new objTask(); };
    objTask.prototype.save = function (aTask, aCallback) {  comSave(aTask, 'TASK', aCallback); };
    objTask.prototype.delete = function(aUUID, aCallBack){
      runSql("delete from TASK where UUID = ?", aUUID, function (err, row) {
        if (err) {  console.log("delete task Error: " + err.message);   }
        aCallBack(err, row);
      });
    };
    objTask.prototype.getByUUID = function (aUUID, aCallback) {
      runSql("select * from task where UUID=?", aUUID ,aCallback);
    };
  };

  var getSubList = function(aSql, aParam, aWithSub, aCallback){  // 得到指定的任务下面的任务数量。
    runSql(aSql, aParam, function(aErr, aRtn) {
      if (aErr) aCallback(aErr);
      else {
        var l_exObj = aRtn?aRtn:[];
        if (aWithSub) {
          var stackSubQ = [];
          for (var i in l_exObj) { // 对返回的所有数据集进行处理。
            stackSubQ.push( runSqlPromise("select count(*) as SUBCOUNT, state as SUBSTATE from task where uptask='" + l_exObj[i].UUID + "' group by STATE", []) )
          }
          $q.all(stackSubQ).then(function(row2){
            var l_a = [0,0,0];
            for (var i in row2) {
              if (row2[i].length > 0 ){
                for (var ii in row2[i]) {
                  var l_rtn = row2[i][ii]
                  switch (l_rtn.SUBSTATE) {
                    case '结束':
                      l_a[2] = l_rtn.SUBCOUNT;
                      break;
                    case '进行':
                      l_a[1] = l_rtn.SUBCOUNT;
                      break;
                    case '计划':
                      l_a[0] = l_rtn.SUBCOUNT;
                      break;
                  }
                }
                l_exObj[i].subTask = l_a.join('|');
              }
              else   l_exObj[i].subTask = "nosub";
            }
            aCallback(null, l_exObj);
          }, function(){ console.log(arguments);   aCallback('查询失败',null)});
        }
        else
        {
          aCallback(null, l_exObj);
        }
      }
    });
  };




  return {
    runSql: runSql,
    runSqlPromise: runSqlPromise,
    initDb: initDb,
    db: gdb,
    userNew: function() { return new objUser() },
    taskNew: function() { return new objTask() },
    taskState : ['计划','进行','结束'],
    memPoint : '1,1,2,4,7,15',
    appendix : appendix
  };
}]);

