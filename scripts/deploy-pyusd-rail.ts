import { ethers } from "hardhat";

async function main() {
  const token = process.env.PYUSD_SEPOLIA!;
  const Rail = await ethers.getContractFactory("PYUSDHandler");
  const rail = await Rail.deploy(token);
  await rail.waitForDeployment();
  console.log("PYUSDHandler:", await rail.getAddress());
}
main().catch((e) => { console.error(e); process.exit(1); });
