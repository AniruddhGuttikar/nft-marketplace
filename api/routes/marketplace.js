const express = require("express");
const router = express.Router();
const marketplaceController = require("../controllers/marketplace.controller");

/**
 * @route GET /api/marketplace/items
 * @desc Get all marketplace items
 * @access Public
 */
router.get("/items", marketplaceController.getAllMarketItems);

/**
 * @route GET /api/marketplace/items/:itemId
 * @desc Get marketplace item by ID
 * @access Public
 */
router.get("/items/:itemId", marketplaceController.getMarketItemById);

/**
 * @route POST /api/marketplace/items
 * @desc Create a new marketplace item
 * @access Public
 */
router.post("/items", marketplaceController.createMarketItem);

/**
 * @route GET /api/marketplace/owner/:address
 * @desc Get items owned by address
 * @access Public
 */
router.get("/owner/:address", marketplaceController.getItemsByOwner);

/**
 * @route GET /api/marketplace/seller/:address
 * @desc Get items listed by seller
 * @access Public
 */
router.get("/seller/:address", marketplaceController.getItemsBySeller);

module.exports = router;
