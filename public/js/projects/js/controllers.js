'use strict'

angular.module('projects.controllers',[]).controller('ProjectNavController', function($scope, $translatePartialLoader, transit) {
  $translatePartialLoader.addPart('projects');

  $scope.goHome = function() {
    transit.goHome();
  };
});

angular.module('projects.controllers').controller('ProjectProjectListController', function($scope, Project) {
  var refreshData = function() {
    $scope.projects = Project.query();
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });
});
angular.module('projects.controllers').controller('ProjectProjectProfileController', function($scope, $stateParams, $timeout, $ionicModal, transit, persistService, Project, Company, Customer, User) {
  var refreshData = function() {
    $scope.formType = 'update';
    $scope.invalidProfile = false;
    $scope.finishProfile = false;
    $scope.invalidAdd = false;
    $scope.finishAdd = false;
    $scope.showFooterbar = false;
    $scope.classFooterbar = 'bar-balanced';
    var user = persistService.get('user');
    $scope.project = Project.get({id:$stateParams.id}, function() {
      $scope.project.startdate_public = new Date(Date.parse($scope.project.startdate_public));
      $scope.project.startdate_plan = new Date(Date.parse($scope.project.startdate_plan));
      $scope.project.startdate_fact = new Date(Date.parse($scope.project.startdate_fact));
      $scope.project.enddate_public = new Date(Date.parse($scope.project.enddate_public));
      $scope.project.enddate_plan = new Date(Date.parse($scope.project.enddate_plan));
      $scope.project.enddate_fact = new Date(Date.parse($scope.project.enddate_fact));
    });
    $scope.companies = Company.query();
    $scope.customers = Customer.query();
    $scope.users = User.query();
    $scope.permission = {
      'modify': (user && user.permission.indexOf('modify') >= 0),
      'create': (user && user.permission.indexOf('create') >= 0),
      'admin': (user && user.permission.indexOf('admin') >= 0)
    };
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });

  $scope.dirty = function() {
    var child = $scope.$$childHead;
    while (child) {
      if (child.profileForm) {
        child.profileForm.$dirty = true;
        break;
      }
      child = child.$$nextSibling;
    }
  };

  // Create the register modal that we will use later
  $ionicModal.fromTemplateUrl('js/projects/views/choose_member.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalMember = modal;
  });
  // Triggered in the register modal to close it
  $scope.closeChooseMember = function() {
    $scope.modalData = {};
    $scope.modalMember.hide();
  };
  // Open the register modal
  $scope.chooseMember = function(bMultiple) {
    $scope.modalData = {
      bMultiple: bMultiple
    };
    if ($scope.modalData.bMultiple) {
      $scope.users.forEach(function(user) {
        if ($scope.project.memberid.indexOf(user._id) >= 0) {
          user.checked = true;
        } else {
          user.checked = false;
        }
      });
    } else {
      $scope.modalData.selected = $scope.project.leaderid;
    }
    $scope.modalMember.show();
  };
  // Perform the register action when the user submits the register form
  $scope.doChooseMember = function() {
    if ($scope.modalData.bMultiple) {
      $scope.project.memberid = [];
      $scope.users.forEach(function(user) {
        if (user.checked) {
          $scope.project.memberid.push(user._id);
        }
      });
    } else {
      $scope.project.leaderid = $scope.modalData.selected;
    }
    $scope.dirty();
    $scope.closeChooseMember();
  };

  // Create the register modal that we will use later
  $ionicModal.fromTemplateUrl('js/projects/views/choose_customer.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalCustomer = modal;
  });
  // Triggered in the register modal to close it
  $scope.closeChooseCustomer = function() {
    $scope.modalData = {};
    $scope.modalCustomer.hide();
  };
  // Open the register modal
  $scope.chooseCustomer = function() {
    $scope.modalData = {};
    if ($scope.customers.length > 0) {
      $scope.modalData.currentCompany = $scope.customers[0].companyid;
      var companyCount = {};
      $scope.customers.forEach(function(customer) {
        if ($scope.project.customerid.indexOf(customer._id) >= 0) {
          customer.checked = true;
          $scope.modalData.currentCompany = customer.companyid;
          if (companyCount[customer.companyid]) {
            companyCount[customer.companyid] += 1;
          } else {
            companyCount[customer.companyid] = 1;
          }
        } else {
          customer.checked = false;
        }
      });
      $scope.companies.forEach(function(company) {
        if (companyCount[company._id]) {
          company.selectedCount = companyCount[company._id];
        } else {
          company.selectedCount = 0;
        }
      });
    }
    $scope.modalCustomer.show();
  };
  // Perform the register action when the user submits the register form
  $scope.doChooseCustomer = function() {
    $scope.project.customerid = [];
    $scope.customers.forEach(function(customer) {
      if (customer.checked) {
        $scope.project.customerid.push(customer._id);
      }
    });
    $scope.dirty();
    $scope.closeChooseCustomer();
  };

  $scope.doUpdate = function() {
    $scope.project.$update(function() {
      $scope.invalidProfile = false;
      $scope.finishProfile = true;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-balanced';
      $timeout(function() {
        transit.goBack();
      }, 1000);
    },function(err) {
      $scope.invalidProfile = true;
      $scope.finishProfile = false;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-assertive';
    });
  };
});
angular.module('projects.controllers').controller('ProjectProjectNewController', function($scope, $stateParams, $timeout, $ionicModal, transit, persistService, Project, Company, Customer, User) {
  var refreshData = function() {
    $scope.formType = 'new';
    $scope.invalidProfile = false;
    $scope.finishProfile = false;
    $scope.invalidAdd = false;
    $scope.finishAdd = false;
    $scope.showFooterbar = false;
    $scope.classFooterbar = 'bar-balanced';
    var user = persistService.get('user');
    $scope.project = new Project();
    $scope.project.status = 'ToDo';
    $scope.project.customerid = [];
    $scope.project.memberid = [];
    $scope.companies = Company.query();
    $scope.customers = Customer.query();
    $scope.users = User.query();
    $scope.permission = {
      'modify': (user && user.permission.indexOf('modify') >= 0),
      'create': (user && user.permission.indexOf('create') >= 0),
      'admin': (user && user.permission.indexOf('admin') >= 0)
    };
  };
  $scope.$on('$ionicView.enter', function(e) {
    refreshData();
  });

  $scope.dirty = function() {
    var child = $scope.$$childHead;
    while (child) {
      if (child.profileForm) {
        child.profileForm.$dirty = true;
        break;
      }
      child = child.$$nextSibling;
    }
  };

  // Create the register modal that we will use later
  $ionicModal.fromTemplateUrl('js/projects/views/choose_member.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalMember = modal;
  });
  // Triggered in the register modal to close it
  $scope.closeChooseMember = function() {
    $scope.modalData = {};
    $scope.modalMember.hide();
  };
  // Open the register modal
  $scope.chooseMember = function(bMultiple) {
    $scope.modalData = {
      bMultiple: bMultiple
    };
    if ($scope.modalData.bMultiple) {
      $scope.users.forEach(function(user) {
        if ($scope.project.memberid.indexOf(user._id) >= 0) {
          user.checked = true;
        } else {
          user.checked = false;
        }
      });
    } else {
      $scope.modalData.selected = $scope.project.leaderid;
    }
    $scope.modalMember.show();
  };
  // Perform the register action when the user submits the register form
  $scope.doChooseMember = function() {
    if ($scope.modalData.bMultiple) {
      $scope.project.memberid = [];
      $scope.users.forEach(function(user) {
        if (user.checked) {
          $scope.project.memberid.push(user._id);
        }
      });
    } else {
      $scope.project.leaderid = $scope.modalData.selected;
    }
    $scope.dirty();
    $scope.closeChooseMember();
  };

  // Create the register modal that we will use later
  $ionicModal.fromTemplateUrl('js/projects/views/choose_customer.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalCustomer = modal;
  });
  // Triggered in the register modal to close it
  $scope.closeChooseCustomer = function() {
    $scope.modalData = {};
    $scope.modalCustomer.hide();
  };
  // Open the register modal
  $scope.chooseCustomer = function() {
    $scope.modalData = {};
    if ($scope.customers.length > 0) {
      $scope.modalData.currentCompany = $scope.customers[0].companyid;
      var companyCount = {};
      $scope.customers.forEach(function(customer) {
        if ($scope.project.customerid.indexOf(customer._id) >= 0) {
          customer.checked = true;
          $scope.modalData.currentCompany = customer.companyid;
          if (companyCount[customer.companyid]) {
            companyCount[customer.companyid] += 1;
          } else {
            companyCount[customer.companyid] = 1;
          }
        } else {
          customer.checked = false;
        }
      });
      $scope.companies.forEach(function(company) {
        if (companyCount[company._id]) {
          company.selectedCount = companyCount[company._id];
        } else {
          company.selectedCount = 0;
        }
      });
    }
    $scope.modalCustomer.show();
  };
  // Perform the register action when the user submits the register form
  $scope.doChooseCustomer = function() {
    $scope.project.customerid = [];
    $scope.customers.forEach(function(customer) {
      if (customer.checked) {
        $scope.project.customerid.push(customer._id);
      }
    });
    $scope.dirty();
    $scope.closeChooseCustomer();
  };

  $scope.doUpdate = function() {
    $scope.project.$save(function() {
      $scope.invalidAdd = false;
      $scope.finishAdd = true;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-balanced';
      $timeout(function() {
        transit.goBack();
      }, 1000);
    },function(err) {
      $scope.invalidAdd = true;
      $scope.finishAdd = false;
      $scope.showFooterbar = true;
      $scope.classFooterbar = 'bar-assertive';
    });
  };
});
