import "dotenv/config";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { network } from "hardhat";

async function upsertEnvLocal(updates: Record<string,string>) {
  const path = ".env.local";
  let content = existsSync(path) ? readFileSync(path, "utf8") : "";
  const lines = content.split(/\r?\n/).filter(Boolean);
  const map = new Map<string,string>();
  for (const line of lines) {
    const i = line.indexOf("=");
    if (i > -1) map.set(line.slice(0,i), line.slice(i+1));
  }
  for (const [k,v] of Object.entries(updates)) map.set(k, v);
  const out = Array.from(map.entries()).map(([k,v]) => `${k}=${v}`).join("\n") + "\n";
  writeFileSync(path, out);
}

async function main() {
  const connection = await network.connect();
  const { ethers, networkName } = connection;

  try {
    const pyusdToken = process.env.PYUSD_SEPOLIA;
    if (!pyusdToken) throw new Error("Missing PYUSD_SEPOLIA in .env");

    const Rail = await ethers.getContractFactory("PYUSDHandler");
    const Kira = await ethers.getContractFactory("KiraPayAdapter");
    const Rep  = await ethers.getContractFactory("Reputation");
    const Esc  = await ethers.getContractFactory("Escrow");

    const pyusdHandler = await Rail.deploy(pyusdToken);
    await pyusdHandler.waitForDeployment();
    const pyusdHandlerAddr = await pyusdHandler.getAddress();

    const kiraPayAdapter = await Kira.deploy();
    await kiraPayAdapter.waitForDeployment();
    const kiraPayAdapterAddr = await kiraPayAdapter.getAddress();

    const reputation = await Rep.deploy(ethers.ZeroAddress);
    await reputation.waitForDeployment();
    const reputationAddr = await reputation.getAddress();

    const escrow = await Esc.deploy(pyusdToken, pyusdHandlerAddr, kiraPayAdapterAddr, reputationAddr);
    await escrow.waitForDeployment();
    const escrowAddr = await escrow.getAddress();

    // wire roles / allowlists
    const repTx = await reputation.addEscrow(escrowAddr);
    await repTx.wait();

    const allowPy = await (await ethers.getContractAt("PYUSDHandler", pyusdHandlerAddr)).allowEscrow(escrowAddr, true);
    await allowPy.wait();

    const allowKira = await (await ethers.getContractAt("KiraPayAdapter", kiraPayAdapterAddr)).allowEscrow(escrowAddr, true);
    await allowKira.wait();

    const result = {
      network: networkName,
      pyusdToken,
      pyusdHandler: pyusdHandlerAddr,
      kiraPayAdapter: kiraPayAdapterAddr,
      reputation: reputationAddr,
      escrow: escrowAddr
    };

    console.log(JSON.stringify(result, null, 2));

    await upsertEnvLocal({
      PYUSD_HANDLER: pyusdHandlerAddr,
      KIRAPAY_ADAPTER: kiraPayAdapterAddr,
      REPUTATION: reputationAddr,
      ESCROW: escrowAddr
    });

    console.log("\nSummary:");
    console.log(`PYUSDHandler:   ${pyusdHandlerAddr}`);
    console.log(`KiraPayAdapter: ${kiraPayAdapterAddr}`);
    console.log(`Reputation:     ${reputationAddr}`);
    console.log(`Escrow:         ${escrowAddr}`);
    console.log("\nNote: IPaymentRail is an interface (no deployment address).");
  } finally {
    await connection.close();
  }
}

main().catch((e) => {
  console.error("Deployment failed:", e);
  process.exit(1);
});
