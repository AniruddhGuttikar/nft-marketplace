// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Royalty is Ownable {
    // Mapping from token ID to royalty percentage (in basis points, e.g., 250 = 2.5%)
    mapping(uint256 => uint256) private _royaltyPercentages;
    
    // Default royalty percentage (250 = 2.5%)
    uint256 public defaultRoyaltyPercentage = 250;
    
    // Maximum royalty percentage (1000 = 10%)
    uint256 public maxRoyaltyPercentage = 1000;
    
    event RoyaltySet(uint256 indexed tokenId, uint256 percentage);
    event DefaultRoyaltyUpdated(uint256 oldPercentage, uint256 newPercentage);
    
    /**
     * @dev Sets the royalty percentage for a token
     * @param tokenId The token ID
     * @param percentage The royalty percentage in basis points (e.g., 250 = 2.5%)
     */
    function setRoyaltyPercentage(uint256 tokenId, uint256 percentage) external {
        require(percentage <= maxRoyaltyPercentage, "Royalty: Percentage exceeds maximum");
        _royaltyPercentages[tokenId] = percentage;
        emit RoyaltySet(tokenId, percentage);
    }
    
    /**
     * @dev Gets the royalty percentage for a token
     * @param tokenId The token ID
     * @return The royalty percentage in basis points
     */
    function getRoyaltyPercentage(uint256 tokenId) public view returns (uint256) {
        uint256 percentage = _royaltyPercentages[tokenId];
        return percentage > 0 ? percentage : defaultRoyaltyPercentage;
    }
    
    /**
     * @dev Updates the default royalty percentage
     * @param percentage The new default royalty percentage in basis points
     */
    function updateDefaultRoyaltyPercentage(uint256 percentage) external onlyOwner {
        require(percentage <= maxRoyaltyPercentage, "Royalty: Percentage exceeds maximum");
        uint256 oldPercentage = defaultRoyaltyPercentage;
        defaultRoyaltyPercentage = percentage;
        emit DefaultRoyaltyUpdated(oldPercentage, percentage);
    }
    
    /**
     * @dev Calculates the royalty amount for a given price
     * @param tokenId The token ID
     * @param price The sale price
     * @return The royalty amount
     */
    function calculateRoyalty(uint256 tokenId, uint256 price) public view returns (uint256) {
        uint256 percentage = getRoyaltyPercentage(tokenId);
        return (price * percentage) / 10000;
    }
}