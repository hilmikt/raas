import { writeFileSync, existsSync, appendFileSync } from "fs";
import { network } from "hardhat";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Missing required env: ${name}`);
  }
  return v.trim();
}

async function main() {
  // 1) Read env
  const tokenAddress = requireEnv("PYUSD_SEPOLIA"); // can be PYUSD on Sepolia or a mock ERC20

  const connection = await network.connect();
  const { ethers, networkName } = connection;

  try {
    // 2) Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log("Network:", networkName);

    // 3) Deploy contracts (adjust names/namespaces if your artifacts are in subfolders)
    // Factories must match your actual contract names
    const Reputation = await ethers.getContractFactory("Reputation");
    const PYUSDHandler = await ethers.getContractFactory("PYUSDHandler");
    const KiraPayAdapter = await ethers.getContractFactory("KiraPayAdapter");
    const Escrow = await ethers.getContractFactory("Escrow");

    console.log("Deploying Reputation...");
    const reputation = await Reputation.deploy(ethers.ZeroAddress);
    await reputation.waitForDeployment();
    const reputationAddr = await reputation.getAddress();
    console.log("Reputation:", reputationAddr);

    console.log("Deploying PYUSDHandler:", tokenAddress);
    const rail = await PYUSDHandler.deploy(tokenAddress);
    await rail.waitForDeployment();
    const railAddr = await rail.getAddress();
    console.log("PYUSDHandler:", railAddr);

    console.log("Deploying KiraPayAdapter...");
    const kiraPayAdapter = await KiraPayAdapter.deploy();
    await kiraPayAdapter.waitForDeployment();
    const kiraPayAdapterAddr = await kiraPayAdapter.getAddress();
    console.log("KiraPayAdapter:", kiraPayAdapterAddr);

    console.log("Deploying Escrow...");
    // If your Escrow constructor expects different params, update here.
    // Common patterns: Escrow(reputation, payer, arbiter) or Escrow(reputation)
    const escrow = await Escrow.deploy(tokenAddress, railAddr, kiraPayAdapterAddr, reputationAddr);
    await escrow.waitForDeployment();
    const escrowAddr = await escrow.getAddress();
    console.log("Escrow:", escrowAddr);

    // 4) Optional: basic wiring if these functions exist. If not, you can comment them out safely.
    try {
      // @ts-ignore
      if (typeof rail.allowEscrow === "function") {
        // @ts-ignore
        const tx = await rail.allowEscrow(escrowAddr, true);
        await tx.wait();
        console.log("Rail.allowEscrow(escrow, true) done");
      }
      // @ts-ignore
      if (typeof kiraPayAdapter.allowEscrow === "function") {
        // @ts-ignore
        const tx = await kiraPayAdapter.allowEscrow(escrowAddr, true);
        await tx.wait();
        console.log("KiraPayAdapter.allowEscrow(escrow, true) done");
      }
      const addEscrowFn = (reputation as any).addEscrow;
      if (typeof addEscrowFn === "function") {
        const tx = await addEscrowFn(escrowAddr);
        await tx.wait();
        console.log("Reputation.addEscrow(escrow) done");
      }
    } catch (e) {
      console.warn("Skipping rail.allowEscrow wiring:", e);
    }

    // 5) Persist addresses to .env.local for the frontend
    const envLocalPath = path.join(process.cwd(), ".env.local");
    const lines = [
      `NEXT_PUBLIC_SEPOLIA_REPUTATION=${reputationAddr}`,
      `NEXT_PUBLIC_SEPOLIA_KIRAPAY_ADAPTER=${kiraPayAdapterAddr}`,
      `NEXT_PUBLIC_SEPOLIA_PYUSD_HANDLER=${railAddr}`,
      `NEXT_PUBLIC_SEPOLIA_ESCROW=${escrowAddr}`,
    ];
    const content = lines.join("\n") + "\n";

    if (!existsSync(envLocalPath)) {
      writeFileSync(envLocalPath, content, { encoding: "utf8" });
      console.log(".env.local created");
    } else {
      // append or replace: here we append so we don't disrupt other vars; frontend can pick the last occurrence
      appendFileSync(envLocalPath, "\n" + content, { encoding: "utf8" });
      console.log(".env.local updated");
    }

    // 6) Echo a summary at the end
    console.log("=== Deploy Summary (Sepolia) ===");
    console.log("Reputation:", reputationAddr);
    console.log("KiraPayAdapter:", kiraPayAdapterAddr);
    console.log("PYUSDHandler:", railAddr);
    console.log("Escrow:", escrowAddr);
  } finally {
    await connection.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
