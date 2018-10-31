App = {
     web3Provider: null,
     contracts: {},

     init() {
          /*
           * Replace me...
           */

          return App.initWeb3();
     },

     initWeb3() {
          /*
           * Replace me...
           */

          return App.initContract();
     },

     initContract() {
          /*
           * Replace me...
           */
     },
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
