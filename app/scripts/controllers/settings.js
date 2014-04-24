'use strict';

angular.module('fakebookApp')
  .config(
    [         '$locationProvider', '$routeProvider',
    function ( $locationProvider,   $routeProvider) {
      console.log('settings controller');
      $routeProvider

        .when('/settings', {
          templateUrl: 'views/settings.html',
          controller: ['$window', '$location', '$scope', 'account',
            function (  $window,   $location,   $scope,   account ) {

              $scope.logout = function() {
                account.logout();
                $location.path('/login');
                $window.location.reload();
              };
            }],
        })

        ;

    }]);

