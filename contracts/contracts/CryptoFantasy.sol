// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./Interfaces/IRegistry.sol";

/// @title CryptoFantasy
/// @author Ace (EzTools.one)
/// @notice Prototype Crypto Fantasy game for EthForAll Hackathon
contract CryptoFantasy is ERC721EnumerableUpgradeable, OwnableUpgradeable {
    IRegistry REGISTRY;
    uint public FEE;
    uint public startTime;
    uint public buyDuration;
    uint[][] priceSnapshot;
    uint[] sortedIndex;
    uint[6] tokenReturn = [25, 20, 15, 10, 10, 5];
    uint public duration;
    uint public balance;
    bool public tournamentOver;
    bool public retrieved;
    mapping(uint => uint) public userBalance;
    mapping(uint => mapping(uint => uint)) public userPortfolio; //tokenId > token index > amount owned
    mapping(uint => uint) public totalPortfolio;

    function init(address _registry) external initializer {
        FEE = 0.01 ether;
        startTime = block.timestamp;
        REGISTRY = IRegistry(_registry);
        duration = 10 minutes;
        buyDuration = 7 minutes;
        __ERC721_init(
            string(
                abi.encodePacked(
                    "CryptoFantasy-",
                    block.timestamp,
                    "-",
                    block.timestamp + duration
                )
            ),
            "CPF"
        );
        __Ownable_init();
        takeSnapshot();
    }

    function register() external payable {
        require(msg.value == FEE, "Fee not paid");
        _mint(msg.sender, totalSupply() + 1);
        userBalance[totalSupply()] = 20000e8;
    }

    function buyToken(uint tokenId, uint _index, uint amountToSpend) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(
            block.timestamp <= startTime + buyDuration,
            "Purchase period over"
        );
        require(userBalance[tokenId] >= amountToSpend, "Not enough balance");
        require(priceSnapshot[0][_index] != 0, "Invalid index");
        userBalance[tokenId] -= amountToSpend;
        uint amount = getTokenAmount(amountToSpend, _index);
        userPortfolio[tokenId][_index] = amount;
        totalPortfolio[_index] += amount;
    }

    function endCompetition() external {
        require(priceSnapshot.length == 1, "Already ended");
        require(block.timestamp > startTime + duration, "Not over");
        balance = address(this).balance;
        takeSnapshot();
        addSortedIndex();
        tournamentOver = true;
    }

    function retrieveReward(uint tokenId) external {
        require(msg.sender == ownerOf(tokenId), "Sender not owner");
        require(tournamentOver, "Tournament not over yet");
        _burn(tokenId);
        uint amount = getReward(tokenId);
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }

    function getTokenAmount(
        uint amountToSpend,
        uint _index
    ) public view returns (uint) {
        uint decimals = 10 ** 8;
        return (amountToSpend * decimals) / priceSnapshot[0][_index];
    }

    function getReward(uint tokenId) public view returns (uint) {
        uint amount = 0;
        for (uint i = 0; i < tokenReturn.length; i++) {
            uint tokenIndex = sortedIndex[i];
            // userPortfolio/totalPortfolio * contractBalance * tokenReturn/100
            amount +=
                (userPortfolio[tokenId][tokenIndex] *
                    tokenReturn[i] *
                    balance) /
                (totalPortfolio[tokenIndex] * 100);
        }
        return amount;
    }

    function addSortedIndex() private {
        int[] memory delta = new int[](priceSnapshot[0].length);
        for (uint i = 0; i < priceSnapshot[0].length; i++) {
            delta[i] = (int(priceSnapshot[1][i]) - int(priceSnapshot[0][i]));
        }
        sortIndex(delta);
    }

    function sortIndex(int[] memory delta) private {
        uint[] memory index = insertionSort(delta);
        for (
            uint i = index.length - 1;
            i > index.length - tokenReturn.length - 1;
            i--
        ) {
            sortedIndex.push(index[i]);
        }
    }

    function insertionSort(
        int[] memory a
    ) private pure returns (uint[] memory) {
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

    function retrieveBalance() external onlyOwner {
        require(tournamentOver, "Not over");
        require(!retrieved, "Already retrieved");
        uint percentage = 0;
        for (uint i = 0; i < tokenReturn.length; i++) {
            percentage += tokenReturn[i];
        }
        (bool success, ) = payable(owner()).call{
            value: (balance * (100 - percentage)) / 100
        }("");
        require(success, "transfer failed");
    }

    /// @dev strictly dev function to retrieve ether dev spent on testing
    function retrieveDevBalance() external onlyOwner {
        (bool success, ) = payable(owner()).call{
            value: (address(this).balance) / 100
        }("");
        require(success, "transfer failed");
    }
}
