App = {
  web3Provider: null,
  contracts: {},

  init() {
    // Load articles
    var articlesRow = $("#articlesRow");
    var articleTemplate = $("#articleTemplate");
    articleTemplate.find(".panel-title").text("article one");
    articleTemplate.find(".article-description").text("Description for this article");
    articleTemplate.find(".article-price").text("10.23");
    articleTemplate.find(".article-seller").text("0x01234567890123456789012345678901");
    articlesRow.append(articleTemplate.html());
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
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
