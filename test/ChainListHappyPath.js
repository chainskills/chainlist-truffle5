const ChainList = artifacts.require("ChainList");

// test suite
contract("ChainList", accounts => {
    let chainListInstance;
    const seller = accounts[1];
    const buyer = accounts[2];
    const articleName = "article 1";
    const articleDescription = "Description for article 1";
    const articlePrice = 1;
    let sellerBalanceBeforeSale, sellerBalanceAfterSale;
    let buyerBalanceBeforeSale, buyerBalanceAfterSale;

    before("setup contract for each test", async () => {
        chainListInstance = await ChainList.deployed();
    });

    it("should be initialized with empty values", async () => {
        const article = await chainListInstance.getArticle();

        assert.equal(article._seller, 0x0, "seller must be empty");
        assert.equal(article._buyer, 0x0, "buyer must be empty");
        assert.equal(article._name, "", "article name must be empty");
        assert.equal(article._description, "", "description must be empty");
        assert.equal(web3.utils.toBN(article._price), 0, "article price must be zero");
    });

    it("should let us sell a first article", async () => {
        await chainListInstance.sellArticle(
            articleName,
            articleDescription,
            web3.utils.toWei(parseFloat(articlePrice).toString(), "ether"), {from: seller});
        const article = await chainListInstance.getArticle();

        assert.equal(article._seller, seller, "seller must be " + seller);
        assert.equal(article._buyer, 0x0, "buyer must be empty");
        assert.equal(article._name, articleName, "article name must be " + articleName);
        assert.equal(article._description, articleDescription, "description must be " + articleDescription);
        assert.equal(web3.utils.toBN(article._price), web3.utils.toWei(parseFloat(articlePrice).toString(), "ether"), "article price must be " + web3.utils.toWei(parseFloat(articlePrice).toString(), "ether"));
    });

    // Test case: should check events
    it("should trigger an event when a new article is sold", async () => {
        const receipt = await chainListInstance.sellArticle(
            articleName,
            articleDescription,
            web3.utils.toWei(parseFloat(articlePrice).toString(), "ether"),
            { from: seller }
        );

        assert.equal(receipt.logs.length, 1, "one event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
        assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
        assert.equal(receipt.logs[0].args._name, articleName, "event article name must be " + articleName);
        assert.equal(
            web3.utils.fromWei(receipt.logs[0].args._price, "ether"),
            articlePrice,
            "event article price must be " + articlePrice
        );
    });

    it("should let us buy the first article", async () => {
        // record balances of seller and buyer before the sale
        let balance = await web3.eth.getBalance(seller)
        sellerBalanceBeforeSale = web3.utils.fromWei(balance, "ether")

        balance = await web3.eth.getBalance(buyer)
        buyerBalanceBeforeSale = web3.utils.fromWei(balance, "ether")

        // buy the article
        await chainListInstance
            .buyArticle({
                from: buyer,
                value: web3.utils.toWei(parseFloat(articlePrice).toString(), "ether")
            });

        // record balances of seller and buyer after the sale
        balance = await web3.eth.getBalance(seller)
        sellerBalanceAfterSale = web3.utils.fromWei(balance, "ether")

        balance = await web3.eth.getBalance(buyer)
        buyerBalanceAfterSale = web3.utils.fromWei(balance, "ether")

        const article = await chainListInstance.getArticle();

        assert.equal(article._seller, seller, "seller must be " + seller);
        assert.equal(article._buyer, buyer, "buyer must be " + buyer);
        assert.equal(article._name, articleName, "article name must be " + articleName);
        assert.equal(article._description, articleDescription, "description must be " + articleDescription);
        assert.equal(
            web3.utils.toBN(article._price),
            web3.utils.toWei(parseFloat(articlePrice).toString(), "ether"),
            "article price must be " + web3.utils.toWei(parseFloat(articlePrice).toString(), "ether")
        );

        // check the effect of buy on balances of buyer and seller, accounting for gas
        assert(parseFloat(sellerBalanceAfterSale) === (parseFloat(sellerBalanceBeforeSale) + parseFloat(articlePrice)), "seller should have earned " + articlePrice + " ETH");
        assert(parseFloat(buyerBalanceAfterSale) <= (parseFloat(buyerBalanceBeforeSale) - parseFloat(articlePrice)), "buyer should have spent " + articlePrice + " ETH");
    })
});