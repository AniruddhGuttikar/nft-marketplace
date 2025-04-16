// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Mapping from token ID to creator address
    mapping(uint256 => address) private _creators;
    
    // Event emitted when a new token is created
    event TokenCreated(uint256 indexed tokenId, address creator, string tokenURI);

    constructor() ERC721("Signularity Tokens", "SNGT") {}

    /**
     * @dev Creates a new token
     * @param tokenURI URI for token metadata
     * @return tokenId of the new token
     */
    function createToken(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _creators[newTokenId] = msg.sender;
        
        emit TokenCreated(newTokenId, msg.sender, tokenURI);
        
        return newTokenId;
    }
    
    /**
     * @dev Returns the creator of a token
     * @param tokenId The token to get the creator for
     * @return The address of the creator
     */
    function getCreator(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "NFT: Creator query for nonexistent token");
        return _creators[tokenId];
    }
    
    /**
     * @dev Returns the total supply of tokens
     * @return The total number of tokens
     */
    function getTotalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}