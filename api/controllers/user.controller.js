const contractUtils = require("../utils/contract.utils");
const ipfsUtils = require("../utils/ipfs.utils");
const ethers = require("ethers");

// Get contract instances
const { marketplaceContract, nftContract } = contractUtils.getContracts();

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const address = req.params.address;

    // Get NFTs created by user
    const totalSupply = await nftContract.getTotalSupply();
    let createdCount = 0;

    for (let i = 1; i <= totalSupply; i++) {
      try {
        const creator = await nftContract.getCreator(i);
        if (creator.toLowerCase() === address.toLowerCase()) {
          createdCount++;
        }
      } catch (err) {
        // Skip this NFT if there's an error
      }
    }

    // Get owned NFTs
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const marketplace =
      contractUtils.getMarketplaceContractWithSigner(provider);
    const items = await marketplace.fetchMyNFTs();

    res.json({
      address,
      stats: {
        createdNFTs: createdCount,
        ownedNFTs: items.length,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's NFT collection
 */
exports.getUserNFTs = async (req, res) => {
  try {
    const address = req.params.address;

    // Get NFTs owned by user
    const ownedNFTs = [];
    const totalSupply = await nftContract.getTotalSupply();

    for (let i = 1; i <= totalSupply; i++) {
      try {
        const owner = await nftContract.ownerOf(i);
        if (owner.toLowerCase() === address.toLowerCase()) {
          const tokenURI = await nftContract.tokenURI(i);
          const creator = await nftContract.getCreator(i);
          const metadata = await ipfsUtils.getMetadataFromIPFS(tokenURI);

          ownedNFTs.push({
            tokenId: i,
            owner,
            creator,
            tokenURI,
            metadata,
          });
        }
      } catch (err) {
        // Skip this NFT if there's an error
      }
    }

    res.json(ownedNFTs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get NFTs created by user
 */
exports.getCreatedNFTs = async (req, res) => {
  try {
    const address = req.params.address;

    // Get NFTs created by user
    const createdNFTs = [];
    const totalSupply = await nftContract.getTotalSupply();

    for (let i = 1; i <= totalSupply; i++) {
      try {
        const creator = await nftContract.getCreator(i);
        if (creator.toLowerCase() === address.toLowerCase()) {
          const tokenURI = await nftContract.tokenURI(i);
          const owner = await nftContract.ownerOf(i);
          const metadata = await ipfsUtils.getMetadataFromIPFS(tokenURI);

          createdNFTs.push({
            tokenId: i,
            owner,
            creator,
            tokenURI,
            metadata,
          });
        }
      } catch (err) {
        // Skip this NFT if there's an error
      }
    }
    res.json(createdNFTs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get sales history for user
 */
exports.getSalesHistory = async (req, res) => {
  try {
    const address = req.params.address;
    // TODO: get the queries from the blockchain
    // This is a simplified version that returns an empty array
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
