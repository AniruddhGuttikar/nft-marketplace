const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

/**
 * @route GET /api/users/:address
 * @desc Get user profile
 * @access Public
 */
router.get("/:address", userController.getUserProfile);

/**
 * @route GET /api/users/:address/nfts
 * @desc Get user's NFT collection
 * @access Public
 */
router.get("/:address/nfts", userController.getUserNFTs);

/**
 * @route GET /api/users/:address/created
 * @desc Get NFTs created by user
 * @access Public
 */
router.get("/:address/created", userController.getCreatedNFTs);

/**
 * @route GET /api/users/:address/sales
 * @desc Get user's sales history
 * @access Public
 */
router.get("/:address/sales", userController.getSalesHistory);

module.exports = router;
