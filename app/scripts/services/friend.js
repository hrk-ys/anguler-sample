'use strict';

angular.module('fakebookApp')
  .factory('friend', ['$q', 'account', function ($q, account) {
    // Service logic
    // ...

    var FriendList = NCMB.Object.extend('FriendList');

    var paging = null;

    var friends = function() {
      if (!account.isAuthenticated()) {
        return $q.when();
      }
      
      if (friend.list.length > 0 && !paging) {
        return $q.when( friend.list );
      }

      var url = paging || '/me/friends';
      var deferred = $q.defer();


      FB.api(
        url,
        function (response) {
          if (response && !response.error) {
            /* handle the result */
            angular.forEach(response.data, function(v){
              friend.list.push(v);
            });

            paging = response.paging.next;
            console.log(paging);
            deferred.resolve(friend.list);

            if (response.data.length > 0) {
              friend.friends();
            } else {
              // friend list 更新
              friend.updateFriendList();
            }
            
          } else {
            console.log(response.error);
            if (response.error.code === 190) {
              account.updateSession();
            }
            deferred.reject(response.error);
          }
        }
      );

      return deferred.promise;
    };

    var requireFriendList = function() {
      var deferred = $q.defer();
      friend.getFriendList().then(function(result) {
        if (result) {
          return deferred.resolve(result);
        }

        return friend.friends().then(function() {
          friend.updateFriendList().then(function(result) {
            return deferred.resolve(result);
          });
        });
      });
      return deferred.promise;
    };

    var updateFriendList = function() {
        
        if (!account.currentUser) { return $q.when(); }
      
        var deferred = $q.defer();
        friend.getFriendList().then(function(result) {
            var friendlist = result ||  new FriendList();
            friend.friendList = friendlist;

            var list = [];
            angular.forEach(friend.list, function(v) {
              list.push(v.id);
            });
            friendlist.save({
              list: list,
              userId : account.currentUser.id
            });

            return deferred.resolve(friendlist);
          });
        return deferred.promise;
      };

    var getFriendList = function() {
      if (!account.currentUser) { return $q.when(); }
      if (friend.friendList) { return $q.when(friend.friendList); }

      var deferred = $q.defer();

      var query = new NCMB.Query(FriendList);
      query.equalTo('userId', account.currentUser.id);
      query.find({
        success: function(results) {
          if (results && results.length === 1) {
            friend.friendList = results[0];
            deferred.resolve(results[0]);
          }
          deferred.resolve();
        },
        error: function(error) {
          deferred.reject(error);
        }
      });

      return deferred.promise;
    };

    // Public API here
    var friend = {
      list              : [],
      friends           : friends,
      friendList        : null,
      updateFriendList  : updateFriendList,
      getFriendList     : getFriendList,
      requireFriendList : requireFriendList,
    };
    return friend;
  }]);
