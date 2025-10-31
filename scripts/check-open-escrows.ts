import { network } from "hardhat";

async function main() {
  const owner = process.env.ESCROW_OWNER ?? "";
  if (!owner) {
    throw new Error("Set ESCROW_OWNER env to the address you want to inspect.");
  }

  const escrowAddress =
    process.env.ESCROW_ADDRESS ?? process.env.NEXT_PUBLIC_ESCROW ?? "";
  if (!escrowAddress) {
    throw new Error("Set ESCROW_ADDRESS (or NEXT_PUBLIC_ESCROW) to the escrow contract address.");
  }

  const { ethers } = await network.connect();
  const escrow = await ethers.getContractAt("Escrow", escrowAddress);

  const result = await escrow.getOpenEscrows(owner);
  const formatted = result.map((item) => ({
    id: item.id.toString(),
    client: item.client,
    worker: item.worker,
    amount: item.amount.toString(),
    ref: item.ref,
    rail: Number(item.rail),
    funded: item.funded,
    released: item.released,
    canceled: item.canceled,
  }));

  console.log(JSON.stringify(formatted, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
