const ethers = require("ethers");
const ipfsUtils = require("../utils/ipfs.utils");
const contractUtils = require("../utils/contract.utils");

// Get contract instances
const { nftContract, royaltyContract } = contractUtils.getContracts();

/**
 * Get all NFTs
 */
exports.getAllNFTs = async (req, res) => {
  try {
    const totalSupply = await nftContract.getTotalSupply();
    const nfts = [];

    for (let i = 1; i <= totalSupply; i++) {
      try {
        const tokenURI = await nftContract.tokenURI(i);
        const owner = await nftContract.ownerOf(i);
        const creator = await nftContract.getCreator(i);

        // Get metadata from IPFS
        const metadata = await ipfsUtils.getMetadataFromIPFS(tokenURI);

        nfts.push({
          tokenId: i,
          owner,
          creator,
          tokenURI,
          metadata,
        });
      } catch (err) {
        console.error(`Error fetching NFT ${i}:`, err);
        // Skip this NFT if there's an error
      }
    }

    res.json(nfts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get NFT by token ID
 */
exports.getNFTByTokenId = async (req, res) => {
  try {
    const tokenId = req.params.tokenId;
    console.log("getNFTByTokenId called with tokenId: ", tokenId);
    // Check if NFT exists
    try {
      await nftContract.ownerOf(tokenId);
    } catch (err) {
      return res.status(404).json({ error: "NFT not found" });
    }

    const tokenURI = await nftContract.tokenURI(tokenId);
    const owner = await nftContract.ownerOf(tokenId);
    const creator = await nftContract.getCreator(tokenId);
    const royaltyPercentage = await royaltyContract.getRoyaltyPercentage(
      tokenId
    );

    // Get metadata from IPFS
    const metadata = await ipfsUtils.getMetadataFromIPFS(tokenURI);

    console.log(
      `tokenURI: ${tokenURI}, owner: ${owner}, creator: ${creator}, royaltyPercentage: ${typeof royaltyPercentage}`
    );
    console.log("metadata: ", metadata);

    res.json({
      tokenId,
      owner,
      creator,
      tokenURI,
      metadata,
      royaltyPercentage: Number(royaltyPercentage) / 100, // Convert basis points to percentage
    });
  } catch (error) {
    console.error("Error in getNFTByTokenId: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
/**
 * Create a new NFT
 */
exports.createNFT = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      attributes,
      creatorAddress,
      royaltyPercentage,
    } = req.body;

    if (!name || !description || !image || !creatorAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create metadata
    const metadata = {
      name,
      description,
      image,
      attributes: attributes || [],
    };

    // Upload metadata to IPFS
    const metadataCID = await ipfsUtils.uploadMetadataToIPFS(metadata);
    const tokenURI = `ipfs://${metadataCID}`;

    // Return info needed for frontend to create the NFT
    // Note: Actual minting happens on client side with user's wallet
    res.json({
      tokenURI,
      metadata,
      instructions: {
        contractAddress: nftContract.address,
        methodName: "createToken",
        params: [tokenURI],
        royaltyPercentage: royaltyPercentage || 250, // Default 2.5%
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get NFTs by creator address
 */
exports.getNFTsByCreator = async (req, res) => {
  try {
    const creatorAddress = req.params.address;
    const totalSupply = await nftContract.getTotalSupply();
    const nfts = [];

    for (let i = 1; i <= totalSupply; i++) {
      try {
        const creator = await nftContract.getCreator(i);

        if (creator.toLowerCase() === creatorAddress.toLowerCase()) {
          const tokenURI = await nftContract.tokenURI(i);
          const owner = await nftContract.ownerOf(i);

          // Get metadata from IPFS
          const metadata = await ipfsUtils.getMetadataFromIPFS(tokenURI);

          nfts.push({
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

    res.json(nfts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload file to IPFS
 */
exports.uploadToIPFS = async (req, res) => {
  try {
    console.log("uplaodToIPFS called");
    console.log(req.files.image);
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.image;
    const result = await ipfsUtils.uploadFileToIPFS(
      file.data,
      file.name,
      file.mimetype
    );

    res.json({
      success: true,
      cid: result.cid,
      url: `ipfs://${result.cid}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
