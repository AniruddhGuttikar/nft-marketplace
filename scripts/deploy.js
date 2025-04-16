const { ethers } = require("hardhat");

async function main() {
  // Get contract factories
  const NFT = await ethers.getContractFactory("NFT");
  const Royalty = await ethers.getContractFactory("Royalty");
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");

  // Deploy contracts
  console.log("Deploying NFT contract...");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  console.log("NFT contract deployed to:", await nft.getAddress());

  console.log("Deploying Royalty contract...");
  const royalty = await Royalty.deploy();
  await royalty.waitForDeployment();
  console.log("Royalty contract deployed to:", await royalty.getAddress());

  const [deployer] = await ethers.getSigners();
  console.log("Deploying NFTMarketplace contract...");
  const marketplace = await NFTMarketplace.deploy(
    await nft.getAddress(),
    await royalty.getAddress(),
    deployer.address // Fee receiver address
  );
  await marketplace.waitForDeployment();
  console.log(
    "NFTMarketplace contract deployed to:",
    await marketplace.getAddress()
  );

  // Save the contract addresses
  saveContractAddresses({
    nft: await nft.getAddress(),
    royalty: await royalty.getAddress(),
    marketplace: await marketplace.getAddress(),
  });

  console.log("Deployment complete!");
}

// Save contract addresses to a file
function saveContractAddresses(addresses) {
  const fs = require("fs");
  const path = require("path");

  // Create config directory if it doesn't exist
  const configDir = path.join(__dirname, "../config");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }

  // Save addresses to contracts.js
  const contractsPath = path.join(configDir, "contracts.js");
  const content = `
module.exports = {
  nft: "${addresses.nft}",
  royalty: "${addresses.royalty}",
  marketplace: "${addresses.marketplace}"
};
  `;

  fs.writeFileSync(contractsPath, content.trim());
  console.log("Contract addresses saved to:", contractsPath);
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
