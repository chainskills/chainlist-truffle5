App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,
    logSellArticleEvent: null,
    logBuyArticleEvent: null,
    loading: false,

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

            // Subscribe to events
            App.subscribeEvents();

            // retrieve the article from the contract
            return App.reloadArticles();
        });
    },

    async reloadArticles() {
        // avoid reentry
        if (App.loading) {
            return;
        }
        App.loading = true;

        // refresh account information because the balance might have changed
        App.displayAccountInfo();

        try {
            const articleIds = await App.chainListInstance.methods.getArticlesForSale().call()

            // retrieve the article placeholder and clear it
            $('#articlesRow').empty();

            for (let i = 0; i < articleIds.length; i++) {
                const article = await App.chainListInstance.methods.articles(articleIds[i]).call()

                App.displayArticle(article[0], article[1], article[3], article[4], web3.utils.toBN(article[5]));
            }
            App.loading = false;
        } catch (error) {
            console.error(error.message);
            App.loading = false;
        }
    },

    displayArticle(id, seller, name, description, price) {
        const articlesRow = $('#articlesRow');

        const etherPrice = web3.utils.fromWei(price, "ether");

        const articleTemplate = $("#articleTemplate");
        articleTemplate.find('.panel-title').text(name);
        articleTemplate.find('.article-description').text(description);
        articleTemplate.find('.article-price').text(etherPrice + " ETH");
        articleTemplate.find('.btn-buy').attr('data-id', id);
        articleTemplate.find('.btn-buy').attr('data-value', etherPrice);

        // seller
        if (seller == App.account) {
            articleTemplate.find('.article-seller').text("You");
            articleTemplate.find('.btn-buy').hide();
        } else {
            articleTemplate.find('.article-seller').text(seller);
            articleTemplate.find('.btn-buy').show();
        }

        // add this new article
        articlesRow.append(articleTemplate.html());
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
                });
        } catch (error) {
            console.error(error.message);
        }
    },

    async buyArticle() {
        event.preventDefault();

        // retrieve the article details
        const _articleId = $(event.target).data('id');
        const _price = web3.utils.toWei(web3.utils.toBN(parseFloat($(event.target).data('value')).toString(), "ether"));

        try {
            await App.chainListInstance.methods
                .buyArticle(_articleId)
                .send({
                    from: App.account,
                    value: _price,
                    gas: 500000
                })
                .once('transactionHash', function (hash) {
                    console.log("transactionHash: " + hash);
                });
        } catch (error) {
            console.error(error.message);
        }
    },

    subscribeEvents() {
        if (App.logSellArticleEvent == null) {
            // watch for new article
            App.logSellArticleEvent = App.chainListInstance.events
                .LogSellArticle({ fromBlock: '0' })
                .on("data", function(event) {
                    $('#' + event.id).remove();
                    $("#events").append(
                        '<li class="list-group-item" id=' + event.id + '>' + event.returnValues._name + " is for sale" + "</li>"
                    );

                    App.reloadArticles();
                })
                .on("error", function(error) {
                    console.error(error);
                });
        }

        if (App.logBuyArticleEvent == null) {
            // watch for sold article
            App.logBuyArticleEvent = App.chainListInstance.events
                .LogBuyArticle({ fromBlock: '0' })
                .on("data", function(event) {
                    $('#' + event.id).remove();
                    $("#events").append(
                        '<li class="list-group-item" id=' + event.id + '>' + event.returnValues._buyer + ' bought ' + event.returnValues._name + '</li>'
                    );

                    App.reloadArticles();
                })
                .on("error", function(error) {
                    console.error(error);
                });
        }

        // switch visibility of buttons
        $('.btn-subscribe').hide();
        $('.btn-unsubscribe').show();
        $('.btn-show-events').show();
    },

    async unsubscribeEvents() {
        if (App.logSellArticleEvent != null) {
            console.log("Unsubscribe 1");
            await App.logSellArticleEvent.unsubscribe();
            App.logSellArticleEvent = null;
        }

        if (App.logBuyArticleEvent != null) {
            console.log("Unsubscribe 2");
            await App.logBuyArticleEvent.unsubscribe();
            App.logBuyArticleEvent = null;
        }

        // force a close of the events area
        $('#events')[0].className = "list-group collapse";

        // switch visibility of buttons
        $('.btn-show-events').hide();
        $('.btn-unsubscribe').hide();
        $('.btn-subscribe').show();
    }
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});
