const ethers = require("ethers");
const contractUtils = require("../utils/contract.utils");
const ipfsUtils = require("../utils/ipfs.utils");

// Get contract instances
const { marketplaceContract, nftContract } = contractUtils.getContracts();

/**
 * Get all marketplace items
 */
exports.getAllMarketItems = async (req, res) => {
  try {
    const items = await marketplaceContract.fetchMarketItems();

    const formattedItems = await Promise.all(
      items.map(async (item) => {
        // console.log("ITEM OWNER: ", typeof item.owner);

        const tokenURI = await nftContract.tokenURI(item.tokenId);
        const metadata = await ipfsUtils.getMetadataFromIPFS(tokenURI);
        const creator = await nftContract.getCreator(item.tokenId);

        // console.log("itemId: ", item.itemId);
        // console.log("item tokenId: ", item.tokenId);
        // console.log("item seller: ", item.seller);
        // console.log("item owner: ", item.owner);
        // console.log("item creator: ", creator);
        // console.log("item price: ", item.price);
        // console.log("item sold: ", item.sold);
        // console.log("item tokenURI: ", tokenURI);
        // console.log("item metadata: ", metadata);

        return {
          tokenId: item.tokenId.toString(),
          seller: item.seller,
          owner: item.owner,
          creator: creator,
          price: ethers.formatEther(item.price),
          sold: item.sold,
          tokenURI,
          metadata,
        };
      })
    );

    res.json(formattedItems);
  } catch (error) {
    console.error("Error in getAllMarketItems: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get marketplace item by ID
 */
exports.getMarketItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Since there's no direct method to get a single item,
    // we need to get all items and filter
    const items = await marketplaceContract.fetchMarketItems();
    console.log("item id: ", itemId);
    console.log("items: ", items);
    const item = items.find((item) => item[0].toString() === itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const tokenURI = await nftContract.tokenURI(item.tokenId);
    const metadata = await ipfsUtils.getMetadataFromIPFS(tokenURI);
    const creator = await nftContract.getCreator(item.tokenId);

    console.log("item tokenId: ", item.tokenId);
    console.log("item seller: ", item.seller);
    console.log("item owner: ", item.owner);
    console.log("item creator: ", creator);
    console.log("item price: ", item.price);
    console.log("item sold: ", item.sold);
    console.log("item tokenURI: ", tokenURI);
    console.log("item metadata: ", metadata);

    res.json({
      itemId: itemId.toString(),
      tokenId: item.tokenId.toString(),
      seller: item.seller,
      owner: item.owner,
      creator: creator,
      price: ethers.formatEther(item.price),
      sold: item.sold,
      tokenURI,
      metadata,
    });
  } catch (error) {
    console.error("Error in getMarketItemById: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a marketplace item
 */
exports.createMarketItem = async (req, res) => {
  try {
    const { tokenId, price } = req.body;

    console.log("tokenID, price :", tokenId, price);
    if (!tokenId || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Return information needed for frontend to create the market item
    // Actual transaction happens on client side with user's wallet
    res.json({
      instructions: {
        contractAddress: marketplaceContract.address,
        methodName: "createMarketItem",
        params: [tokenId],
        approvalNeeded: {
          contractAddress: nftContract.address,
          methodName: "approve",
          params: [marketplaceContract.address, tokenId],
        },
      },
    });
  } catch (error) {
    console.log("Error in creating the marketplace item: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get items owned by address
 */
exports.getItemsByOwner = async (req, res) => {
  try {
    const ownerAddress = req.params.address;

    // Use a provider with the owner's address
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const marketplace =
      contractUtils.getMarketplaceContractWithSigner(provider);

    // Call the contract method as if we were the owner
    const items = await marketplace.fetchMyNFTs();

    const formattedItems = await Promise.all(
      items.map(async (item) => {
        const tokenURI = await nftContract.tokenURI(item.tokenId);
        const metadata = await ipfsUtils.getMetadataFromIPFS(tokenURI);
        const creator = await nftContract.getCreator(item.tokenId);

        return {
          itemId: item.itemId.toString(),
          tokenId: item.tokenId.toString(),
          seller: item.seller,
          owner: ownerAddress,
          creator: creator,
          price: ethers.utils.formatEther(item.price),
          sold: item.sold,
          tokenURI,
          metadata,
        };
      })
    );

    res.json(formattedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get items listed by seller
 */
exports.getItemsBySeller = async (req, res) => {
  try {
    const sellerAddress = req.params.address;
    const items = await marketplaceContract.fetchMarketItems();

    const sellerItems = items.filter(
      (item) =>
        item.seller.toLowerCase() === sellerAddress.toLowerCase() && !item.sold
    );

    const formattedItems = await Promise.all(
      sellerItems.map(async (item) => {
        const tokenURI = await nftContract.tokenURI(item.tokenId);
        const metadata = await ipfsUtils.getMetadataFromIPFS(tokenURI);
        const creator = await nftContract.getCreator(item.tokenId);

        return {
          itemId: item.itemId.toString(),
          tokenId: item.tokenId.toString(),
          seller: item.seller,
          owner: item.owner,
          creator: creator,
          price: ethers.utils.formatEther(item.price),
          sold: item.sold,
          tokenURI,
          metadata,
        };
      })
    );

    res.json(formattedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
