//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract FToken is ERC20Upgradeable {
    address minterAddress;

    function init() external initializer {
        minterAddress = msg.sender;
        __ERC20_init("FToken", "FTK");
    }
}
