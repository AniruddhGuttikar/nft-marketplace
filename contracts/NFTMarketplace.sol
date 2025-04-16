// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./NFT.sol";
import "./Royalty.sol";

contract NFTMarketplace is ReentrancyGuard {
    using SafeMath for uint256;
    
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }
    
    // Counter for market items
    uint256 private _itemIds;
    uint256 private _itemsSold;
    
    // Marketplace fee percentage (250 = 2.5%)
    uint256 public marketFeePercentage = 250;
    
    // Address that receives marketplace fees
    address payable public feeReceiver;
    
    // NFT contract
    NFT public nftContract;
    
    // Royalty contract
    Royalty public royaltyContract;
    
    // Mapping from item ID to MarketItem
    mapping(uint256 => MarketItem) private idToMarketItem;
    
    // Events
    event MarketItemCreated(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );
    
    event MarketItemSold(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price
    );
    
    event RoyaltyPaid(
        uint256 indexed tokenId,
        address creator,
        uint256 amount
    );
    
    /**
     * @dev Constructor
     * @param _nftContract Address of the NFT contract
     * @param _royaltyContract Address of the royalty contract
     * @param _feeReceiver Address that receives marketplace fees
     */
    constructor(address _nftContract, address _royaltyContract, address _feeReceiver) {
        nftContract = NFT(_nftContract);
        royaltyContract = Royalty(_royaltyContract);
        feeReceiver = payable(_feeReceiver);
    }
    
    /**
     * @dev Lists an NFT in the marketplace
     * @param tokenId Token ID of the NFT
     * @param price Price of the NFT
     */
    function createMarketItem(uint256 tokenId, uint256 price) public nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Only owner can create market item");
        require(nftContract.getApproved(tokenId) == address(this), "Marketplace must be approved to transfer");
        
        _itemIds++;
        uint256 itemId = _itemIds;
        
        idToMarketItem[itemId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );
        
        emit MarketItemCreated(
            itemId,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }
    
    /**
     * @dev Purchases an NFT from the marketplace
     * @param itemId ID of the market item
     */
    function createMarketSale(uint256 itemId) public payable nonReentrant {
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        uint256 price = idToMarketItem[itemId].price;
        address payable seller = idToMarketItem[itemId].seller;
        
        require(itemId > 0 && itemId <= _itemIds, "Item doesn't exist");
        require(!idToMarketItem[itemId].sold, "Item already sold");
        require(msg.value == price, "Please submit the asking price");
        
        // Calculate and pay royalty
        address creator = nftContract.getCreator(tokenId);
        uint256 royaltyAmount = royaltyContract.calculateRoyalty(tokenId, price);
        
        // Calculate marketplace fee
        uint256 marketFee = price.mul(marketFeePercentage).div(10000);
        
        // Calculate seller proceeds
        uint256 sellerProceeds = price.sub(royaltyAmount).sub(marketFee);
        
        // Mark as sold and update owner
        idToMarketItem[itemId].sold = true;
        idToMarketItem[itemId].owner = payable(msg.sender);
        _itemsSold++;
        
        // Transfer NFT
        nftContract.transferFrom(seller, msg.sender, tokenId);
        
        // Send funds to seller, creator, and fee receiver
        if (royaltyAmount > 0) {
            payable(creator).transfer(royaltyAmount);
            emit RoyaltyPaid(tokenId, creator, royaltyAmount);
        }
        
        feeReceiver.transfer(marketFee);
        seller.transfer(sellerProceeds);
        
        emit MarketItemSold(
            itemId,
            tokenId,
            seller,
            msg.sender,
            price
        );
    }
    
    /**
     * @dev Returns all unsold market items
     * @return Array of unsold market items
     */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds;
        uint256 unsoldItemCount = _itemIds - _itemsSold;
        uint256 currentIndex = 0;
        
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 1; i <= itemCount; i++) {
            if (!idToMarketItem[i].sold) {
                MarketItem storage currentItem = idToMarketItem[i];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        
        return items;
    }
    
    /**
     * @dev Returns all NFTs owned by the caller
     * @return Array of caller's NFTs
     */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender) {
                itemCount++;
            }
        }
        
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender) {
                MarketItem storage currentItem = idToMarketItem[i];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        
        return items;
    }
    
    /**
     * @dev Returns all NFTs created by the caller
     * @return Array of caller's created NFTs
     */
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (nftContract.getCreator(idToMarketItem[i].tokenId) == msg.sender) {
                itemCount++;
            }
        }
        
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (nftContract.getCreator(idToMarketItem[i].tokenId) == msg.sender) {
                MarketItem storage currentItem = idToMarketItem[i];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        
        return items;
    }
}