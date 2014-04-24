'use strict';

NCMB.initialize(
  '355ffce88f5d9c6a4b45eaa12d65cec0c41c224406ac58037cfbd1d339e40c05',
  '5fab0d37395bcc8c605f60694feec2c1312b2bb3d2438438db2faa342f393296');


angular
  .module('fakebookApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ])
  .config(
    [         '$locationProvider', '$routeProvider',
    function ( $locationProvider,   $routeProvider) {
      $routeProvider
        .when('/login', {
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl'
        })
        .otherwise({
          redirectTo: '/'
        })
        ;
  
      $locationProvider.html5Mode(true);
  
    }])

  .run(
    [        '$location', '$rootScope', 'account', 'friend',
    function( $location,   $rootScope,   account,   friend) {

      console.log('run');
      account.requestCurrentUser();
      console.log(account.currentUser);

      window.fbAsyncInit = function() {
        console.log('fbAsyncInit');
      
        //FB.init({
        NCMB.FacebookUtils.init({
          appId      : '259688227536883',
          status     : true, // check login status
          cookie     : true, // enable cookies to allow the server to access the session
          xfbml      : true  // parse XFBML
        });

        account.updateSession();
      };
      
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s);
        js.id = id;
        js.src = '//connect.facebook.net/en_US/all.js';
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));


      $rootScope.$on('$routeChangeStart', function(){
        console.log('root change : ' + $location.path());
        if (account.isAuthenticated()) {
          if ($location.path() === '/login') {
            $location.path('/');
          }
        } else {
          if ($location.path() === '/feed/new') {
            $location.path('/login');
            return;
          }

          if ($location.path() !== '/'
          &&  $location.path() !== '/login'
          &&  ! $location.path().match(/\/feed\//)) {
            $location.path('/login');
          }
          //if ($location.path() !== '/login') {
          //  $location.path('/login');
          //}
        }
 
      });



      console.log('run end');
    }])

  .controller('headerCtrl',
    [        '$location', '$scope', 'account',
    function( $location,   $scope,   account) {
      $scope.isAuthenticated = account.isAuthenticated();
      $scope.add     = function() { $location.path('/feed/new'); }
      $scope.setting = function() { $location.path('/settings'); }
    }
  ])
  ;

