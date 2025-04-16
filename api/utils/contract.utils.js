const ethers = require("ethers");
require("dotenv").config();

// Import contract ABIs
const NFT = require("../../artifacts/contracts/NFT.sol/NFT.json");
const Royalty = require("../../artifacts/contracts/Royalty.sol/Royalty.json");
const NFTMarketplace = require("../../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json");

// Import contract addresses
const contractAddresses = require("../../config/contracts");

/**
 * Get contract instances
 * @returns {Object} - Contract instances
 */
exports.getContracts = () => {
  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    // Create contract instances
    const nftContract = new ethers.Contract(
      contractAddresses.nft,
      NFT.abi,
      provider
    );

    const royaltyContract = new ethers.Contract(
      contractAddresses.royalty,
      Royalty.abi,
      provider
    );

    const marketplaceContract = new ethers.Contract(
      contractAddresses.marketplace,
      NFTMarketplace.abi,
      provider
    );

    return {
      nftContract,
      royaltyContract,
      marketplaceContract,
    };
  } catch (error) {
    console.error("Error getting contract instances:", error);
    throw new Error("Failed to get contract instances");
  }
};

/**
 * Get marketplace contract with signer
 * @param {ethers.providers.Provider} provider - Ethers provider
 * @returns {ethers.Contract} - Marketplace contract with signer
 */
exports.getMarketplaceContractWithSigner = (provider) => {
  try {
    return new ethers.Contract(
      contractAddresses.marketplace,
      NFTMarketplace.abi,
      provider
    );
  } catch (error) {
    console.error("Error getting marketplace contract with signer:", error);
    throw new Error("Failed to get marketplace contract with signer");
  }
};

/**
 * Get NFT contract with signer
 * @param {ethers.providers.Provider} provider - Ethers provider
 * @returns {ethers.Contract} - NFT contract with signer
 */
exports.getNFTContractWithSigner = (provider) => {
  try {
    return new ethers.Contract(contractAddresses.nft, NFT.abi, provider);
  } catch (error) {
    console.error("Error getting NFT contract with signer:", error);
    throw new Error("Failed to get NFT contract with signer");
  }
};
