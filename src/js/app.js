App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,
    logSellArticleEvent: null,

    init() {
        return App.initWeb3();
    },

    async initWeb3() {
        if (window.ethereum) {
            // Modern dapp browsers...
            window.web3 = new Web3(ethereum);
            try {
                // Request account access if needed
                await ethereum.enable();

                App.displayAccountInfo();
                return App.initContract();
            } catch (error) {
                // User denied account access...
                console.error("Unable to retrieve your accounts! You have to approve this application on Metamask.");
            }
        } else if (window.web3) {
            // Legacy dapp browsers...
            window.web3 = new Web3(web3.currentProvider || "ws://localhost:8545");

            App.displayAccountInfo();
            return App.initContract();
        } else {
            // Non-dapp browsers...
            console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
        }
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
            App.chainListInstance = new web3.eth.Contract(artifact.abi, deployedAddress);

            // Listen to events
            App.listenToEvents();

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
            articleTemplate.find(".article-price").text(web3.utils.fromWei(web3.utils.toBN(article._price), "ether"));

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
        const articlePrice = isNaN(parseFloat($("#article_price").val())) ? "0" : parseFloat($("#article_price").val()).toString();

        const _article_name = $("#article_name").val();
        const _description = $("#article_description").val();
        const _price = web3.utils.toWei(articlePrice, "ether");

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
                });
        } catch (error) {
            console.error(error.message);
        }
    },

    // Listen to events triggered by the contract
    listenToEvents() {
        App.logSellArticleEvent = App.chainListInstance.events
            .LogSellArticle({ fromBlock: "latest", toBlock: "latest" })
            .on("data", function(event) {
                $("#events").append(
                    '<li class="list-group-item">' + event.returnValues._name + " is for sale" + "</li>"
                );

                App.reloadArticles();
            })
            .on("error", function(error) {
                console.error(error);
            });
    }
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});
