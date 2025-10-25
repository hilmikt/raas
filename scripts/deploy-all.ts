import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { ethers } from "hardhat";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function writeAddressesFile(addresses: Record<string, string>) {
  const target = path.resolve(__dirname, "..", "frontend", "app", "config", "addresses.local.json");
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(addresses, null, 2) + "\n", { encoding: "utf8" });
}

async function main() {
  requireEnv("PRIVATE_KEY");
  requireEnv("SEPOLIA_RPC");
  const pyusd = requireEnv("PYUSD_ADDRESS");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  const Reputation = await ethers.getContractFactory("Reputation");
  const PYUSDHandler = await ethers.getContractFactory("PYUSDHandler");
  const KiraPayAdapter = await ethers.getContractFactory("KiraPayAdapter");
  const Escrow = await ethers.getContractFactory("Escrow");

  const reputation = await Reputation.deploy(ethers.ZeroAddress);
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log(`Reputation deployed: ${reputationAddress}`);

  const pyusdHandler = await PYUSDHandler.deploy(pyusd);
  await pyusdHandler.waitForDeployment();
  const pyusdHandlerAddress = await pyusdHandler.getAddress();
  console.log(`PYUSDHandler deployed: ${pyusdHandlerAddress}`);

  const kiraPayAdapter = await KiraPayAdapter.deploy();
  await kiraPayAdapter.waitForDeployment();
  const kiraPayAdapterAddress = await kiraPayAdapter.getAddress();
  console.log(`KiraPayAdapter deployed: ${kiraPayAdapterAddress}`);

  const escrow = await Escrow.deploy(pyusd, pyusdHandlerAddress, kiraPayAdapterAddress, reputationAddress);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log(`Escrow deployed: ${escrowAddress}`);

  const ESCROW_ROLE = ethers.id("ESCROW_ROLE");
  const grantTx = await reputation.grantRole(ESCROW_ROLE, escrowAddress);
  await grantTx.wait();
  console.log("Reputation ESCROW_ROLE granted to Escrow");

  if (typeof pyusdHandler.allowEscrow === "function") {
    const tx = await pyusdHandler.allowEscrow(escrowAddress, true);
    await tx.wait();
    console.log("PYUSDHandler.allowEscrow(escrow, true)");
  }

  if (typeof kiraPayAdapter.allowEscrow === "function") {
    const tx = await kiraPayAdapter.allowEscrow(escrowAddress, true);
    await tx.wait();
    console.log("KiraPayAdapter.allowEscrow(escrow, true)");
  }

  const summary = {
    Escrow: escrowAddress,
    Reputation: reputationAddress,
    PYUSDHandler: pyusdHandlerAddress,
    KiraPayAdapter: kiraPayAdapterAddress,
  };

  if (process.argv.includes("--write-addresses")) {
    writeAddressesFile({ ...summary, PYUSD: pyusd });
    console.log(`Wrote addresses.local.json to /frontend/app/config`);
  }

  console.log(JSON.stringify(summary));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
