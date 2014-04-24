'use strict';

angular.module('fakebookApp')
  .factory('account',
  [         
  function () { 

    // Service logic
    // ...

    // Public API here
    var account = {
      currentUser: null,
    
      isConnected: false,

      facebookId : function() {
        if (!account.currentUser) {
          return null;
        } 
        return account.currentUser.attributes.authData.facebook.id;
      },
      requestCurrentUser: function () {
        console.log('account:requestCurrentUser');
        if (!!account.currentUser) {
          return account.currentUser;
        }
      
        account.currentUser = NCMB.User.current();

        return account.currentUser;
      },

      login: function() {
        console.log('account:login');

        var logIn = NCMB.FacebookUtils.logIn(
          'read_friendlists',
        {
          success: function(user) {
            account.currentUser = user;
            console.log('account:login success');
            console.log(user);
            return user;
          },
          error: function(user, error) {
            alert('User cancelled the Facebook login or did not fully authorize.');
            console.log(user);
            console.log(error);
          }
        });
        return logIn;
      },
      


      logout: function() {
        console.log('account:logout');
        NCMB.User.logOut();
      },


      isAuthenticated : function() {
        return !!account.currentUser;
      },


      updateSession: function() {
        FB.getLoginStatus(function(response) {
          console.log(response);
          account.isConnected = response.status === 'connected';
        });
        //account.logout();
        //account.login();
      }
    };

    return account;
  }
]);
