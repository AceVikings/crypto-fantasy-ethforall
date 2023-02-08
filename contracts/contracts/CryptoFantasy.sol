// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "./Interfaces/IRegistry.sol";

/// @title CryptoFantasy
/// @author Ace (EzTools.one)
/// @notice Prototype Crypto Fantasy game for EthForAll Hackathon
contract CryptoFantasy is ERC721EnumerableUpgradeable {
    IRegistry REGISTRY;
    uint FEE;
    uint startTime;

    uint[][] priceSnapshot;
    uint[] sortedIndex;
    mapping(uint => uint) public userBalance;
    mapping(uint => mapping(uint => uint)) public userPortfolio; //token index > amount owned
    mapping(uint => uint) public totalPortfolio;

    function init(address _registry) external initializer {
        FEE = 0.01 ether;
        startTime = block.timestamp;
        REGISTRY = IRegistry(_registry);
        __ERC721_init(
            string(abi.encodePacked("CryptoFantasy", block.timestamp)),
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
        uint amount = (amountToSpend * decimals) / priceSnapshot[0][_index];
        userPortfolio[tokenId][_index] = amount;
        totalPortfolio[_index] += amount;
    }

    function endCompetition() external {
        require(priceSnapshot.length == 1, "Already ended");
        require(block.timestamp > startTime + 1 days, "Not over");
        takeSnapshot();
        calculateDelta();
    }

    function calculateDelta() private {
        int[] memory delta = new int[](priceSnapshot[0].length);
        for (uint i = 0; i < priceSnapshot[0].length; i++) {
            delta[i] = (int(priceSnapshot[1][i]) - int(priceSnapshot[0][i]));
        }
    }

    function sortIndex(int[] memory delta) private {
        uint[] memory index = insertionSort(delta);
    }

    function insertionSort(
        int[] memory a
    ) private view returns (uint[] memory) {
        uint[] memory index = new uint[](a.length);
        for (uint i = 0; i < a.length; i++) {
            index[i] = i;
        }
        for (uint i = 1; i < a.length; i++) {
            int temp = a[i];
            uint indTemp = index[i];
            int j;

            for (j = int(i) - 1; j >= 0 && temp < a[uint(j)]; j--) {
                a[uint(j + 1)] = a[uint(j)];
                index[uint(j + 1)] = index[uint(j)];
            }
            a[uint(j + 1)] = temp;
            index[uint(j + 1)] = indTemp;
        }
        return index;
    }

    function takeSnapshot() private {
        uint[] memory prices = REGISTRY.getAllPrices();
        priceSnapshot.push(prices);
    }

    function getSnapshot(uint index) external view returns (uint[] memory) {
        return priceSnapshot[index];
    }
}
