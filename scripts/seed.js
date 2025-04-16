const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Import contract addresses
const contractAddresses = require("../config/contracts");

// Sample NFT metadata
const sampleNFTs = [
  {
    name: "Osamu Miya",
    description:
      "Co-founder of Miya Twins' Onigiri Shop. Calm, practical, and secretly a beast on the court.",
    image: "ipfs://bafkreiegifj47jmfknzhmrzbqlm7nnb5v5dv3fjweddfw3m52r6mkjcubi",
    attributes: [
      { trait_type: "Team", value: "Inarizaki High" },
      { trait_type: "Position", value: "Wing Spiker" },
      { trait_type: "Personality", value: "Chill Strategist" },
      { trait_type: "Special Trait", value: "Deadly Twin Sync" },
    ],
  },
  {
    name: "Kuroo Tetsurō",
    description:
      "Nekoma's cunning captain, master of mind games and the Blocker you never see coming.",
    image: "ipfs://bafkreifcjuw5gjg4vv6ovy6m2ag3sayfi33tyzhzp66lzzotzyx2xqbq4m",
    attributes: [
      { trait_type: "Team", value: "Nekoma High" },
      { trait_type: "Position", value: "Middle Blocker" },
      { trait_type: "Personality", value: "Tactical Tease" },
      { trait_type: "Special Trait", value: "Iron Wall Smirk" },
    ],
  },
  {
    name: "Tadashi Yamaguchi",
    description:
      "The pinch server who rose from insecurity to deadly precision. Quiet, loyal, and always improving.",
    image: "ipfs://bafkreie3nkm5fqrzr6t7f4jtne4nui2lz5gshccfx3ipbq5xettov7qy4y",
    attributes: [
      { trait_type: "Team", value: "Karasuno High" },
      { trait_type: "Position", value: "Pinch Server" },
      { trait_type: "Personality", value: "Loyal Underdog" },
      { trait_type: "Special Trait", value: "Jump Float Ace" },
    ],
  },
];

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Seeding marketplace with account:", deployer.address);

  // Get contract instances
  const NFT = await ethers.getContractFactory("NFT");
  const nft = NFT.attach(contractAddresses.nft);

  const Royalty = await ethers.getContractFactory("Royalty");
  const royalty = Royalty.attach(contractAddresses.royalty);

  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = NFTMarketplace.attach(contractAddresses.marketplace);

  // Create sample NFTs and list them on the marketplace
  for (let i = 0; i < sampleNFTs.length; i++) {
    // Create metadata file
    const metadataDir = path.join(__dirname, "../metadata");
    if (!fs.existsSync(metadataDir)) {
      fs.mkdirSync(metadataDir);
    }

    const metadataPath = path.join(metadataDir, `nft${i + 1}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(sampleNFTs[i], null, 2));

    // In a real scenario, you would upload this metadata to IPFS
    // For now, we'll use a mock URI
    // const tokenURI = sampleNFTs[i].image;
    const tokenURI = `ipfs://QmSampleHash${i + 1}`;

    console.log(`Creating NFT ${i + 1}...`);
    const tx1 = await nft.createToken(tokenURI);
    const receipt1 = await tx1.wait();

    // console.log(receipt1.logs);

    // Get token ID from event
    const logs = receipt1.logs;
    let tokenId;
    // Parse each log
    for (const log of logs) {
      // Try to decode it using the NFT contract interface
      try {
        const parsedLog = nft.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        // Check if this is the TokenCreated event
        if (parsedLog.name === "TokenCreated") {
          tokenId = parsedLog.args.tokenId;
          break;
        }
      } catch (error) {
        // This log is not from our contract or not parsable - skip it
        continue;
      }
    }

    if (!tokenId) {
      // If we couldn't find the event, try getting the last minted token ID
      tokenId = await nft.getLastTokenId();

      // If your contract doesn't have such a method, you could try:
      // tokenId = await nft.tokenCounter() - 1;  // Assuming your contract keeps track of minted tokens
    }

    console.log(`NFT ${i + 1} created with Token ID: ${tokenId}`);

    // Set royalty percentage (2.5%)
    await royalty.setRoyaltyPercentage(tokenId, 250);
    console.log(`Royalty set for Token ID: ${tokenId}`);

    // Approve marketplace to transfer the NFT
    await nft.approve(marketplace, tokenId);
    console.log(`Marketplace approved for Token ID: ${tokenId}`);

    // List NFT on marketplace
    const priceInWei = ethers.parseEther((i + 1).toString()); // 1 ETH, 2 ETH, etc.
    await marketplace.createMarketItem(tokenId, priceInWei);
    console.log(`NFT listed on marketplace for ${i + 1} ETH`);
  }

  console.log("Seeding complete!");
}

// Run the seeding
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
