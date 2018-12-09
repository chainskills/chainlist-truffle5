const ChainList = artifacts.require("ChainList");

// test suite
contract("ChainList", accounts => {
    let chainListInstance;
    const seller = accounts[1];
    const buyer = accounts[2];
    const articleName1 = "article 1";
    const articleDescription1 = "Description for article 1";
    const articlePrice1 = 3;
    const articleName2 = "article 2";
    const articleDescription2 = "Description for article 2";
    const articlePrice2 = 6;
    let sellerBalanceBeforeSale, sellerBalanceAfterSale;
    let buyerBalanceBeforeSale, buyerBalanceAfterSale;

    before("setup contract for each test", async () => {
        chainListInstance = await ChainList.deployed();
    });

    it("should be initialized with empty values", async () => {
        const nbArticles = await chainListInstance.getNumberOfArticles();
        assert.equal(web3.utils.toBN(nbArticles), 0, "number of articles must be zero");

        const articlesForSale = await chainListInstance.getArticlesForSale();
        assert.equal(articlesForSale.length, 0, "there shouldn't be any article for sale");
    });

    // sell a first article
    it("should let us sell a first article", async () => {
        const receipt = await chainListInstance
            .sellArticle(
                articleName1,
                articleDescription1,
                web3.utils.toWei(web3.utils.toBN(articlePrice1).toString(), "ether"), {
                from: seller
            });

        assert.equal(receipt.logs.length, 1, "one event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
        assert.equal(receipt.logs[0].args._seller, seller, "seller must be " + seller);
        assert.equal(receipt.logs[0].args._name, articleName1, "article name must be " + articleName1);
        assert.equal(
            web3.utils.toBN(receipt.logs[0].args._price),
            web3.utils.toWei(web3.utils.toBN(articlePrice1).toString(), "ether"),
            "event article price must be " + web3.utils.toWei(web3.utils.toBN(articlePrice1).toString(), "ether")
        );

        const nbArticles = await chainListInstance.getNumberOfArticles();
        assert.equal(web3.utils.toBN(nbArticles), 1, "number of articles must be 1");

        const articlesForSale = await chainListInstance.getArticlesForSale();
        assert.equal(articlesForSale.length, 1, "there must be one article for sale");

        const articles = await chainListInstance.articles(articlesForSale[0]);
        assert.equal(web3.utils.toBN(articles[0]), 1, "article id must be 1");
        assert.equal(articles[1], seller, "seller must be " + seller);
        assert.equal(articles[2], 0x0, "buyer must be empty");
        assert.equal(articles[3], articleName1, "article name must be " + articleName1);
        assert.equal(articles[4], articleDescription1, "article description must be " + articleDescription1);
        assert.equal(
            web3.utils.toBN(articles[5]), web3.utils.toWei(web3.utils.toBN(articlePrice1).toString(), "ether"),
            "event article price must be " + web3.utils.toWei(web3.utils.toBN(articlePrice1).toString(), "ether"));
    });

    // sell a second article
    it("should let us sell a second article", async () => {
        const receipt = await chainListInstance
            .sellArticle(
                articleName2,
                articleDescription2,
                web3.utils.toWei(web3.utils.toBN(articlePrice2).toString(), "ether"), {
                    from: seller
                });

        assert.equal(receipt.logs.length, 1, "one event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
        assert.equal(receipt.logs[0].args._seller, seller, "seller must be " + seller);
        assert.equal(receipt.logs[0].args._name, articleName2, "article name must be " + articleName2);
        assert.equal(
            web3.utils.toBN(receipt.logs[0].args._price),
            web3.utils.toWei(web3.utils.toBN(articlePrice2).toString(), "ether"),
            "event article price must be " + web3.utils.toWei(web3.utils.toBN(articlePrice2).toString(), "ether")
        );

        const nbArticles = await chainListInstance.getNumberOfArticles();
        assert.equal(web3.utils.toBN(nbArticles), 2, "number of articles must be 2");

        const articlesForSale = await chainListInstance.getArticlesForSale();
        assert.equal(articlesForSale.length, 2, "there must be two articles for sale");

        const articles = await chainListInstance.articles(articlesForSale[1]);
        assert.equal(web3.utils.toBN(articles[0]), 2, "article id must be 2");
        assert.equal(articles[1], seller, "seller must be " + seller);
        assert.equal(articles[2], 0x0, "buyer must be empty");
        assert.equal(articles[3], articleName2, "article name must be " + articleName2);
        assert.equal(articles[4], articleDescription2, "article description must be " + articleDescription2);
        assert.equal(
            web3.utils.toBN(articles[5]), web3.utils.toWei(web3.utils.toBN(articlePrice2).toString(), "ether"),
            "event article price must be " + web3.utils.toWei(web3.utils.toBN(articlePrice2).toString(), "ether"));
    });

    // buy the first article
    it("should let us buy the first article", async () => {
        // record balances of seller and buyer before the sale
        let balance = await web3.eth.getBalance(seller);
        sellerBalanceBeforeSale = web3.utils.fromWei(balance, "ether");

        balance = await web3.eth.getBalance(buyer);
        buyerBalanceBeforeSale = web3.utils.fromWei(balance, "ether");

        // buy the article
        let receipt = await chainListInstance
            .buyArticle(1, {
                from: buyer,
                value: web3.utils.toWei(web3.utils.toBN(articlePrice1).toString(), "ether")
            });

        assert.equal(receipt.logs.length, 1, "one event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogSellArticle");
        assert.equal(receipt.logs[0].args._seller, seller, "seller must be " + seller);
        assert.equal(receipt.logs[0].args._buyer, buyer, "buyer must be " + buyer);
        assert.equal(receipt.logs[0].args._name, articleName1, "article name must be " + articleName1);
        assert.equal(
            web3.utils.toBN(receipt.logs[0].args._price),
            web3.utils.toWei(web3.utils.toBN(articlePrice1).toString(), "ether"),
            "event article price must be " + web3.utils.toWei(web3.utils.toBN(articlePrice2).toString(), "ether")
        );

        // record balances of seller and buyer after the sale
        balance = await web3.eth.getBalance(seller);
        sellerBalanceAfterSale = web3.utils.fromWei(balance, "ether");

        balance = await web3.eth.getBalance(buyer);
        buyerBalanceAfterSale = web3.utils.fromWei(balance, "ether");

        const articlesForSale = await chainListInstance.getArticlesForSale();
        assert.equal(articlesForSale.length, 1, "there must be one article for sale");

        const nbArticles = await chainListInstance.getNumberOfArticles();
        assert.equal(web3.utils.toBN(nbArticles), 2, "number of articles must be 2");

        const articles = await chainListInstance.articles(articlesForSale[0]);
        assert.equal(web3.utils.toBN(articles[0]), 2, "article id must be 2");
        assert.equal(articles[1], seller, "seller must be " + seller);
        assert.equal(articles[2], 0x0, "buyer must be empty");
        assert.equal(articles[3], articleName2, "article name must be " + articleName2);
        assert.equal(articles[4], articleDescription2, "article description must be " + articleDescription2);
        assert.equal(
            web3.utils.toBN(articles[5]), web3.utils.toWei(web3.utils.toBN(articlePrice2).toString(), "ether"),
            "event article price must be " + web3.utils.toWei(web3.utils.toBN(articlePrice2).toString(), "ether"));
    });
});
