import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import EscrowAbi from "../frontend/app/lib/abi/Escrow";

async function main() {
  const owner = process.env.ESCROW_OWNER as `0x${string}` | undefined;
  const escrowAddress = process.env.ESCROW_ADDRESS as `0x${string}` | undefined;

  if (!owner) throw new Error("ESCROW_OWNER env required");
  if (!escrowAddress) throw new Error("ESCROW_ADDRESS env required");

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? process.env.SEPOLIA_RPC;
  if (!rpcUrl) throw new Error("Provide NEXT_PUBLIC_RPC_URL or SEPOLIA_RPC env");

  const client = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  });

  const data = await client.readContract({
    address: escrowAddress,
    abi: EscrowAbi,
    functionName: "getOpenEscrows",
    args: [owner],
    account: owner,
  });

  console.log(data);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
