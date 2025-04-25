import { ethers } from "ethers";
import { contractAddresses, abis } from "./abis/abis";
import { nft } from "../../config/contracts";

async function connectToContracts() {
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const nftContract = new ethers.Contract(
    contractAddresses.nft,
    abis.nft,
    signer
  );
  const marketplaceContract = new ethers.Contract(
    contractAddresses.marketplace,
    abis.marketplace,
    signer
  );

  const royaltyContract = new ethers.Contract(
    contractAddresses.royalty,
    abis.royalty,
    signer
  );

  return {
    provider,
    signer,
    nftContract,
    marketplaceContract,
    royaltyContract,
  };
}

export { connectToContracts };
