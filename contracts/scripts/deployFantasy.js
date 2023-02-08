// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const CryptoFantasyFactory = await hre.ethers.getContractFactory(
    "CryptoFantasy"
  );
  const Fantasy = await CryptoFantasyFactory.deploy();
  await Fantasy.init("0x61C1d559aadB9762EFEeB2b434875f4ba1Cd2EEc");

  try {
    await hre.run("verify:verify", {
      address: Fantasy.address,
      contract: "contracts/CryptoFantasy.sol:CryptoFantasy",
      network: "mumbai",
    });
  } catch (err) {}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});