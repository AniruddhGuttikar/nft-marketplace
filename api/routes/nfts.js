const express = require("express");
const router = express.Router();
const nftController = require("../controllers/nft.controller");

/**
 * @route GET /api/nfts
 * @desc Get all NFTs
 * @access Public
 */
router.get("/", nftController.getAllNFTs);

/**
 * @route GET /api/nfts/:tokenId
 * @desc Get NFT by token ID
 * @access Public
 */
router.get("/:tokenId", nftController.getNFTByTokenId);

/**
 * @route POST /api/nfts
 * @desc Create a new NFT
 * @access Public
 */
router.post("/", nftController.createNFT);

/**
 * @route GET /api/nfts/creator/:address
 * @desc Get NFTs by creator address
 * @access Public
 */
router.get("/creator/:address", nftController.getNFTsByCreator);

/**
 * @route POST /api/nfts/upload
 * @desc Upload NFT image to IPFS
 * @access Public
 */
router.post("/upload", nftController.uploadToIPFS);

module.exports = router;
