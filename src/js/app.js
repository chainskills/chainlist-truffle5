App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,

  init() {
    return App.initWeb3();
  },

  initWeb3() {
    // Initialize web3
    if (typeof web3 !== "undefined") {
      // reuse the provider of the Web3 object injected in the browser
      App.web3Provider = web3.currentProvider;
    } else {
      // create a new provider and plug it directly into our local node
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);
    App.displayAccountInfo();
    return App.initContract();
  },

  async displayAccountInfo() {
    const accounts = await web3.eth.getAccounts();
    App.account = accounts[0];
    $("#account").text(App.account);

    const balance = await web3.eth.getBalance(App.account);
    $("#accountBalance").text(web3.utils.fromWei(balance, "ether") + " ETH");
  },

  async initContract() {
    const networkId = await web3.eth.net.getId();
    $.getJSON("ChainList.json", function(artifact) {
      const deployedAddress = artifact.networks[networkId].address;
      App.chainListInstance = new web3.eth.Contract(
        artifact.abi,
        deployedAddress
      );
      // retrieve the article from the contract
      return App.reloadArticles();
    });
  },

  async reloadArticles() {
    // refresh account information because the balance might have changed
    App.displayAccountInfo();

    // retrieve the article placeholder and clear it
    $("#articlesRow").empty();
    try {
      const article = await App.chainListInstance.methods.getArticle().call();
      if (article[0] == 0x0) {
        // no article
        return;
      }

      // Retrieve and fill the article template
      var articleTemplate = $("#articleTemplate");
      articleTemplate.find(".panel-title").text(article._name);
      articleTemplate.find(".article-description").text(article._description);
      articleTemplate
        .find(".article-price")
        .text(web3.utils.fromWei(web3.utils.toBN(article._price), "ether"));

      var seller = article._seller;
      if (seller == App.account) {
        seller = "You";
      }
      articleTemplate.find(".article-seller").text(seller);

      // add this new article
      $("#articlesRow").append(articleTemplate.html());
    } catch (error) {
      console.error(error.message);
    }
  },

  async sellArticle() {
    // retrieve the detail of the article
    const _article_name = $("#article_name").val();
    const _description = $("#article_description").val();
    const _price = web3.utils.toWei(
      web3.utils.toBN(parseFloat($("#article_price").val() || 0)).toString(),
      "ether"
    );

    if (_article_name.trim() == "" || _price == 0) {
      // nothing to sell
      return false;
    }

    try {
      await App.chainListInstance.methods
        .sellArticle(_article_name, _description, _price)
        .send({
          from: App.account,
          gas: 500000
        })
        .on("transactionHash", function(hash) {
          console.log("Transaction hash: " + hash);
        })
        .on("receipt", function(receipt) {
          App.reloadArticles();
        });
    } catch (error) {
      console.error(error.message);
    }
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
