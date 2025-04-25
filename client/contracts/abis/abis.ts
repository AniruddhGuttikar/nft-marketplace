import contractAddresses, { royalty } from "../../../config/contracts";
import nftAbi from "../../../artifacts/contracts/NFT.sol/NFT.json";
import royaltyAbi from "../../../artifacts/contracts/Royalty.sol/Royalty.json";
import marketplaceAbi from "../../../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

const abis = {
  nft: nftAbi.abi,
  royalty: royaltyAbi.abi,
  marketplace: marketplaceAbi.abi,
};

export { contractAddresses, abis };
