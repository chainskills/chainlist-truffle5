const ChainList = artifacts.require("ChainList");

// test suite
contract("ChainList", accounts => {
    let chainListInstance;
    const seller = accounts[1];
    const articleName = "article 1";
    const articleDescription = "Description for article 1";
    const articlePrice = 10;

    before('setup contract for each test', async () => {
        chainListInstance = await ChainList.deployed();
    })

    it("should be initialized with empty values", async () => {
        const article = await chainListInstance.getArticle();
 
        assert.equal(article._seller, 0x0, "seller must be empty");
        assert.equal(article._name, '', "article name must be empty");
        assert.equal(article._description, '', "description must be empty");
        assert.equal(web3.utils.toBN(article._price), 0, "article price must be zero");
    });

    it("should let us sell a first article", async () => {
        await chainListInstance.sellArticle(
                articleName,
                articleDescription,
                web3.utils.toWei(parseFloat(articlePrice).toString(), "ether"), {from: seller});
        const article = await chainListInstance.getArticle();
        
        assert.equal(article._seller, seller, "seller must be " + seller);
        assert.equal(article._name, articleName, "article name must be " + articleName);
        assert.equal(article._description, articleDescription, "description must be " + articleDescription);
        assert.equal(web3.utils.toBN(article._price), web3.utils.toWei(parseFloat(articlePrice).toString(), "ether"), "article price must be " + web3.utils.toWei(parseFloat(articlePrice).toString(), "ether"));
    });
})