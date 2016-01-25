angular.module('crms', [
  'ionic',
  'ngResource',
  // 'crms.directives',
  // 'crms.filters',
  'crms.services',
  'crms.controllers'
])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('crm', {
      url: '/crm',
      abstract: true,
      templateUrl: 'js/crms/views/menu.html',
      controller: 'CRMNavController'
    })
    .state('crm.companies', {
      url: '/companies',
      views: {
        'menuContent': {
          templateUrl: 'js/crms/views/companies.html',
          controller: 'CRMCompanyListController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    })
    .state('crm.customers', {
      url: '/customers',
      views: {
        'menuContent': {
          templateUrl: 'js/crms/views/customers.html',
          controller: 'CRMCustomerListController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    })
    .state('crm.company', {
      url: '/companyprofile/:id',
      views: {
        'menuContent': {
          templateUrl: 'js/crms/views/company.html',
          controller: 'CRMCompanyProfileController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    })
    .state('crm.customer', {
      url: '/customerprofile/:id',
      views: {
        'menuContent': {
          templateUrl: 'js/crms/views/customer.html',
          controller: 'CRMCustomerProfileController'
        }
      },
      resolve: {
        'bkUser': ['persistService', '$q', function(persistService, $q) {
          return persistService.get('user') || $q.reject({unAuthorized:true});
        }]
      }
    });
});

angular.module('crms').run(function($rootScope, transit, authService) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if (error.unAuthorized) {
      authService.logout();
      transit.go('account.login');
    }
  });
});

