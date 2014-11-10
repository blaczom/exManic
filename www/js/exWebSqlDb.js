/**
 * Created by blaczom@gmail on 2014/10/26.
 * inlude this file under services.js
 */

angular.module('exManic.services').
factory('exLocalDb', ['$q', '$window','exDb', function($q, $window,exDb){
  var gdb =  $window.openDatabase("exManicClient", '1.0', 'exManic Client Database', 2000000);
  var initDb = function() {
    exDb.log("--- checking databse file ---");
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
          exDb.log(l_run[i]);
          tx.executeSql(l_run[i], [],
            function(tx,success){},
            function(tx,err){ exDb.log(err.message) } );
        }
      },
      function (tx, err) {
        exDb.log('fail!!! create database failed!');
        exDb.log(err);
      },
      function () {
        exDb.log(' -- check dabase successful over -- ');
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
    exDb.log("--exLocal runsql with param: --" + aSql, aParam);
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
    exDb.log("runsql run here with param: " + aSql, aParam);
    gdb.transaction(
        function(tx) {
            tx.executeSql(aSql, aParam
              ,function(tx, aData){exDb.log("client run sql ok:", aSql, aData); aCallback(null, trans2Json(aData) ) },
               function(tx, aErr){ exDb.log("client run sql err:", aErr.message); aCallback(aErr.message, null) }
            );
        }
    );
  };


  return {
    runSql: runSql,
    runSqlPromise: runSqlPromise,
    initDb: initDb
  }

}]);

