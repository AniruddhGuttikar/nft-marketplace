const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
require("dotenv").config();

// Import routes
const nftRoutes = require("./routes/nfts");
const marketplaceRoutes = require("./routes/marketplace");
const userRoutes = require("./routes/user");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(fileUpload());
// Routes
app.use("/api/nfts", nftRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/users", userRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "NFT Marketplace API Server",
    endpoints: {
      nfts: "/api/nfts",
      marketplace: "/api/marketplace",
      users: "/api/users",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
