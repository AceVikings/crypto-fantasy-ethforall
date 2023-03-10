// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const AddressRegistryFactory = await hre.ethers.getContractFactory(
    "AddressRegistry"
  );
  const Registry = await AddressRegistryFactory.deploy();

  console.log("Registry deployed at:", Registry.address);

  const CryptoFantasyFactory = await hre.ethers.getContractFactory(
    "CryptoFantasy"
  );
  const Fantasy = await CryptoFantasyFactory.deploy();
  await Fantasy.init(Registry.address);
  console.log("Fantasy deployed at:", Fantasy.address);
  await Fantasy.deployTransaction.wait(5);
  try {
    await hre.run("verify:verify", {
      address: Registry.address,
      contract: "contracts/AddressRegistry.sol:AddressRegistry",
      network: "mumbai",
    });
  } catch (err) {
    console.log(err);
  }

  try {
    await hre.run("verify:verify", {
      address: Fantasy.address,
      contract: "contracts/CryptoFantasy.sol:CryptoFantasy",
      network: "mumbai",
    });
  } catch (err) {
    console.log(err);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
