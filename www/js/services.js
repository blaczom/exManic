angular.module('exManic.services', ['angular-md5'])

.factory('Friends', function() {
  // Some fake testing data
  var friends = [
    { id: 0, name: 'Scruff McGruff' },
    { id: 1, name: 'G.I. Joe' },
    { id: 2, name: 'Miss Frizzle' },
    { id: 3, name: 'Ash Ketchum' }
  ];
  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
})
.factory('exUtil', function(){
  // 生成客户端数据库的主键。
  var UUID = function(){};
  UUID.prototype.valueOf = function(){ return this.id; };
  UUID.prototype.toString = function(){ return this.id; };
  UUID.prototype.createUUID = function(){
    var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
    var dc = new Date();
    var t = dc.getTime() - dg.getTime();
    var tl = UUID.prototype.getIntegerBits(t,0,31);
    var tm = UUID.prototype.getIntegerBits(t,32,47);
    var thv = UUID.prototype.getIntegerBits(t,48,59) + '1'; // version 1, security version is 2
    var csar = UUID.prototype.getIntegerBits(UUID.prototype.rand(4095),0,7);
    var csl = UUID.prototype.getIntegerBits(UUID.prototype.rand(4095),0,7);

    // since detection of anything about the machine/browser is far to buggy,
    // include some more random numbers here
    // if NIC or an IP can be obtained reliably, that should be put in
    // here instead.
    var n = UUID.prototype.getIntegerBits(UUID.prototype.rand(8191),0,7) +
      UUID.prototype.getIntegerBits(UUID.prototype.rand(8191),8,15) +
      UUID.prototype.getIntegerBits(UUID.prototype.rand(8191),8,15) +
      UUID.prototype.getIntegerBits(UUID.prototype.rand(8191),0,15); // this last number is two octets long
    //return tl + '-' + tm  + '-' + thv  + '-' + csar + '-' + csl + n;
    return tl + tm  + thv  + csar + csl + n;  // 32位。去掉-
  };
  UUID.prototype.getIntegerBits = function(val,start,end){
    var base16 = UUID.prototype.returnBase(val,16);
    var quadArray = new Array();
    var quadString = '';
    var i = 0;
    for(i=0;i<base16.length;i++){
      quadArray.push(base16.substring(i,i+1));
    }
    for(i=Math.floor(start/4);i<=Math.floor(end/4);i++){
      if(!quadArray[i] || quadArray[i] == '') quadString += '0';
      else quadString += quadArray[i];
    }
    return quadString;
  };
  UUID.prototype.returnBase = function(number, base){
    return (number).toString(base).toUpperCase();
  };
  UUID.prototype.rand = function(max){
    return Math.floor(Math.random() * (max + 1));
  };
  var getDateTime = function (aTime, aOnlyDate){
    // 向后一天，用 new Date( new Date() - 0 + 1*86400000)
    // 向后一小时，用 new Date( new Date() - 0 + 1*3600000)
    var l_date = new Array(aTime.getFullYear(), aTime.getMonth()  < 9 ? '0' + (aTime.getMonth() + 1) : (aTime.getMonth()+1), aTime.getDate() < 10 ? '0' + aTime.getDate() : aTime.getDate());
    var l_time = new Array(aTime.getHours() < 10 ? '0' + aTime.getHours() : aTime.getHours(), aTime.getMinutes() < 10 ? '0' + aTime.getMinutes() : aTime.getMinutes(), aTime.getSeconds() < 10 ? '0' + aTime.getSeconds() : aTime.getSeconds());
    if (aOnlyDate)
      return( l_date.join('-')) ; // '2014-01-02'
    else
      return( l_date.join('-') + ' ' + l_time.join(':')); // '2014-01-02 09:33:33'
  };
  var getDate = function(){ return getDateTime(arguments[0], true) };

  return {
    createUUID : UUID.prototype.createUUID,
    getDateTime : getDateTime,    // 向后一天，用 new Date( new Date() - 0 + 1*86400000)  1小时3600000
    getDate : getDate
  }
})
.factory('exDb', ['$q', '$location',function($q, $location){
  if(window.localStorage){
    console.log("check success -- > localStorage support!");
  }else{
    window.alert('This browser does NOT support localStorage. pls choose allow localstorage');
  }
  var localStorageService = window.localStorage;
  var _debug = true;
  var objUser = function(){
    this.NICKNAME = '';
    this.PASS = '';
    this.REMPASS = '';
    this._exState = "new";  // new , clean, dirty.
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
  };
  var _currentUser = (localStorageService.getItem('exManlocalUser') || ""),
   _useWord = (localStorageService.getItem('exManlocalWord') || ""),
   _remWord = (localStorageService.getItem('exManlocalRem') || "");

  return{
    userNew: function() { return new objUser() },
    taskNew: function() { return new objTask() },
    taskState : ['计划','进行','结束'],
    memPoint : '1,1,2,4,7,15',
    setUser: function(aUser) { _currentUser = aUser;  localStorageService.setItem('exManlocalUser', aUser) },
    getUser: function(){ return _currentUser },
    setWord: function(aParam) { _useWord = aParam; localStorageService.setItem('exManlocalWord', aParam) },
    getWord: function(){return _useWord},
    getRem: function(){return (_remWord=="true" || _remWord==true)?true:false; },
    setRem: function(aParam) {  _remWord = aParam;  localStorageService.setItem('exManlocalRem', aParam);
      if (!aParam){   localStorageService.setItem('exManlocalWord', '');  }
    },
    checkRtn: function(aRtn) {
      if (aRtn.rtnCode == 0) {
        switch (aRtn.appendOper) {
          case 'login':
            $location.path('/');
            return false;
            break;
        }
      }
      return true;
    },
    log: function(){ if (_debug) console.log(arguments) }
  }
}]);

