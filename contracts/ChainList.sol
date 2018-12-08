pragma solidity >0.4.99 < 0.6.0;

contract ChainList {
    // State variables
    address payable seller;
    address buyer;
    string name;
    string description;
    uint256 price;


    // Events
    event LogSellArticle (
        address indexed _seller,
        string _name,
        uint256 _price
    );
    event LogBuyArticle(
        address indexed _seller,
        address indexed _buyer,
        string _name,
        uint256 _price
    );

    // sell an article
    function sellArticle(string memory _name, string memory _description, uint256 _price) public {
        seller = msg.sender;
        buyer = address(0);
        name = _name;
        description = _description;
        price = _price;

        emit LogSellArticle(seller, name, price);
    }


    // buy an article
    function buyArticle() payable public {
        // we check whether there is an article for sale
        require(seller != address(0), "No articles to buy");

        // we check that the article was not already sold
        require(buyer == address(0), "Article already sold");

        //we don't allow the seller to buy its own article
        require(msg.sender != seller, "Buyer cannot be the seller");

        //we check whether the value sent corresponds to the article price
        require(msg.value == price, "Price doesn't match");

        // keep buyer's information
        buyer = msg.sender;

        // the buyer can buy the article
        seller.transfer(msg.value);

        // trigger the event
        emit LogBuyArticle(seller, buyer, name, price);
    }


    // get the article
    function getArticle() public view returns (
        address _seller,
        address _buyer,
        string memory _name,
        string memory _description,
        uint256 _price) {
        return (seller, buyer, name, description, price);
    }
}