'use strict';

angular.module('fakebookApp')
  .controller('LoginCtrl',
  [         '$window', '$location', '$scope', 'account',
  function ( $window,   $location,   $scope,   account) {
    $scope.login =  function(){
      account.login()
        .then(function() {
          console.log('LoginCtrl login success');
          $location.path('/');
          $window.location.reload();
        });
    };
  }]);
