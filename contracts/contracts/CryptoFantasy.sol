// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "./Interfaces/IRegistry.sol";

/// @title CryptoFantasy
/// @author Ace (EzTools.one)
/// @notice Prototype Crypto Fantasy game for EthForAll Hackathon
contract CryptoFantasy is ERC721EnumerableUpgradeable {
    IRegistry REGISTRY;
    uint FEE;
    uint startTime;

    uint[][] priceSnapshot;
    mapping(uint => uint) public userBalance;
    mapping(uint => mapping(uint => uint)) public userPortfolio; //token index > amount owned

    function init(uint _startTime, address _registry) external initializer {
        FEE = 0.01 ether;
        startTime = _startTime;
        REGISTRY = IRegistry(_registry);

        __ERC721_init(
            string(abi.encodePacked("CryptoFantasy", _startTime)),
            "CPF"
        );
        takeSnapshot();
    }

    function register() external payable {
        require(msg.value == FEE, "Fee not paid");
        _mint(msg.sender, totalSupply() + 1);
        userBalance[totalSupply()] = 20000e8;
    }

    function buyToken(uint tokenId, uint _index, uint amountToSpend) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(block.timestamp <= startTime + 1 days, "Purchase period over");
        require(userBalance[tokenId] >= amountToSpend, "Not enough balance");
        require(priceSnapshot[0][_index] != 0, "Invalid index");
        uint decimals = 10 ** 8;
        userBalance[tokenId] -= amountToSpend;
        userPortfolio[tokenId][_index] =
            (amountToSpend * decimals) /
            priceSnapshot[0][_index];
    }

    function takeSnapshot() private {
        uint[] memory prices = REGISTRY.getAllPrices();
        priceSnapshot.push(prices);
    }

    function getSnapshot(uint index) external view returns (uint[] memory) {
        return priceSnapshot[index];
    }
}
