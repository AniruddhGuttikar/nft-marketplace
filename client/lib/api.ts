// API functions to interact with the backend

const API_BASE_URL = "http://localhost:3001";

// Get all NFTs
export async function getAllNFTs() {
  const response = await fetch(`${API_BASE_URL}/api/nfts`);
  if (!response.ok) {
    throw new Error("Failed to fetch NFTs");
  }
  return response.json();
}

// Get NFT by token ID
export async function getNFTByTokenId(tokenId: string) {
  const response = await fetch(`${API_BASE_URL}/api/nfts/${tokenId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch NFT");
  }
  return response.json();
}

// Create a new NFT
export async function createNFT(nftData: any) {
  console.log("createNFT: ", nftData);
  const response = await fetch(`${API_BASE_URL}/api/nfts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nftData),
  });
  if (!response.ok) {
    throw new Error("Failed to create NFT");
  }
  return response.json();
}

// Get NFTs by creator address
export async function getNFTsByCreator(address: string) {
  const response = await fetch(`${API_BASE_URL}/api/nfts/creator/${address}`);
  if (!response.ok) {
    throw new Error("Failed to fetch creator NFTs");
  }
  return response.json();
}

// Upload NFT image to IPFS
export async function uploadNFTImage(file: File) {
  console.log("uploadNFTImage: ", file);
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/api/nfts/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to upload image");
    return response.json();
  }
}

// Get all marketplace items
export async function getAllMarketplaceItems() {
  const response = await fetch(`${API_BASE_URL}/api/marketplace/items`);
  if (!response.ok) {
    throw new Error("Failed to fetch marketplace items");
  }
  return response.json();
}

// Get marketplace item by ID
export async function getMarketplaceItemById(itemId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/marketplace/items/${itemId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch marketplace item");
  }
  return response.json();
}

// Create a new marketplace item
export async function createMarketplaceItem(itemData: any) {
  const response = await fetch(`${API_BASE_URL}/api/marketplace/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) {
    throw new Error("Failed to create marketplace item");
  }
  return response.json();
}

// Get items owned by address
export async function getItemsByOwner(address: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/marketplace/owner/${address}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch owned items");
  }
  return response.json();
}

// Get items listed by seller
export async function getItemsBySeller(address: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/marketplace/seller/${address}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch seller items");
  }
  return response.json();
}

// Get user profile
export async function getUserProfile(address: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/${address}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }
  return response.json();
}

// Get user's NFT collection
export async function getUserNFTs(address: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/${address}/nfts`);
  if (!response.ok) {
    throw new Error("Failed to fetch user NFTs");
  }
  return response.json();
}

// Get NFTs created by user
export async function getUserCreatedNFTs(address: string) {
  const response = await fetch(`${API_BASE_URL}/api/users/${address}/created`);
  if (!response.ok) {
    throw new Error("Failed to fetch created NFTs");
  }
  return response.json();
}
