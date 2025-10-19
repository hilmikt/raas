import "dotenv/config";
import { network } from "hardhat";

async function main() {
  const token = process.env.PYUSD_SEPOLIA;
  if (!token) throw new Error("Missing PYUSD_SEPOLIA in env");

  const connection = await network.connect();
  const { ethers } = connection;

  try {
    const Rail = await ethers.getContractFactory("PYUSDHandler");
    const rail = await Rail.deploy(token);
    await rail.waitForDeployment();
    console.log("PYUSDHandler:", await rail.getAddress());
  } finally {
    await connection.close();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
