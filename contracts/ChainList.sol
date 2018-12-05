pragma solidity >0.4.99 <0.6.0;

contract ChainList {
    // State variables
    address seller;
    string name;
    string description;
    uint256 price;


    // Events
    event LogSellArticle (
        address indexed _seller,
        string _name,
        uint256 _price
    );

    // sell an article
    function sellArticle(string memory _name, string memory _description, uint256 _price) public {
        seller = msg.sender;
        name = _name;
        description = _description;
        price = _price;

        emit LogSellArticle(seller, name, price);
    }

    // get the article
    function getArticle() public view returns (
        address _seller,
        string memory _name,
        string memory _description,
        uint256 _price) {
        return(seller, name, description, price);
    }
}