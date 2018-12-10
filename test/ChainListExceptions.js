const ChainList = artifacts.require("ChainList");

// test suite
contract("ChainList", accounts => {
    let chainListInstance;
    const seller = accounts[1];
    const buyer1 = accounts[2];
    const buyer2 = accounts[3];
    const articleId = 1;
    const articleName = "article 1";
    const articleDescription = "Description for article 1";
    const articlePrice = 10;

    before("setup contract for each test", async () => {
        chainListInstance = await ChainList.deployed();
    });

    // no article for sale yet
    it("should throw an exception if you try to buy an article when there is no article for sale yet", async () => {
        try {
            await chainListInstance
                .buyArticle({
                    from: buyer1,
                    value: web3.utils.toWei(web3.utils.toBN(articlePrice1).toString(), "ether")
                });

            // we should never reach this step
            assert.fail();
        } catch (e) {
            assert(true);
        }

        const nbArticles = await chainListInstance.getNumberOfArticles();
        assert.equal(web3.utils.toBN(nbArticles), 0, "number of articles must be 0");
    });

    // buy an article that does not exist
    it("should throw an exception if you try to buy an article that does not exist", async () => {
        try {
            await chainListInstance
                .buyArticle(2, {
                    from: buyer1,
                    value: web3.utils.toWei(web3.utils.toBN(articlePrice1).toString(), "ether")
                });

            // we should never reach this step
            assert.fail()
        } catch(e){
            assert(true)
        }
    })

    // buying an article you are selling
    it("should throw an exception if you try to buy your own article", async () => {
        // sell an article
        await chainListInstance.sellArticle(
            articleName,
            articleDescription,
            web3.utils.toWei(web3.utils.toBN(articlePrice).toString(), "ether"),
            {from: seller}
        );

        try {
            await chainListInstance.methods
                .buyArticle(articleId, {
                    from: seller,
                    value: web3.utils.toWei(web3.utils.toBN(articlePrice).toString(), "ether")
                });

            // we should never reach this step
            assert.fail();
        } catch (e) {
            assert(true);
        }

        const articles = await chainListInstance.articles(articleId);
        assert.equal(web3.utils.toBN(articles[0]), articleId, "article id must be articleId");
        assert.equal(articles[1], seller, "seller must be " + seller);
        assert.equal(articles[2], 0x0, "buyer must be empty");
        assert.equal(articles[3], articleName, "article name must be " + articleName);
        assert.equal(articles[4], articleDescription, "article description must be " + articleDescription);
        assert.equal(
            web3.utils.toBN(articles[5]), web3.utils.toWei(web3.utils.toBN(articlePrice).toString(), "ether"),
            "event article price must be " + web3.utils.toWei(web3.utils.toBN(articlePrice).toString(), "ether"));
    });

    // incorrect price
    it("should throw an exception if you try to buy an article for a value different from its price", async () => {
        try {
            await chainListInstance
                .buyArticle(articleId, {
                    from: buyer1,
                    value: web3.utils.toWei(web3.utils.toBN(articlePrice + 1).toString(), "ether")
                });

            // we should never reach this step
            assert.fail();
        } catch (e) {
            assert(true);
        }

        const articles = await chainListInstance.articles(articleId);
        assert.equal(web3.utils.toBN(articles[0]), articleId, "article id must be articleId");
        assert.equal(articles[1], seller, "seller must be " + seller);
        assert.equal(articles[2], 0x0, "buyer must be empty");
        assert.equal(articles[3], articleName, "article name must be " + articleName);
        assert.equal(articles[4], articleDescription, "article description must be " + articleDescription);
        assert.equal(
            web3.utils.toBN(articles[5]), web3.utils.toWei(web3.utils.toBN(articlePrice).toString(), "ether"),
            "event article price must be " + web3.utils.toWei(web3.utils.toBN(articlePrice).toString(), "ether"));
    });

    // article has already been sold
    it("should throw an exception if you try to buy an article that has already been sold", async () => {
        await chainListInstance
            .buyArticle(articleId, {
                from: buyer1,
                value: web3.utils.toWei(web3.utils.toBN(articlePrice).toString(), "ether")
            });

        try {
            await chainListInstance
                .buyArticle(articleId, {
                    from: buyer2,
                    value: web3.utils.toWei(web3.utils.toBN(articlePrice).toString(), "ether")
                })

            // we should never reach this step
            assert.fail();
        } catch (e) {
            assert(true);
        }


        const articles = await chainListInstance.articles(articleId);
        assert.equal(web3.utils.toBN(articles[0]), articleId, "article id must be articleId");
        assert.equal(articles[1], seller, "seller must be " + seller);
        assert.equal(articles[2], buyer1, "buyer must be " + buyer1);
        assert.equal(articles[3], articleName, "article name must be " + articleName);
        assert.equal(articles[4], articleDescription, "article description must be " + articleDescription);
        assert.equal(
            web3.utils.toBN(articles[5]), web3.utils.toWei(web3.utils.toBN(articlePrice).toString(), "ether"),
            "event article price must be " + web3.utils.toWei(web3.utils.toBN(articlePrice).toString(), "ether"));
    });
});
