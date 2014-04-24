'use strict';

angular.module('fakebookApp')
  .factory('feed',
  [         '$q', 'account', 'friend',
  function ( $q,   account,   friend  ) {
    // Service logic
    // ...
    var Feed    = NCMB.Object.extend('Feed');
    var Comment = NCMB.Object.extend('Comment');
                    
    var PushToServiceList = function(feed) {
      var data = {
          user_id:    feed.get('user_id'),
          user_name:  feed.get('user_name'),
          content:    feed.get('content'),
          createDate: feed.get('createDate'),
          comments:   [],
          org:        feed,
        };
      service.list.unshift(data);
      return data;
    };
    var PushToFeedComment = function(feed, comment) {
      var data = {
          content:    comment.get('content'),
          createDate: comment.get('createDate'),
          org:        comment,
        };
      feed.comments.push(data);
      return data;
    };


    // Public API here
    var service = {
      targetUser : null,
      list : [],
      listPromis: null,
      load: function() {
        
        if (service.list.length > 0) {
          //return $q.when(service.list);
        }
        var query = new NCMB.Query(Feed);
        var now = new Date();
        var limitDate = new Date();
        limitDate.setTime(now.getTime() - 7 * 86400 * 1000);

        if (service.list.length > 0) {
          limitDate = new Date(service.list[0].createDate);
        }
        query.greaterThan('createDate', limitDate);

        if (friend.friendList) {
          query.containedIn('user_id', friend.friendList.get('list') );
        }

        return query.find({
          success: function(results) {
            console.log(results);

            var promises = [];
            
            angular.forEach(results, function(v){
              var data = PushToServiceList(v);

              if (v.get('commentNum') > 0) {
                var query = v.relation('comments').query();
                query.ascending('createDate');
                var find = query.find({
                  success: function(list) {
                    angular.forEach(list, function(v) {
                      PushToFeedComment(data, v);
                    });
                  },
                });

                promises.push( find );
              }

            });

            service.listPromis = $q.all( promises );
          },
          error: function(error) {
            console.log(error);
            if (error.code === 'E401001') {
              account.logout();
            }
          }
        });
      },

      get: function(id) {
        
        var deferred = $q.defer();

        var query = new NCMB.Query(Feed);
        query.get(id, {
          success: function(feed) {
            var data = {
              user_id:    feed.get('user_id'),
              user_name:  feed.get('user_name'),
              content:    feed.get('content'),
              createDate: feed.get('createDate'),
              comments:   [],
              org:        feed,
            };
            deferred.resolve(data);
          },
          error: function(object, error) {
            deferred.reject(error);
          }
        });

        return deferred.promise;
        
      },

      post: function(content) {
        console.log(content);


        var deferred = $q.defer();

        var feed = new Feed();
        
        feed.save({
          user_id: service.targetUser.id,
          user_name: service.targetUser.name,
          content: content,
          commentNum: 0,
        }, {
          success: function(feed) {
            PushToServiceList(feed);
            deferred.resolve(feed);
          },
          error: function(feed, error) {
            deferred.reject(error);
          }
        });


        return deferred.promise;

      },

      delete: function(feed) {

        
        return feed.org.destroy({
          success: function(feedOrg) {
            var i = 0;
            angular.forEach(service.list, function(v) {
              if (v.org.id == feed.org.id) {
                service.list.splice(i, 1);
              }
              i++;
            });
          },
            error: function(feedOrg, error) {}
        });
      },

      sendComment: function(feedData, comment) {
        var deferred = $q.defer();

        var feed = feedData.org;
        var myComment = new Comment();
        myComment.set('content', comment);

        myComment.save(null,{
          success: function(comment) {
            var relation = feed.relation('comments');
            relation.add(comment);
            feed.set('commentNum', feed.get('commentNum') + 1);
            feed.save();

            PushToFeedComment(feedData, comment);

            deferred.resolve(comment);
          },
          error: function(comment, error) {
            deferred.reject(error);
          }
        });
        
        return deferred.promise;
        
      },

    };

    return service;
  }]);
