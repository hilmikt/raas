import { network } from "hardhat";

async function main() {
  const connection = await network.connect();
  const { ethers } = connection;

  try {
    const [deployer] = await ethers.getSigners();
    const bal = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer:", deployer.address);
    console.log("Balance (wei):", bal.toString());
  } finally {
    await connection.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
