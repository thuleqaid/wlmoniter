'use strict'

angular.module('common.accounts.directives',[]).directive('permissionView', function() {
  return {
    restrict: 'E',
    scope: {
      permission:'@permission'
    },
    repalce: true,
    templateUrl: 'js/accounts/views/d_permission_view.html'
  };
});
angular.module('common.accounts.directives').directive('permissionEdit', function() {
  return {
    restrict: 'E',
    scope: {
      permission:'@permission',
      editable:'@editable',
      callback: '&updater'
    },
    repalce: true,
    templateUrl: 'js/accounts/views/d_permission_edit.html',
    link: function(scope, elem, attrs) {
      scope.checkModel = {'modify': false,
                          'create': false,
                          'admin': false};
      scope.$watch('permission', function(newval, oldval) {
        if (newval && newval != oldval) {
          var inputPermission = JSON.parse(newval);
          if (inputPermission.indexOf("modify") >= 0) {
            scope.checkModel.modify = true;
          } else {
            scope.checkModel.modify = false;
          }
          if (inputPermission.indexOf("create") >= 0) {
            scope.checkModel.create = true;
          } else {
            scope.checkModel.create = false;
          }
          if (inputPermission.indexOf("admin") >= 0) {
            scope.checkModel.admin = true;
          } else {
            scope.checkModel.admin = false;
          }
        }
      });
      scope.$watchCollection('checkModel', function(newval, oldval) {
        if (newval != oldval) {
          var newPermission = new Array();
          if (newval.modify) {
            newPermission.push('modify');
          }
          if (newval.create) {
            newPermission.push('create');
          }
          if (newval.admin) {
            newPermission.push('admin');
          }
          scope.callback({args:newPermission});
        }
      });
    }
  };
});
