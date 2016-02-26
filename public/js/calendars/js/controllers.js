'use strict'

angular.module('calendars.controllers',[]).controller('CalendarNavController', function($scope, $translatePartialLoader, transit) {
  $translatePartialLoader.addPart('calendars');

  $scope.goHome = function() {
    transit.goHome();
  };
});

angular.module('calendars.controllers').controller('CalendarCalendarController', function($scope, Calendar) {
  var refreshData = function() {
    $scope.current = {
      'year': (new Date()).getFullYear(),
      'info': {'counter':0}
    };
    Calendar.get({year:$scope.current.year}).$promise.then(function(info) {
      var counter = $scope.current.info.counter + 1;
      $scope.current.info = info;
      $scope.current.info.counter = counter;
    });
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
  $scope.$on('CALENDAR_CELL_CLICK', function(event, data) {
    console.log(data);
  });
  $scope.stepYear = function(delta) {
    if (delta == 0) {
      $scope.current.year = (new Date()).getFullYear();
    } else {
      $scope.current.year = $scope.current.year + delta;
    }
    Calendar.get({year:$scope.current.year}).$promise.then(function(info) {
      var counter = $scope.current.info.counter + 1;
      $scope.current.info = info;
      $scope.current.info.counter = counter;
    });
  };
});

angular.module('calendars.controllers').controller('CalendarWorkloadController', function($scope, Workload) {
  var arrangeData = function() {
    Workload.workload($scope.current.year, $scope.current.month).then(function(data) {
      var counter = $scope.current.info.counter + 1;
      $scope.current.info = data.info;
      $scope.current.total = {};
      $scope.current.extra = {};
      $scope.users = data.users;
      $scope.projects = data.projects;
      for (var i = 0; i < data.extra.length; i++) {
        var tmpdate = new Date(Date.parse(data.extra[i]['date']));
        var tmpleft = 0;
        var tmpright = 0;
        $scope.current.total[tmpdate] = data.extra[i]['detail'];
        for (var k = 0; k < $scope.current.total[tmpdate].length; k++) {
          for (var j = 0; j < $scope.users.length; j++) {
            if ($scope.users[j]._id == $scope.current.total[tmpdate][k].user) {
              $scope.current.total[tmpdate][k].user = $scope.users[j];
              break;
            }
          }
        }
        for (var j = 0; j < $scope.current.total[tmpdate].length; j++) {
          if ($scope.mode.userid == '') {
            /* 全员 */
            if ($scope.mode.projectid == '') {
              /* 全项目 */
              tmpleft += $scope.current.total[tmpdate][j].total;
              tmpright += $scope.current.total[tmpdate][j].total - $scope.current.total[tmpdate][j].available;
            } else {
              /* 指定项目 */
              tmpleft += $scope.current.total[tmpdate][j].available;
              for (var k = 0; k < $scope.current.total[tmpdate][j].projects.length; k++) {
                if ($scope.current.total[tmpdate][j].projects[k].project == $scope.mode.projectid) {
                  tmpleft += $scope.current.total[tmpdate][j].projects[k].hour;
                  tmpright += $scope.current.total[tmpdate][j].projects[k].hour;
                  break;
                }
              }
            }
          } else {
            /* 指定人员 */
            if ($scope.current.total[tmpdate][j].user._id == $scope.mode.userid) {
              if ($scope.mode.projectid == '') {
                tmpleft += $scope.current.total[tmpdate][j].total;
                tmpright += $scope.current.total[tmpdate][j].total - $scope.current.total[tmpdate][j].available;
                /* 全项目 */
              } else {
                /* 指定项目 */
                tmpleft += $scope.current.total[tmpdate][j].available;
                for (var k = 0; k < $scope.current.total[tmpdate][j].projects.length; k++) {
                  if ($scope.current.total[tmpdate][j].projects[k].project == $scope.mode.projectid) {
                    tmpleft += $scope.current.total[tmpdate][j].projects[k].hour;
                    tmpright += $scope.current.total[tmpdate][j].projects[k].hour;
                    break;
                  }
                }
              }
            }
          }
        }
        if ($scope.mode.userid == '') {
          /* 全员，单位：人日 */
          $scope.current.extra[tmpdate] = [tmpleft/8., tmpright/8.];
        } else {
          /* 指定人员，单位：小时 */
          $scope.current.extra[tmpdate] = [tmpleft, tmpright];
        }
      }
      $scope.users.unshift({_id:'', first_name:'', last_name:'All', workid:'', gender:''});
      $scope.projects.unshift({_id:'', name:'All'});
      $scope.current.info.counter = counter;
    });
  };
  var refreshData = function() {
    var today = new Date();
    $scope.current = {
      'year': today.getFullYear(),
      'month': today.getMonth() + 1,
      'info': {'counter':0},
      'total': {},
      'extra': {},
      'click':{}
    };
    $scope.mode = {
      'userid':'',
      'projectid':''
    };
    $scope.list = {
      'full': [],
      'part': [],
      'zero': []
    };
    $scope.users = [];
    $scope.projects = [];
    arrangeData();
  };
  var updateList = function() {
    if (!$scope.current.total[$scope.current.click]) {
      return;
    }
    $scope.list.full = [];
    $scope.list.part = [];
    $scope.list.zero = [];
    var data = $scope.current.click;
    for (var j = 0; j < $scope.current.total[data].length; j++) {
      if ($scope.current.total[data][j].total > 0) {
        if ($scope.mode.userid == '') {
          /* 全员 */
          if ($scope.mode.projectid == '') {
            /* 全项目 */
            if ($scope.current.total[data][j].available <= 0) {
              $scope.list.full.push($scope.current.total[data][j]);
            } else if ($scope.current.total[data][j].available < $scope.current.total[data][j].total) {
              $scope.list.part.push($scope.current.total[data][j]);
            } else {
              $scope.list.zero.push($scope.current.total[data][j]);
            }
          } else {
            /* 指定项目 */
            for (var k = 0; k < $scope.current.total[data][j].projects.length; k++) {
              if ($scope.current.total[data][j].projects[k].project == $scope.mode.projectid) {
                if ($scope.current.total[data][j].projects[k].hour >= $scope.current.total[data][j].total) {
                  $scope.list.full.push($scope.current.total[data][j]);
                } else {
                  $scope.list.part.push($scope.current.total[data][j]);
                }
                break;
              }
            }
            if ($scope.current.total[data][j].available > 0) {
              $scope.list.zero.push($scope.current.total[data][j]);
            }
          }
        } else {
          /* 指定人员 */
          if ($scope.current.total[data][j].user._id == $scope.mode.userid) {
            if ($scope.mode.projectid == '') {
              /* 全项目 */
              for (var k = 0; k < $scope.current.total[data][j].projects.length; k++) {
                if ($scope.current.total[data][j].projects[k].hour >= $scope.current.total[data][j].total) {
                  $scope.list.full.push($scope.current.total[data][j].projects[k]);
                } else {
                  $scope.list.part.push($scope.current.total[data][j].projects[k]);
                }
              }
              if ($scope.current.total[data][j].available > 0) {
                $scope.list.zero.push($scope.current.total[data][j]);
              }
            } else {
              /* 指定项目 */
              for (var k = 0; k < $scope.current.total[data][j].projects.length; k++) {
                if ($scope.current.total[data][j].projects[k].project == $scope.mode.projectid) {
                  $scope.list.full.push($scope.current.total[data][j].projects[k]);
                } else {
                  $scope.list.part.push($scope.current.total[data][j].projects[k]);
                }
              }
              if ($scope.current.total[data][j].available > 0) {
                $scope.list.zero.push($scope.current.total[data][j]);
              }
            }
          }
        }
      }
    }
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
  $scope.$on('CALENDAR_CELL_CLICK', function(event, data) {
    if ($scope.current.total[data]) {
      $scope.current.click = data;
      updateList();
    }
  });
  $scope.$watchCollection('mode', function(newvalue, oldvalue) {
    if (newvalue != oldvalue) {
      updateList();
    }
  });
  $scope.stepYear = function(deltaY, deltaM) {
    if (deltaY == 0 && deltaM == 0) {
      var today = new Date();
      $scope.current.year = today.getFullYear();
      $scope.current.month = today.getMonth() + 1;
    } else {
      $scope.current.year = $scope.current.year + deltaY;
      $scope.current.month = $scope.current.month + deltaM;
      if ($scope.current.month > 12) {
        $scope.current.month -= 12;
        $scope.current.year += 1;
      } else if ($scope.current.month < 1) {
        $scope.current.month += 12;
        $scope.current.year -= 1;
      }
    }
    arrangeData();
  };
});
