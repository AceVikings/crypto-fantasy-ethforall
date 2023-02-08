require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  settings: {
    outputSelection: {
      "*": {
        "*": ["storageLayout"],
      },
    },
  },
  networks: {
    mumbai: {
      url: `${process.env.MATIC_RPC}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: `${process.env.POLYGONSCAN_KEY}`,
    },
  },
};
