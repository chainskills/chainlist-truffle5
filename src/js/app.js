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

        // retrieve the article placeholder and clear it
        $("#articlesRow").empty();

        try {
            const article = await App.chainListInstance.methods.getArticle().call();
            if (article[0] == 0x0) {
                // no article
                App.loading = false;
                return;
            }

            // keep the price
            const price = web3.utils.fromWei(web3.utils.toBN(article._price), "ether");

            // Retrieve and fill the article template
            const articleTemplate = $("#articleTemplate");
            articleTemplate.find(".panel-title").text(article._name);
            articleTemplate.find(".article-description").text(article._description);
            articleTemplate.find(".article-price").text(price);
            articleTemplate.find('.btn-buy').attr('data-value', price);

            let seller = article._seller;
            if (seller == App.account) {
                seller = "You";
            }
            articleTemplate.find(".article-seller").text(seller);

            // buyer
            let buyer = article._buyer;
            if (buyer == App.account) {
                buyer = "You";
            } else if (buyer == 0x0) {
                buyer = "No one yet";
            }
            articleTemplate.find('.article-buyer').text(buyer);

            if (article._seller == App.account || article._buyer != 0x0) {
                articleTemplate.find('.btn-buy').hide();
            } else {
                articleTemplate.find('.btn-buy').show();
            }

            // add this new article
            $("#articlesRow").append(articleTemplate.html());
        } catch (error) {
            console.error(error.message);
        }

        App.loading = false;
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

    async buyArticle() {
        event.preventDefault();

        // retrieve the article's price
        const articlePrice = isNaN(parseFloat($(event.target).data('value'))) ? "0" : parseFloat($(event.target).data('value')).toString();

        const _price = web3.utils.toWei(articlePrice, "ether");

        try {
            await App.chainListInstance.methods
                .buyArticle()
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
                .LogSellArticle({ fromBlock: 'latest' })
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
                .LogBuyArticle({ fromBlock: 'latest' })
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
