// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IRegistry {
    function getAllPrices() external view returns (uint[] memory);

    function getPrice(uint token) external view returns (uint);
}
