const ReputationAbi = [
  {
    type: "function",
    name: "score",
    inputs: [{ name: "actor", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addEscrow",
    inputs: [{ name: "escrow", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export default ReputationAbi;
