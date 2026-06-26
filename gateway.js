const fs = require('fs');
const crypto = require('crypto');
const { ethers } = require('ethers');
const { performance } = require('perf_hooks'); // NEW: Import the high-resolution timer
require('dotenv').config();

const contractABI = require('./abi.json');

async function verifyFirmwareUpdate(version, filePath) {
    console.log(`\n📡 --- Gateway Verification Process Started ---`);
    console.log(`Checking version: ${version}`);
    
    try {
        // ⏱️ START TOTAL TIMER
        const totalStartTime = performance.now();

        // ---------------------------------------------------------
        // 1. LOCAL HASHING PHASE
        // ---------------------------------------------------------
        const hashStartTime = performance.now();
        
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const localHash = hashSum.digest('hex');
        
        const hashEndTime = performance.now();
        const localHashingTime = hashEndTime - hashStartTime;

        console.log(`[Gateway] Local SHA-256 Hash computed: ${localHash}`);
        
        // ---------------------------------------------------------
        // 2. BLOCKCHAIN QUERY PHASE
        // ---------------------------------------------------------
        console.log(`\n[Gateway] Querying Sepolia Blockchain for trusted hash...`);
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);

        const bcStartTime = performance.now();
        
        const blockchainHash = await contract.getFirmwareHash(version);
        
        const bcEndTime = performance.now();
        const blockchainQueryTime = bcEndTime - bcStartTime;

        console.log(`[Blockchain] Trusted Hash retrieved:     ${blockchainHash}`);

        // ⏱️ END TOTAL TIMER
        const totalEndTime = performance.now();
        const totalTime = totalEndTime - totalStartTime;

        // ---------------------------------------------------------
        // 3. THE LOGIC GATE
        // ---------------------------------------------------------
        console.log(`\n🔍 --- Verification Result ---`);
        if (localHash === blockchainHash) {
            console.log(`✅ SUCCESS: Hashes match exactly! Firmware is authentic and safe.`);
        } else {
            console.log(`❌ SECURITY ALERT: Hashes DO NOT match!`);
        }

        // ---------------------------------------------------------
        // 4. CHAPTER 4 EVALUATION DATA
        // ---------------------------------------------------------
        console.log(`\n📊 --- Performance Metrics (For Chapter 4) ---`);
        console.log(`- Local Processing (Hashing): ${localHashingTime.toFixed(2)} ms`);
        console.log(`- Network Processing (Blockchain): ${blockchainQueryTime.toFixed(2)} ms`);
        console.log(`- Total Gateway Verification Time: ${totalTime.toFixed(2)} ms`);
        console.log(`----------------------------------------------\n`);

    } catch (error) {
        console.error(`❌ Verification failed...`, error.message);
    }
}

// Make sure your version and file path match what you uploaded!
verifyFirmwareUpdate("v1.0.0", "./test-firmware.txt");