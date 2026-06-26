# Live Sepolia Dashboard — Demo Setup

The dashboard ([index.html](index.html)) reads firmware hashes from your deployed `FirmwareRegistry` on Sepolia and also includes the manufacturer upload form. No private keys are used in the browser.

## Prerequisites

- Node.js installed
- `.env` configured with `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, and `CONTRACT_ADDRESS`
- Contract deployed at `0xff546E51B1a346ED124930f519bAdA1C7fF68540`

## 1. Publish firmware versions (manufacturer write path)

```bash
node server.js
```

Open [index.html](index.html) in the browser (via a local server or file open). For each version in `KNOWN_VERSIONS` (`v1.0.0` … `v1.0.3`):

1. Enter the version string exactly (e.g. `v1.0.3`)
2. Select a firmware file (e.g. `test-firmware.txt` or different files per version)
3. Click **Upload & Publish to Blockchain**
4. Wait for the transaction to confirm (a few seconds per upload)

Each version can only be published once per contract. Use a new version string or redeploy the contract if you need to republish.

## 2. Verify on Etherscan

Open the contract read tab:

https://sepolia.etherscan.io/address/0xff546E51B1a346ED124930f519bAdA1C7fF68540#readContract

Call `getFirmwareHash` with each version string and confirm the returned SHA-256 matches what you uploaded.

## 3. Run the live dashboard

Serve the project over HTTP (recommended — avoids CORS issues with some RPC endpoints):

```bash
npx serve .
```

Then open: `http://localhost:3000/index.html` (port may vary — check terminal output).

On load, the registry table should fill from Sepolia. The header badge should show **Sepolia Testnet: Live (N/4)**.

## 4. Simulation buttons

| Button | Behavior |
|--------|----------|
| **Simulate Secure Update Path** | Uses the on-chain hash for `DEMO_VERSION` (`v1.0.3` by default) as the local hash, queries Sepolia live, shows match + success banner |
| **Simulate MITM Attack Path** | Loads `test-firmware-tampered.txt`, hashes it in-browser, queries Sepolia live, shows mismatch + block banner |

Change `DEMO_VERSION` in `index.html` if your demo uses a different published version.

## 5. Troubleshooting

| Issue | Fix |
|-------|-----|
| Registry shows "Not on chain" | Publish that version via `index.html` + `server.js` |
| "Connecting..." never becomes Live | Try fallback RPC in code (`publicnode.com`); serve over HTTP not `file://` |
| Secure button says not on chain | Set `DEMO_VERSION` to a version you published; refresh page after publishing |
| RPC rate limit | Wait and refresh; or switch `SEPOLIA_RPC` in `index.html` |

## Security note for examiners

- **Dashboard (`index.html`)**: read-only dashboard plus manufacturer upload form — contract address + public RPC only
- **Manufacturer (`server.js`)**: write-only — private key stays in `.env` on the server
