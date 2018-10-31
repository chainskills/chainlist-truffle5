pragma solidity ^0.4.25;

contract ChainList {
    // State variables
    address seller;
    string name;
    string description;
    uint256 price;



    // constructor -> create a default article
    constructor() public {
        sellArticle("Default article", "This an article set by default", 1000000000000000000);
    }

    // sell an article
    function sellArticle(string _name, string _description, uint256 _price) public {
        seller = msg.sender;
        name = _name;
        description = _description;
        price = _price;
    }

    // get the article
    function getArticle() public view returns (
        address _seller,
        string _name,
        string _description,
        uint256 _price) {
        return(seller, name, description, price);
    }
}