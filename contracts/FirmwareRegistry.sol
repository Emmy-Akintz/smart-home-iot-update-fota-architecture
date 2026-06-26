// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FirmwareRegistry {
    address public manufacturer;

    struct Firmware {
        string version;
        string sha256Hash;
        uint256 timestamp;
    }

    mapping(string => Firmware) public firmwares;

    event FirmwarePublished(string version, string sha256Hash, uint256 timestamp);

    modifier onlyManufacturer() {
        require(msg.sender == manufacturer, "Access denied: Only the manufacturer can perform this action");
        _;
    }

    constructor() {
        manufacturer = msg.sender; 
    }

    function publishFirmwareHash(string memory _version, string memory _sha256Hash) public onlyManufacturer {
        require(bytes(firmwares[_version].version).length == 0, "Firmware version already exists");
        firmwares[_version] = Firmware({
            version: _version,
            sha256Hash: _sha256Hash,
            timestamp: block.timestamp
        });
        emit FirmwarePublished(_version, _sha256Hash, block.timestamp);
    }

    function getFirmwareHash(string memory _version) public view returns (string memory) {
        require(bytes(firmwares[_version].version).length != 0, "Firmware version not found on the blockchain");
        return firmwares[_version].sha256Hash;
    }
}