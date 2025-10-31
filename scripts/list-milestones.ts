import { network } from "hardhat";

async function main() {
  const escrowAddress =
    process.env.ESCROW_ADDRESS ?? process.env.NEXT_PUBLIC_ESCROW ?? "";
  if (!escrowAddress) {
    throw new Error("ESCROW_ADDRESS (or NEXT_PUBLIC_ESCROW) required");
  }

  const { ethers } = await network.connect();
  const escrow = await ethers.getContractAt("Escrow", escrowAddress);

  const filter = escrow.filters.MilestoneCreated();
  const logs = await escrow.queryFilter(filter, 0, "latest");

  const clients = new Map<string, number>();
  logs.forEach((log) => {
    const client = log.args?.client;
    if (!client) return;
    clients.set(client, (clients.get(client) ?? 0) + 1);
  });

  console.log("Milestone counts per client:");
  for (const [client, count] of clients.entries()) {
    console.log(`${client}: ${count}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
