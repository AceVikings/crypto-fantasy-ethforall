// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract AddressRegistry is Ownable {
    address[8] feeds;

    enum Tokens {
        BTC,
        DAI,
        ETH,
        LINK,
        MATIC,
        SAND,
        SOL,
        USDC
    }

    constructor() {
        feeds[uint(Tokens.BTC)] = 0x007A22900a3B98143368Bd5906f8E17e9867581b;
        feeds[uint(Tokens.DAI)] = 0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046;
        feeds[uint(Tokens.ETH)] = 0x0715A7794a1dc8e42615F059dD6e406A6594651A;
        feeds[uint(Tokens.LINK)] = 0x1C2252aeeD50e0c9B64bDfF2735Ee3C932F5C408;
        feeds[uint(Tokens.MATIC)] = 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada;
        feeds[uint(Tokens.SAND)] = 0x9dd18534b8f456557d11B9DDB14dA89b2e52e308;
        feeds[uint(Tokens.SOL)] = 0xEB0fb293f368cE65595BeD03af3D3f27B7f0BD36;
        feeds[uint(Tokens.USDC)] = 0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0;
    }

    function getPrice(uint token) external view returns (uint) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(feeds[token]);
        // prettier-ignore
        (
            /* uint80 roundID */,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return uint(price);
    }

    function getAllPrices() external view returns (uint[] memory) {
        uint[] memory prices = new uint[](feeds.length);
        for (uint i = 0; i < feeds.length; i++) {
            AggregatorV3Interface priceFeed = AggregatorV3Interface(
                feeds[uint(Tokens.BTC)]
            );
            // prettier-ignore
            (
            /* uint80 roundID */,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
            prices[i] = uint(price);
        }
        return prices;
    }
}
