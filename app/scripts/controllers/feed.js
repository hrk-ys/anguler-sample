'use strict';

angular.module('fakebookApp')
  .config(
    [         '$locationProvider', '$routeProvider',
    function ( $locationProvider,   $routeProvider) {
      console.log('feed controller');
      $routeProvider

        .when('/', {
          templateUrl: 'views/main.html',
          resolve:{
            friendList : ['friend', function(friend){
              return friend.requireFriendList();
            }],
          },
          controller: ['$scope', 'account', 'feed',
              function( $scope,   account,   resource ) {
                $scope.facebookId = account.facebookId();
                $scope.list = resource.list;
                resource.load().then(function(promis) {
                  console.log(promis);
                  resource.listPromis.then(function() {});
                });

                $scope.sendComment = function(feed, comment) {
                  resource.sendComment(feed, comment).then(function() {
                  }); 
                };

                $scope.delete = function(feed) {
                  resource.delete(feed).then(function() {
                    console.log('delete');
                    $scope.$digest();
                  });
                };
              }],
        })

        .when('/feed/new', {
          templateUrl: 'views/feed/new.html',
          controller: ['$location', '$scope', 'account', 'friend', 'feed',
            function (  $location,   $scope,   account,   friend,   feed) {

              if (!account.isConnected) {
                $location.path('/');
                return;
              }

              feed.targetUser = null;
              $scope.selected = function(user) {
                feed.targetUser = user;
                $location.path('/feed/post');
              }
              friend.friends().then(function(list) {
                $scope.list = list;
              },
              function(error) {
                $scope.error = error.message;
              });

            }],
        })


        .when('/feed/post', {
          templateUrl: 'views/feed/post.html',
          controller: ['$location', '$scope', 'account', 'feed',
            function (  $location,   $scope,   account,   feed ) {

              $scope.user = feed.targetUser;

              $scope.post = function() {
                feed.post($scope.content)
                .then(function(feed) {
                  $location.path('/feed/done');
                }, function(error) {
                  $scope.error = error;
                });
              };
            }],
          })

        .when('/feed/done', {
          templateUrl: 'views/feed/done.html'
        })

        .when('/feed/:id', {
          templateUrl: 'views/main.html',
          controller: ['$scope', '$routeParams', 'account', 'feed',
              function( $scope,   $routeParams,   account,   resource ) {
                $scope.showShareButton = $routeParams.id;
                $scope.facebookId = account.facebookId();
                resource.get($routeParams.id).then(function(result) {
                  $scope.list = [result];
                });

                $scope.sendComment = function(feed, comment) {
                  resource.sendComment(feed, comment).then(function() {
                  }); 
                };

                $scope.delete = function(feed) {
                  resource.delete(feed).then(function() {
                    console.log('delete');
                    $scope.$digest();
                  });
                };
              }],
        })



        ;

    }]);

