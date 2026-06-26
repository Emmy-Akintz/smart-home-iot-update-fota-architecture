const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { ethers } = require('ethers');
const cors = require('cors');
require('dotenv').config();

// Load the ABI we saved from Remix
const contractABI = require('./abi.json');

const app = express();
app.use(cors());
app.use(express.json());

// Set up Multer to handle file uploads in memory (perfect for hashing)
const upload = multer({ storage: multer.memoryStorage() });

// Blockchain Setup
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

/**
 * API Endpoint: Upload Firmware & Publish Hash
 * Route: POST /upload-firmware
 */
app.post('/upload-firmware', upload.single('firmwareFile'), async (req, res) => {
    try {
        const file = req.file;
        const version = req.body.version;

        if (!file || !version) {
            return res.status(400).json({ error: "Missing file or firmware version" });
        }

        console.log(`Processing update for version: ${version}...`);

        // 1. Calculate the SHA-256 hash of the uploaded file
        const hashSum = crypto.createHash('sha256');
        hashSum.update(file.buffer);
        const sha256Hash = hashSum.digest('hex');
        
        console.log(`Generated SHA-256 Hash: ${sha256Hash}`);
        console.log("Publishing to Sepolia Blockchain...");

        // 2. Publish the hash to the smart contract
        const tx = await contract.publishFirmwareHash(version, sha256Hash);
        
        console.log(`Transaction sent! Waiting for confirmation... Hash: ${tx.hash}`);
        await tx.wait(); // Wait for the block to be mined

        console.log("Successfully published to the blockchain!");

        // 3. Return success response
        res.status(200).json({
            message: "Firmware hash successfully anchored to the blockchain.",
            version: version,
            hash: sha256Hash,
            transactionHash: tx.hash
        });

    } catch (error) {
        console.error("Error publishing firmware:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🛠️ Manufacturer Server running on http://localhost:${PORT}`);
});