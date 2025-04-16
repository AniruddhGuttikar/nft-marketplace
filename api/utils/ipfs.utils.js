const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

// Pinata API keys
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;

/**
 * Upload file to IPFS using Pinata
 * @param {Buffer} fileData - File data buffer
 * @returns {Promise<{cid: string}>} - IPFS CID
 */
exports.uploadFileToIPFS = async (fileData) => {
  try {
    const formData = new FormData();
    formData.append("file", fileData);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataApiSecret,
        },
      }
    );

    return { cid: response.data.IpfsHash };
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw new Error("Failed to upload file to IPFS");
  }
};

/**
 * Upload metadata to IPFS using Pinata
 * @param {Object} metadata - Metadata object
 * @returns {Promise<string>} - IPFS CID
 */
exports.uploadMetadataToIPFS = async (metadata) => {
  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataApiSecret,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
};

/**
 * Get metadata from IPFS
 * @param {string} tokenURI - IPFS URI
 * @returns {Promise<Object>} - Metadata object
 */
exports.getMetadataFromIPFS = async (tokenURI) => {
  try {
    // Extract CID from token URI
    let cid;
    if (tokenURI.startsWith("ipfs://")) {
      cid = tokenURI.replace("ipfs://", "");
    } else {
      return { error: "Invalid IPFS URI" };
    }

    // Fetch from IPFS gateway
    const response = await axios.get(
      `https://gateway.pinata.cloud/ipfs/${cid}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching metadata from IPFS:", error);
    return { error: "Failed to fetch metadata from IPFS" };
  }
};
