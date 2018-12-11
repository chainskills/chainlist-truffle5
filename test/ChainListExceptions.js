const ChainList = artifacts.require("ChainList");

// test suite
contract("ChainList", accounts => {
    let chainListInstance;
    const seller = accounts[1];
    const buyer1 = accounts[2];
    const buyer2 = accounts[3];
    const articleName = "article 1";
    const articleDescription = "Description for article 1";
    const articlePrice = 1.5;

    before("setup contract for each test", async () => {
        chainListInstance = await ChainList.deployed();
    });

    // no article for sale yet
    it("should throw an exception if you try to buy an article when there is no article for sale yet", async () => {
        try {
            await chainListInstance
                .buyArticle({
                    from: buyer1,
                    value: web3.utils.toWei(parseFloat(articlePrice).toString(), "ether")
                });

            // we should never reach this step
            assert.fail();
        } catch(e){
            assert(true);
        }

        const article = await chainListInstance.getArticle();

        assert.equal(article._seller, 0x0, "seller must be empty");
        assert.equal(article._buyer, 0x0, "buyer must be empty");
        assert.equal(article._name, "", "article name must be empty");
        assert.equal(article._description, "", "description must be empty");
        assert.equal(web3.utils.toBN(article._price), 0, "article price must be zero");
    });

    // buying an article you are selling
    it("should throw an exception if you try to buy your own article", async () => {
        // sell an article
        await chainListInstance.sellArticle(
            articleName,
            articleDescription,
            web3.utils.toWei(parseFloat(articlePrice).toString(), "ether"),
            {from: seller}
        );

        try {
            await chainListInstance.methods
                .buyArticle({
                    from: seller,
                    value: web3.utils.toWei(parseFloat(articlePrice).toString(), "ether")
                });

            // we should never reach this step
            assert.fail();
        } catch(e){
            assert(true);
        }

        const article = await chainListInstance.getArticle();

        assert.equal(article._seller, seller, "seller must be " + seller);
        assert.equal(article._buyer, 0x0, "buyer must be empty");
        assert.equal(article._name, articleName, "article name must be " + articleName);
        assert.equal(article._description, articleDescription, "description must be " + articleDescription);
        assert.equal(
            web3.utils.toBN(article._price),
            web3.utils.toWei(parseFloat(articlePrice).toString(), "ether"),
            "article price must be " + web3.utils.toWei(parseFloat(articlePrice).toString(), "ether")
        );
    });

    // incorrect price
    it("should throw an exception if you try to buy an article for a value different from its price", async () => {
        try {
            await chainListInstance
                .buyArticle({
                    from: buyer1,
                    value: web3.utils.toWei(parseFloat(articlePrice + 1).toString(), "ether")
                });

            // we should never reach this step
            assert.fail();
        } catch(e){
            assert(true);
        }

        const article = await chainListInstance.getArticle();

        assert.equal(article._seller, seller, "seller must be " + seller);
        assert.equal(article._buyer, 0x0, "buyer must be empty");
        assert.equal(article._name, articleName, "article name must be " + articleName);
        assert.equal(article._description, articleDescription, "description must be " + articleDescription);
        assert.equal(
            web3.utils.toBN(article._price),
            web3.utils.toWei(parseFloat(articlePrice).toString(), "ether"),
            "article price must be " + web3.utils.toWei(parseFloat(articlePrice).toString(), "ether")
        );
    });

    // article has already been sold
    it("should throw an exception if you try to buy an article that has already been sold", async () => {
        await chainListInstance
            .buyArticle({
                from: buyer1,
                value: web3.utils.toWei(parseFloat(articlePrice).toString(), "ether")
            });

        try {
            await chainListInstance
                .buyArticle({
                    from: buyer2,
                    value: web3.utils.toWei(parseFloat(articlePrice).toString(), "ether")
                })

            // we should never reach this step
            assert.fail();
        } catch(e){
            assert(true);
        }

        const article = await chainListInstance.getArticle();

        assert.equal(article._seller, seller, "seller must be " + seller);
        assert.equal(article._buyer, buyer1, "buyer must be " + buyer1);
        assert.equal(article._name, articleName, "article name must be " + articleName);
        assert.equal(article._description, articleDescription, "description must be " + articleDescription);
        assert.equal(
            web3.utils.toBN(article._price),
            web3.utils.toWei(parseFloat(articlePrice).toString(), "ether"),
            "article price must be " + web3.utils.toWei(parseFloat(articlePrice).toString(), "ether")
        );
    });

});