'use strict'

angular.module('common.accounts.directives',[]).directive('permissionView', function() {
  return {
    restrict: 'E',
    scope: {
      permission:'@permission'
    },
    repalce: true,
    templateUrl: 'javascripts/modules/accounts/views/d_permission_view.html'
  };
});
angular.module('common.accounts.directives').directive('permissionEdit', function() {
  return {
    restrict: 'E',
    scope: {
      permission:'@permission',
      callback: '&updater'
    },
    repalce: true,
    templateUrl: 'javascripts/modules/accounts/views/d_permission_edit.html',
    link: function(scope, elem, attrs) {
      scope.checkModal = {'modify': false,
                          'create': false,
                          'admin': false};
      scope.$watch('permission', function(newval, oldval) {
        if (newval != oldval) {
          var inputPermission = JSON.parse(newval);
          if (inputPermission.indexOf("modify") >= 0) {
            scope.checkModal.modify = true;
          }
          if (inputPermission.indexOf("create") >= 0) {
            scope.checkModal.create = true;
          }
          if (inputPermission.indexOf("admin") >= 0) {
            scope.checkModal.admin = true;
          }
        }
      });
      scope.$watchCollection('checkModal', function(newval, oldval) {
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
